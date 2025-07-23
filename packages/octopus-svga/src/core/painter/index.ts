import type { PlatformCanvas, PlatformOffscreenCanvas } from "octopus-platform";
import { platform } from "../../platform";
import type { PaintModel, PaintMode } from "../../types";

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

  /**
   * 设置 Canvas 的处理模式
   * - C：代表 Canvas
   * - O：代表 OffscreenCanvas
   */
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
      const { canvas, context } = getOfsCanvas({ width: W, height: H });

      this.F = canvas;
      this.FC = context;
      this.setModel("O");
    } else {
      const { canvas, context } = await getCanvas(selector, component);
      const { width, height } = canvas;
      // 添加主屏
      this.F = canvas;
      this.FC = context;
      this.setModel("C");

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
    if (model.clear === "CL") {
      this.clearContainer = () => {
        const { W, H, FC } = this;

        FC!.clearRect(0, 0, W, H);
      };
    } else {
      this.clearContainer = () => {
        const { W, H, F } = this;

        F!.width = W;
        F!.height = H;
      };
    }
    // #endregion clear main screen implement

    if (mode === "poster") {
      this.B = this.F;
      this.BC = this.FC;
      this.clearSecondary = this.stick = noop;
    } else {
      // #region set secondary screen implement
      // ------- 创建副屏 ---------
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

      this.B = ofsResult.canvas;
      this.BC = ofsResult.context;
      // #endregion set secondary screen implement

      // #region clear secondary screen implement
      // ------- 生成副屏清理函数 --------
      switch (model.clear) {
        case "CR":
          this.clearSecondary = () => {
            const { W, H } = this;
            // FIXME:【支付宝小程序】频繁创建新的 OffscreenCanvas 会出现崩溃现象
            const { canvas, context } = getOfsCanvas({ width: W, height: H });

            this.B = canvas;
            this.BC = context;
          };
          break;
        case "CL":
          this.clearSecondary = () => {
            const { W, H, BC } = this;
            // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布，无论是Canvas还是OffscreenCanvas
            BC!.clearRect(0, 0, W, H);
          };
          break;
        default:
          this.clearSecondary = () => {
            const { W, H, B } = this;
          
            B!.width = W;
            B!.height = H;
          };
      }
      // #endregion clear secondary screen implement
    }
  }

  public clearContainer: () => void = noop;

  public clearSecondary: () => void = noop;

  public stick() {
    const { W, H,FC, BC, mode } = this;

    if (mode !== "poster") {
      FC!.drawImage(BC!.canvas, 0, 0, W, H);
    }
  }

  /**
   * 销毁画笔
   */
  public destroy() {
    this.clearContainer();
    this.clearSecondary();
    this.F = this.FC = this.B = this.BC = null;
    this.clearContainer = this.clearSecondary = this.stick = noop;
  }
}
