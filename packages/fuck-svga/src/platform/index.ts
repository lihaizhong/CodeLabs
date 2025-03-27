import bridge from "./bridge";
import env from "./env";
import ratio from "./ratio";

export enum SE {
  WECHAT = "weapp",
  ALIPAY = "alipay",
  DOUYIN = "tt",
  H5 = "h5",
}

export class Platform {
  public global = {
    env: null,
    br: null,
    fsm: null,
    dpr: 1,
    sys: null,
  };

  public env = {
    is: (env: SE) => false,
    not: (env: SE) => false,
    get: () => SE.WECHAT,
    set: () => {},
  };

  public remote = {
    is: () => false,
    read: () => Promise.reject(),
  };

  public local = {
    write: () => Promise.reject(),
    read: () => Promise.reject(),
    remove: () => Promise.reject(),
  };

  public decode = {
    toBitmap: () => Promise.reject(),
    toBase64: () => Promise.reject(),
  };

  public image = {
    create: () => Promise.reject(),
    load: () => Promise.reject(),
    isImage: () => false,
    isImageBitmap: () => false,
  };

  private plugins = [env, bridge, ratio];

  constructor() {
    this.init();
  }

  private init() {
    this.plugins.forEach((plugin) => {
      plugin.install.call(null, this.global, this.env, SE);
    });
  }

  rAF(canvas: WechatMiniprogram.Canvas, callback: FrameRequestCallback) {
    (
      (this.env.is(SE.H5) ? globalThis : canvas) as WechatMiniprogram.Canvas
    ).requestAnimationFrame(callback);
  }

  getCanvas() {}

  getOfsCanvas() {}
}
