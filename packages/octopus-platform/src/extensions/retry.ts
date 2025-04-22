import { Platform } from "src/types";

export const retry: Platform["retry"] = async <T>(
  fn: () => T | Promise<T>,
  intervals: number[] = [],
  times: number = 0
) => {
  try {
    return fn();
  } catch (err) {
    if (times >= intervals.length) {
      throw err;
    }

    return new Promise<T>((resolve) => {
      setTimeout(
        () => resolve(retry<T>(fn, intervals, times + 1)),
        intervals[times]
      );
    });
  }
};
