import { platform } from "../platform";
import benchmark from "../benchmark";
import render from "./render";
import { ImagePool } from "./image-pool";

interface PaintModel {
  // canvas or offscreen
  type: "C" | "O";
  // clear or resize or create
  clear: "CL" | "RE" | "CR";
}

type PaintMode = "poster" | "animation";

interface TransformScale {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
}

const { noop } = platform;

export class Painter {
  /**
   * 主屏的 Canvas 元素
   * Main Screen
   */
  private X: OctopusPlatform.PlatformCanvas | OctopusPlatform.PlatformOffscreenCanvas | null = null;
  /**
   * 主屏的 Context 对象
   * Main Context
   */
  private XC:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;
  /**
   * 副屏的 Canvas 元素
   * Secondary Screen
   */
  private Y: OctopusPlatform.PlatformCanvas | OctopusPlatform.PlatformOffscreenCanvas | null = null;
  /**
   * 副屏的 Context 对象
   * Secondary Context
   */
  private YC:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;
  /**
   * 画布的宽度
   */
  private W: number;
  /**
   * 画布的高度
   */
  private H: number;
  /**
   * 粉刷模式
   */
  private model: PaintModel = {} as PaintModel;

  private IM = new ImagePool();

  private lastResizeKey = "";
  private lastTransform?: PlatformVideo.Transform;

  public globalTransform?: PlatformVideo.Transform;

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

    benchmark.line(4);
    benchmark.log("brush type", model.type);
    benchmark.log("brush clear", model.clear);
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

    if (env !== "h5") {
      const { X, IM } = this;

      Object.defineProperty(X, "createImage", {
        get() { return () => IM.createImage() },
      })

      platform.setGlobalCanvas(X as MiniProgramCanvas);
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

  /**
   * 更新动态图片集
   * @param images
   */
  public updateDynamicImages(images: PlatformImages) {
    this.IM.appendAll(images);
  }

  /**
   * 加载图片集
   * @param images 图片数据
   * @param filename 文件名称
   * @returns
   */
  public loadImages(images: RawImages, filename: string): Promise<void[]> {
    return this.IM.loadAll(images, filename);
  }

  /**
   * 生成图片
   * @returns
   */
  public getImageData() {
    return this.XC!.getImageData(0, 0, this.W, this.H);
  }

  /**
   * 计算缩放比例
   * @param contentMode
   * @param videoSize
   * @returns
   */
  private calculateScale(
    contentMode: PLAYER_CONTENT_MODE,
    videoSize: PlatformVideo.VideoSize
  ): TransformScale {
    const { Y } = this;
    const imageRatio = videoSize.width / videoSize.height;
    const viewRatio = Y!.width / Y!.height;
    const isAspectFit = contentMode === PLAYER_CONTENT_MODE.ASPECT_FIT;
    const shouldUseWidth =
      (imageRatio >= viewRatio && isAspectFit) ||
      (imageRatio <= viewRatio && !isAspectFit);

    if (shouldUseWidth) {
      const scale = Y!.width / videoSize.width;

      return {
        scaleX: scale,
        scaleY: scale,
        translateX: 0,
        translateY: (Y!.height - videoSize.height * scale) / 2,
      };
    }

    const scale = Y!.height / videoSize.height;

    return {
      scaleX: scale,
      scaleY: scale,
      translateX: (Y!.width - videoSize.width * scale) / 2,
      translateY: 0,
    };
  }

  /**
   * 调整画布尺寸
   * @param contentMode
   * @param videoSize
   * @returns
   */
  public resize(contentMode: PLAYER_CONTENT_MODE, videoSize: PlatformVideo.VideoSize): void {
    const { width: canvasWidth, height: canvasHeight } = this.Y!;
    const { width: videoWidth, height: videoHeight } = videoSize;
    const resizeKey = `${contentMode}-${videoWidth}-${videoHeight}-${canvasWidth}-${canvasHeight}`;

    if (this.lastResizeKey === resizeKey && this.lastTransform) {
      this.globalTransform = this.lastTransform;
      return;
    }

    let scale: TransformScale = {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0,
    };

    if (contentMode === PLAYER_CONTENT_MODE.FILL) {
      scale.scaleX = canvasWidth / videoWidth;
      scale.scaleY = canvasHeight / videoHeight;
    } else {
      scale = this.calculateScale(contentMode, videoSize);
    }

    this.lastResizeKey = resizeKey;
    this.globalTransform = this.lastTransform = {
      a: scale.scaleX,
      b: 0.0,
      c: 0.0,
      d: scale.scaleY,
      tx: scale.translateX,
      ty: scale.translateY,
    };
  }

  public clearContainer: () => void = noop;

  public clearSecondary: () => void = noop;

  /**
   * 清理素材库
   */
  public clearMaterials() {
    this.IM.release();
  }

  /**
   * 绘制图片片段
   * @param videoEntity
   * @param currentFrame
   * @param start
   * @param end
   */
  public draw(
    videoEntity: PlatformVideo.Video,
    currentFrame: number,
    start: number,
    end: number
  ) {
    const { materials, dynamicMaterials } = this.IM;

    render(
      this.YC!,
      materials,
      dynamicMaterials,
      videoEntity,
      currentFrame,
      start,
      end,
      this.globalTransform
    );
  }

  public stick() {
    const { W, H, mode } = this;

    if (mode !== "poster") {
      this.XC!.drawImage(
        this.YC!.canvas || (this.Y as CanvasImageSource),
        0,
        0,
        W,
        H
      );
    }
  }

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
