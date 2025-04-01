import benchmark from "../benchmark";
import render from "./render";
import { ImageManager } from "./image-manager";
import { platform } from "../platform";

interface IBrushModel {
  // canvas or offscreen
  type: "C" | "O";
  // clear or resize or create
  clear: "CL" | "RE" | "CR";
  // put or draw
  render: "PU" | "DR";
}

type TBrushMode = "poster" | "animation";

const { noop } = platform;

export class Brush {
  /**
   * 主屏的 Canvas 元素
   * Main Screen
   */
  private X: PlatformCanvas | null = null;
  /**
   * 主屏的 Context 对象
   * Main Context
   */
  private XC: CanvasRenderingContext2D | null = null;
  /**
   * 副屏的 Canvas 元素
   * Secondary Screen
   */
  private Y: PlatformCanvas | PlatformOffscreenCanvas | null = null;
  /**
   * 副屏的 Context 对象
   * Secondary Context
   */
  private YC:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;
  /**
   * 粉刷模式
   */
  private model: IBrushModel = {} as IBrushModel;

  private IM = new ImageManager();

  public globalTransform?: GlobalTransform;

  /**
   * 
   * @param mode 
   *  - poster: 海报模式
   *  - animation: 动画模式
   *  - 默认为 animation
   * @param W 海报模式必须传入
   * @param H 海报模式必须传入
   */
  constructor(private readonly mode: TBrushMode = "animation", private W = 0, private H = 0) {}

  private setModel(type: "C" | "O"): void {
    const { model } = this;
    const { env, sys } = platform.global;

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

    // set render
    if (
      (type === "C" &&
        (env === "tt" || (sys === "IOS" && env === "alipay"))) ||
      (type === "O" && env === "weapp") 
    ) {
      model.render = "PU";
    } else {
      model.render = "DR";
    }

    benchmark.line(4);
    benchmark.log("brush type", model.type);
    benchmark.log("brush clear", model.clear);
    benchmark.log("brush render", model.render);
    benchmark.line(4);
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
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ) {
    const { model, mode } = this;
    const { getCanvas, getOfsCanvas } = platform;
    // #region set main screen implement
    // -------- 创建主屏 ---------
    if (mode === "poster") {
      const { W, H } = this;

      if (!(W > 0 && H > 0)) {
        throw new Error(
          "Poster mode must set width and height when create Brush instance"
        );
      }

      const { canvas, context } = getOfsCanvas({ width: W, height: H });
      this.X = canvas;
      this.XC = context;
    } else {
      const { canvas, context } = await getCanvas(selector, component);
      const { width, height } = canvas;
      // 添加主屏
      this.X = canvas;
      this.XC = context;
      this.W = width;
      this.H = height;
    }
    // #endregion set main screen implement

    // #region set secondary screen implement
    // ------- 创建副屏 ---------
    if (mode === "poster") {
      this.Y = this.X;
      this.YC = this.XC;
      this.setModel("O");
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

      // #region stick implement
      // -------- 生成渲染函数 ---------
      switch (model.render) {
        case "DR":
          this.stick = () => {
            const { W, H } = this;
            // FIXME:【微信小程序】 drawImage 无法绘制 OffscreenCanvas；【抖音小程序】 drawImage 无法绘制 Canvas
            this.XC!.drawImage(this.Y as CanvasImageSource, 0, 0, W, H);
          };
          break;
        case "PU":
          this.stick = () => {
            const { W, H } = this;
            // FIXME:【所有小程序】 imageData 获取到的数据都是 0，可以当场使用，但不要妄图缓存它
            const imageData = this.YC!.getImageData(0, 0, W, H);
            this.XC!.putImageData(imageData, 0, 0, 0, 0, W, H);
          };
          break;
        default:
      }
      // #endregion stick implement
    }
  }

  /**
   * 加载图片集
   * @param images 图片数据
   * @param filename 文件名称
   * @returns
   */
  public loadImages(images: RawImages, filename: string): Promise<void> {
    return this.IM.loadImages(images, this, filename);
  }

  /**
   * 创建图片标签
   * @returns
   */
  public createImage(): PlatformImage {
    return this.IM.createImage(this.X as WechatMiniprogram.Canvas);
  }

  /**
   * 生成图片
   * @returns
   */
  public getImageData() {
    return this.XC!.getImageData(0, 0, this.W, this.H);
  }

  public resize(
    contentMode: PLAYER_CONTENT_MODE,
    videoSize: ViewportRect
  ): void {
    const { Y } = this;
    let scaleX = 1.0;
    let scaleY = 1.0;
    let translateX = 0.0;
    let translateY = 0.0;

    if (contentMode === PLAYER_CONTENT_MODE.FILL) {
      scaleX = Y!.width / videoSize.width;
      scaleY = Y!.height / videoSize.height;
    } else if (
      [
        PLAYER_CONTENT_MODE.ASPECT_FILL,
        PLAYER_CONTENT_MODE.ASPECT_FIT,
      ].includes(contentMode)
    ) {
      const imageRatio = videoSize.width / videoSize.height;
      const viewRatio = Y!.width / Y!.height;

      if (
        (imageRatio >= viewRatio &&
          contentMode === PLAYER_CONTENT_MODE.ASPECT_FIT) ||
        (imageRatio <= viewRatio &&
          contentMode === PLAYER_CONTENT_MODE.ASPECT_FILL)
      ) {
        scaleX = scaleY = Y!.width / videoSize.width;
        translateY = (Y!.height - videoSize.height * scaleY) / 2.0;
      } else if (
        (imageRatio < viewRatio &&
          contentMode === PLAYER_CONTENT_MODE.ASPECT_FIT) ||
        (imageRatio > viewRatio &&
          contentMode === PLAYER_CONTENT_MODE.ASPECT_FILL)
      ) {
        scaleX = scaleY = Y!.height / videoSize.height;
        translateX = (Y!.width - videoSize.width * scaleX) / 2.0;
      }
    }

    this.globalTransform = {
      a: scaleX,
      b: 0.0,
      c: 0.0,
      d: scaleY,
      tx: translateX,
      ty: translateY,
    };
  }

  /**
   * 注册刷新屏幕的回调函数
   * @param cb
   */
  public flush(cb: () => void): void {
    platform.rAF(this.X as WechatMiniprogram.Canvas, cb);
  }

  public clearContainer: () => void = noop;

  public clearSecondary: () => void = noop;

  /**
   * 清理素材库
   */
  public clearMaterials() {
    this.IM.clear();
  }

  /**
   * 绘制图片片段
   * @param videoEntity
   * @param currentFrame
   * @param start
   * @param end
   */
  public draw(
    videoEntity: Video,
    currentFrame: number,
    start: number,
    end: number
  ) {
    render(
      this.YC!,
      this.IM.getMaterials(),
      videoEntity,
      currentFrame,
      start,
      end,
      this.globalTransform
    );
  }

  public stick: () => void = noop;

  /**
   * 销毁画笔
   */
  public destroy() {
    this.clearContainer();
    this.clearSecondary();
    this.clearMaterials();
    this.X = this.XC = this.Y = this.YC = null;
    this.clearContainer = this.clearSecondary = this.stick = noop;
  }
}
