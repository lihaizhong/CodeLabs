import { definePlugin } from "../definePlugin";

// 扩展OctopusPlatformPlugins接口
declare module "../definePlugin" {
  interface OctopusPlatformPlugins {
    now: () => number;
  }
}

export default definePlugin<"now">({
  name: "now",
  install() {
    const { env, br } = this.globals;
    // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
    const perf =
      env === "h5" || env === "tt" ? performance : br.getPerformance();

    if (typeof perf?.now === "function") {
      // 数值差别大，说明perf.now()获得的是高精度的时间戳
      if (perf.now() - Date.now() > 0) {
        if (env === "alipay") {
          // 支付宝小程序的performance.now()获取的是当前时间戳，单位是微秒。
          return () => perf.now() / 1000;
        }

        return () => perf.now();
      }

      // H5环境下，performance.now()获取的不是当前时间戳，而是从页面加载开始的时间戳，单位是毫秒。
      return () => perf.now();
    }

    return () => Date.now();
  },
});
