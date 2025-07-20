import { benchmark } from "octopus-benchmark";

/**
 * 检查浏览器的空闲时间
 */
export const checkIdleTime = () => {
  let checked = true;

  const bootstrap = () => {
    if (checked) {
      requestIdleCallback((deadline) => {
        // 检查剩余时间
        benchmark.info("浏览器空闲时间", `${deadline.timeRemaining()}ms`);
        // 如果剩余时间小于1ms或超时，则执行检查空闲时间的逻辑
        setTimeout(bootstrap, deadline.timeRemaining());
      });
    }
  };

  bootstrap();
  return () => {
    checked = false;
  };
};
