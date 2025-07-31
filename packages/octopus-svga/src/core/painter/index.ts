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
   * @param W 海报模式必须传入
   * @param H 海报模式必须传入
   */
  constructor(
    private readonly mode: PainterMode = "dual",
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
      mode === "single" &&
      (env !== "h5" || "OffscreenCanvas" in globalThis)
    ) {
      const { W, H } = this;
      const { canvas, context } = getOfsCanvas({ width: W, height: H });
      // 添加主屏
      this.F = canvas;
      this.FC = context;
      this.setActionModel("O");
    } else {
      const { canvas, context } = await getCanvas(selector, component);
      // 添加主屏
      this.F = canvas;
      this.FC = context;
      this.setActionModel("C");

      if (mode === "single") {
        canvas.width = this.W;
        canvas.height = this.H;
      } else {
        this.W = canvas.width;
        this.H = canvas.height;
      }
    }
    // #endregion set main screen implement

    const { FC, F, W, H } = this;
    const clearType = model.clear;

    this.clearContainer = Renderer2DExtension.clear(clearType, FC!, F!, W, H);

    if (mode === "single") {
      this.B = F;
      this.BC = FC;
      this.clearSecondary = this.clearContainer;
      this.stick = noop;
    } else {
      // #region set secondary screen implement
      // ------- 创建副屏 ---------
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

      const { BC, B } = this;

      this.clearSecondary = Renderer2DExtension.clear(clearType, BC!, B!, W, H);
      this.stick = Renderer2DExtension.stick(FC!, B!);
    }

    // #region other methods implement
    // ------- 生成其他方法 --------
    const { B, BC } = this;
    const renderer = (this.renderer = new Renderer2D(BC));

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
    // #endregion other methods implement
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
