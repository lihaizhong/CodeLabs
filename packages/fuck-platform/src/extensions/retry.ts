export async function retry<T>(
  fn: () => T,
  intervals: number[] = [],
  times: number = 0
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (times >= intervals.length) {
      throw err;
    }

    return new Promise((resolve) => {
      setTimeout(
        () => resolve(retry(fn, intervals, times + 1)),
        intervals[times]
      );
    });
  }
}
