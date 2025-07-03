import { definePlugin } from "../definePlugin";

export default definePlugin<"now">({  
  name: "now",
  install() {
    const { env, br } = this.globals;
    // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
    const perf =
      env === "h5" || env === "tt" ? performance : br.getPerformance();

    if (typeof perf?.now === "function") {
      // 支付宝小程序的performance.now()获取的是当前时间戳，单位是微秒。
      if (perf.now() - Date.now() > 1) {
        return () => perf.now() / 1000;
      }

      // H5环境下，performance.now()获取的不是当前时间戳，而是从页面加载开始的时间戳，单位是毫秒。
      return () => perf.now();
    }

    return () => Date.now();
  },
});
