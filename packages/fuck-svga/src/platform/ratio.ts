/**
 * 获取当前显示设备的物理像素分辨率与CSS 像素分辨率之比
 */
export default {
  install(global, env, SE) {
    const { br } = global;

    if (env.is(SE.H5)) {
      global.dpr = globalThis.devicePixelRatio;
    } else if ("getWindowInfo" in br) {
      global.dpr = (br as any).getWindowInfo().pixelRatio;
    } else if ("getSystemInfoSync" in br) {
      global.dpr = (br as WechatMiniprogram.Wx).getSystemInfoSync().pixelRatio;
    } else {
      global.dpr = 1;
    }
  },
};
