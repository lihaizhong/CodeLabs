const badge = "【benchmark】";

// 检查环境
const env: string = (() => {
  if (typeof window !== "undefined") {
    return "h5";
  }

  if (typeof tt !== "undefined") {
    return "tt";
  }

  if (typeof my !== "undefined") {
    return "alipay";
  }

  if (typeof wx !== "undefined") {
    return "weapp";
  }

  return "unknown";
})();

// 检查系统
const sys: string = (() => {
  if (env === "alipay") {
    return my.getDeviceBaseInfo().platform as string;
  }

  if (env === "tt") {
    return tt.getDeviceInfoSync().platform as string;
  }

  if (env === "weapp") {
    // @ts-ignore
    return wx.getDeviceInfo().platform as string;
  }

  return "unknown";
})().toLocaleLowerCase();

// 检查时间工具
const now: () => number = (() => {
  if (env === "h5") {
    return () => performance.now() / 1000;
  }

  if (env === "weapp") {
    // @ts-ignore
    return () => wx.getPerformance().now() / 1000;
  }

  if (env === "alipay") {
    return () => my.getPerformance().now() / 1000;
  }

  return () => Date.now();
})();

class Stopwatch {
  private label: string = "";

  private startTime: number = 0;

  private readonly isRealMachine = ["ios", "android", "openharmony"].includes(
    sys
  );

  start(label: string) {
    if (this.isRealMachine) {
      this.label = label;
      this.startTime = now();
    } else {
      console.time(label);
    }
  }

  stop(label: string) {
    if (this.isRealMachine) {
      console.log(`${this.label}: ${now() - this.startTime}`);
    } else {
      console.timeEnd(label);
    }
  }
}

export default {
  label(label: string) {
    console.log(badge, label);
  },
  async time<T extends any>(
    label: string,
    callback: () => Promise<T> | T
  ): Promise<T> {
    const stopwatch = new Stopwatch();

    stopwatch.start(label);
    const result = await callback();
    stopwatch.stop(label);

    return result;
  },
  line(size: number = 40) {
    console.log("-".repeat(size));
  },
  log(...message: unknown[]) {
    console.log(badge, ...message);
  },
};
