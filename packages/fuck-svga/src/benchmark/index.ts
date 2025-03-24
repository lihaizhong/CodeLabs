const stopwatch = {
  time(label: string): void {
    console.time?.(label);
  },
  timeEnd(label: string): void {
    console.timeEnd?.(label);
  }
};

export default {
  count: 20,
  label(label: string) {
    console.log(label);
  },
  async time(
    label: string,
    callback: () => unknown
  ): Promise<unknown> {
    stopwatch.time(label);
    const result = await callback();
    stopwatch.timeEnd(label);

    return result;
  },
  line(size: number = 40) {
    console.log("-".repeat(size));
  },
  log(...message: unknown[]) {
    console.log("【benchmark】", ...message);
  },
};
