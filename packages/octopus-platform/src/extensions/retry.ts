export async function retry<T>(
  fn: () => T | Promise<T>,
  intervals: number[] = []
): Promise<T> {
  let times = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (times >= intervals.length) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, intervals[times]));
      times++;
    }
  }
}
