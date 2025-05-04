import { Platform } from "src/types";

function delay<T>(callback: () => T | Promise<T>, interval: number): Promise<T> {
  return new Promise<T>(
    (resolve) => setTimeout(
      () => resolve(callback()),
      interval
    )
  )
}

export const retry: Platform["retry"] = async <T>(
  fn: () => T | Promise<T>,
  intervals: number[] = [],
  /*
   * @private 不建议外部传入
   */
  times: number = 0
) => {
  try {
    return fn();
  } catch (err) {
    if (times >= intervals.length) {
      throw err;
    }

    return delay<T>(
      () => retry<T>(fn, intervals, ++times),
      intervals[times]
    );
  }
};
