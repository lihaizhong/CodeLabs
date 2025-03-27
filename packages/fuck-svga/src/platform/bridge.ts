export default {
  install(global, SE) {
    const { env } = global;

    switch (env.get()) {
      case SE.H5:
        global.br = globalThis;
        break;
      case SE.ALIPAY:
        global.br = my;
        break;
      case SE.DOUYIN:
        global.br = tt;
        break;
      case SE.WECHAT:
        global.br = wx;
        break;
      default:
    }
  },
};
