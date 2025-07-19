import type { PlatformCanvas, PlatformOffscreenCanvas } from "octopus-platform";
import { platform } from "../../platform";
import type { PaintModel, PaintMode } from "../../types";

const { noop } = platform;

export class Painter {
  /**
   * 主屏的 Canvas 元素
   * Main Screen
   */
  public X: PlatformCanvas | PlatformOffscreenCanvas | null = null;
  /**
   * 主屏的 Context 对象
   * Main Context
   */
  public XC:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;
  /**
   * 副屏的 Canvas 元素
   * Secondary Screen
   */
  public Y: PlatformCanvas | PlatformOffscreenCanvas | null = null;
  /**
   * 副屏的 Context 对象
   * Secondary Context
   */
  public YC:
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
  private model: PaintModel = {} as PaintModel;

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
    private readonly mode: PaintMode = "animation",
    width = 0,
    height = 0
  ) {
    const { dpr } = platform.globals;

    this.W = width * dpr;
    this.H = height * dpr;
  }

  private setModel(type: "C" | "O"): void {
    const { model } = this;
    const { env } = platform.globals;

    // set type
    model.type = type;

    // set clear
    if (
      type === "O" &&
      // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
      env === "h5" &&
      navigator.userAgent.includes("Firefox")
    ) {
      model.clear = "CR";
    } else if ((type === "O" && env === "tt") || env === "alipay") {
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

      if (!(W > 0 && H > 0)) {
        throw new Error(
          "Poster mode must set width and height when create Brush instance"
        );
      }

      const { canvas, context } = getOfsCanvas({ width: W, height: H });

      this.X = canvas;
      this.XC = context;
      this.setModel("O");
    } else {
      const { canvas, context } = await getCanvas(selector, component);
      const { width, height } = canvas;
      // 添加主屏
      this.X = canvas;
      this.XC = context;

      if (mode === "poster") {
        canvas.width = width;
        canvas.height = height;
        this.setModel("C");
      } else {
        this.W = width;
        this.H = height;
      }
    }
    // #endregion set main screen implement

    // #region set secondary screen implement
    // ------- 创建副屏 ---------
    if (mode === "poster") {
      this.Y = this.X;
      this.YC = this.XC;
    } else {
      let ofsResult;

      if (typeof ofsSelector === "string" && ofsSelector !== "") {
        ofsResult = await getCanvas(ofsSelector, component);
        ofsResult.canvas.width = this.W;
        ofsResult.canvas.height = this.H;
        this.setModel("C");
      } else {
        ofsResult = getOfsCanvas({ width: this.W, height: this.H });
        this.setModel("O");
      }

      this.Y = ofsResult.canvas;
      this.YC = ofsResult.context;
    }
    // #endregion set secondary screen implement

    // #region clear main screen implement
    // ------- 生成主屏清理函数 -------
    // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布
    if (model.clear === "CL") {
      this.clearContainer = () => {
        const { W, H } = this;
        this.XC!.clearRect(0, 0, W, H);
      };
    } else {
      this.clearContainer = () => {
        const { W, H } = this;
        this.X!.width = W;
        this.X!.height = H;
      };
    }
    // #endregion clear main screen implement

    if (mode === "poster") {
      this.clearSecondary = this.stick = noop;
    } else {
      // #region clear secondary screen implement
      // ------- 生成副屏清理函数 --------
      switch (model.clear) {
        case "CR":
          this.clearSecondary = () => {
            const { W, H } = this;
            // FIXME:【支付宝小程序】频繁创建新的 OffscreenCanvas 会出现崩溃现象
            const { canvas, context } = getOfsCanvas({ width: W, height: H });
            this.Y = canvas;
            this.YC = context;
          };
          break;
        case "CL":
          this.clearSecondary = () => {
            const { W, H } = this;
            // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布，无论是Canvas还是OffscreenCanvas
            this.YC!.clearRect(0, 0, W, H);
          };
          break;
        default:
          this.clearSecondary = () => {
            const { W, H, Y } = this;
            Y!.width = W;
            Y!.height = H;
          };
      }
      // #endregion clear secondary screen implement
    }
  }

  public clearContainer: () => void = noop;

  public clearSecondary: () => void = noop;

  public stick() {
    const { W, H, mode } = this;

    if (mode !== "poster") {
      this.XC!.drawImage(this.YC!.canvas, 0, 0, W, H);
    }
  }

  /**
   * 销毁画笔
   */
  public destroy() {
    this.clearContainer();
    this.clearSecondary();
    this.X = this.XC = this.Y = this.YC = null;
    this.clearContainer = this.clearSecondary = this.stick = noop;
  }
}
