import type {
  Bitmap,
  PlatformCanvas,
  PlatformOffscreenCanvas,
} from "octopus-platform";
import { platform } from "../../platform";
import type {
  PainterActionModel,
  PainterMode,
  PlatformVideo,
  PLAYER_CONTENT_MODE,
} from "../../types";
import { Renderer2D, Renderer2DExtension } from "src/extensions";

const { noop } = platform;

export class Painter {
  /**
   * 主屏的 Canvas 元素
   * Front Screen
   */
  public F: PlatformCanvas | PlatformOffscreenCanvas | null = null;

  /**
   * 主屏的 Context 对象
   * Front Context
   */
  public FC:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;

  /**
   * 副屏的 Canvas 元素
   * Background Screen
   */
  public B: PlatformCanvas | PlatformOffscreenCanvas | null = null;

  /**
   * 副屏的 Context 对象
   * Background Context
   */
  public BC:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;

  /**
   * 画布的宽度
   */
  public W: number;

  /**
   * 画布的高度
   */
  public H: number;

  /**
   * 粉刷模式
   */
  private model: PainterActionModel = {} as PainterActionModel;

  /**
   * 渲染器实例
   */
  private renderer: Renderer2D | null = null;

  /**
   *
   * @param mode
   *  - poster: 海报模式
   *  - animation: 动画模式
   *  - 默认为 animation
   * @param W 海报模式必须传入
   * @param H 海报模式必须传入
   */
  constructor(
    private readonly mode: PainterMode = "animation",
    width = 0,
    height = 0
  ) {
    const { dpr } = platform.globals;

    this.W = width * dpr;
    this.H = height * dpr;
  }

  /**
   * 设置 Canvas 的处理模式
   * - C：代表 Canvas
   * - O：代表 OffscreenCanvas
   */
  private setActionModel(type: "C" | "O"): void {
    const { model } = this;
    const { env } = platform.globals;

    // set type
    model.type = type;

    // set clear
    if ((type === "O" && env === "tt") || env === "alipay") {
      model.clear = "CL";
    } else {
      model.clear = "RE";
    }
  }

  /**
   * 注册画笔，根据环境判断生成最优的绘制方式
   * @param selector
   * @param ofsSelector
   * @param component
   */
  public async register(
    selector: string,
    ofsSelector?: string,
    component?: any
  ) {
    const { model, mode } = this;
    const { getCanvas, getOfsCanvas } = platform;
    const { env } = platform.globals;
    // #region set main screen implement
    // -------- 创建主屏 ---------
    if (
      mode === "poster" &&
      (env !== "h5" || "OffscreenCanvas" in globalThis)
    ) {
      const { W, H } = this;
      const { canvas, context } = getOfsCanvas({ width: W, height: H });

      this.F = canvas;
      this.FC = context;
      this.setActionModel("O");
    } else {
      const { canvas, context } = await getCanvas(selector, component);
      const { width, height } = canvas;
      // 添加主屏
      this.F = canvas;
      this.FC = context;
      this.setActionModel("C");

      if (mode === "poster") {
        canvas.width = this.W;
        canvas.height = this.H;
      } else {
        this.W = width;
        this.H = height;
      }
    }
    // #endregion set main screen implement

    // #region clear main screen implement
    // ------- 生成主屏清理函数 -------
    // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布
    this.clearContainer = Renderer2DExtension.clear(
      model.clear,
      this.FC!,
      this.F!,
      this.W,
      this.H
    );
    // #endregion clear main screen implement

    if (mode === "poster") {
      this.B = this.F;
      this.BC = this.FC;
      this.clearSecondary = this.clearContainer;
      this.stick = noop;
    } else {
      // #region set secondary screen implement
      // ------- 创建副屏 ---------
      const { W, H } = this;
      let ofsResult;

      if (typeof ofsSelector === "string" && ofsSelector !== "") {
        ofsResult = await getCanvas(ofsSelector, component);
        ofsResult.canvas.width = W;
        ofsResult.canvas.height = H;
        this.setActionModel("C");
      } else {
        ofsResult = getOfsCanvas({ width: W, height: H });
        this.setActionModel("O");
      }

      this.B = ofsResult.canvas;
      this.BC = ofsResult.context;
      // #endregion set secondary screen implement

      // #region clear secondary screen implement
      // ------- 生成副屏清理函数 --------
      this.clearSecondary = Renderer2DExtension.clear(
        model.clear,
        this.BC!,
        this.B!,
        this.W,
        this.H
      );
      this.stick = Renderer2DExtension.stick(this.FC!, this.B!);
      // #endregion clear secondary screen implement
    }

    const { B, BC } = this;
    const renderer = this.renderer = new Renderer2D(BC);
    this.resize = (
      contentMode: PLAYER_CONTENT_MODE,
      videoSize: PlatformVideo.VideoSize
    ) => renderer!.resize(contentMode, videoSize, B!);
    this.draw = (
      videoEntity: PlatformVideo.Video,
      materials: Map<string, Bitmap>,
      dynamicMaterials: Map<string, Bitmap>,
      currentFrame: number,
      head: number,
      tail: number
    ) =>
      renderer!.render(
        videoEntity,
        materials,
        dynamicMaterials,
        currentFrame,
        head,
        tail
      );
  }

  public clearContainer: () => void = noop;

  public clearSecondary: () => void = noop;

  public resize: (
    contentMode: PLAYER_CONTENT_MODE,
    videoSize: PlatformVideo.VideoSize
  ) => void = noop;

  public draw: (
    videoEntity: PlatformVideo.Video,
    materials: Map<string, Bitmap>,
    dynamicMaterials: Map<string, Bitmap>,
    currentFrame: number,
    head: number,
    tail: number
  ) => void = noop;

  public stick: () => void = noop;

  /**
   * 销毁画笔
   */
  public destroy() {
    this.clearContainer();
    this.clearSecondary();
    this.F = this.FC = this.B = this.BC = null;
    this.clearContainer = this.clearSecondary = this.stick = noop;
    this.renderer?.destroy();
  }
}
