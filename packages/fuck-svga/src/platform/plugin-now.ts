import { definePlugin } from "./definePlugin";

export default definePlugin<"now">({
  name: "now",
  install() {
    const { env, br } = this.global;
    // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
    const perf = env === "h5" ? window.performance : br.getPerformance();

    return (this.global.isPerf = !!(perf && perf.now)) ? () => perf.now() : () => Date.now();
  },
});
