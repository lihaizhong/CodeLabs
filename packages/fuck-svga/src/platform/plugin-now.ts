import { definePlugin } from "./definePlugin";

export default definePlugin<"now">({
  name: "now",
  install() {
    const { env, br } = this.global;
    // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
    const perf = env === "h5" ? globalThis.performance : env === "tt" ? br.performance : br.getPerformance();

    if(typeof perf?.now === "function") {
      this.global.isPerf = true;

      // 数值接近，说明perf.now()获得的是高精度的时间戳
      if (perf.now() / 1000 - Date.now() < 2) {
        return () => perf.now() / 1000;
      }

      return () => perf.now();
    }

    return () => Date.now();
  },
});
