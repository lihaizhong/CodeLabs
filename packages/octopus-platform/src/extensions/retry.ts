function delay<T>(
  callback: () => T | Promise<T>,
  interval: number
): Promise<T> {
  return new Promise<T>((resolve) =>
    setTimeout(() => resolve(callback()), interval)
  );
}

export async function retry<T>(
  fn: () => T | Promise<T>,
  intervals: number[] = [],
  /*
   * @private 不建议外部传入
   */
  times: number = 0
): Promise<T> {
  try {
    return fn();
  } catch (err) {
    if (times >= intervals.length) {
      throw err;
    }

    return delay<T>(() => retry<T>(fn, intervals, ++times), intervals[times]);
  }
}
