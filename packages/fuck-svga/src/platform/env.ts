export default {
  install(global, env, SE) {
    // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
    if (typeof window !== "undefined") {
      global.env = SE.H5;
    } else if (typeof tt !== "undefined") {
      global.env = SE.DOUYIN;
    } else if (typeof my !== "undefined") {
      global.env = SE.ALIPAY;
    } else if (typeof wx !== "undefined") {
      global.env = SE.WECHAT;
    }

    throw new Error("Unsupported app");
  },
};
