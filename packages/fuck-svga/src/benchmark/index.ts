const badge = "【benchmark】";

// 检查环境
let env: string;
if (typeof window !== "undefined") {
  env = "h5";
} else if (typeof tt !== "undefined") {
  env = "tt";
} else if (typeof my !== "undefined") {
  env = "alipay";
} else if (typeof wx !== "undefined") {
  env = "weapp";
} else {
  env = "unknown";
}

// 检查系统
let sys: string;
if (env === "alipay") {
  sys = (my.getDeviceBaseInfo().platform as string).toLocaleLowerCase();
} else if (env === "tt") {
  sys = (tt.getDeviceInfoSync().platform as string).toLocaleLowerCase();
} else if (env === "weapp") {
  // @ts-ignore
  sys = (wx.getDeviceInfo().platform as string).toLocaleLowerCase();
} else {
  sys = "unknown";
}

// 检查时间工具
let now: () => number;
if (env === "h5") {
  now = () => performance.now() / 1000;
} else if (env === "weapp") {
  const perf = wx.getPerformance();

  // @ts-ignore
  now = () => perf.now() / 1000;
} else if (env === "alipay") {
  const perf = my.getPerformance();

  now = () => perf.now() / 1000;
} else {
  now = () => Date.now();
}

class Stopwatch {
  private label: string = '';

  private startTime: number = 0;

  private readonly isRealMachine = ['ios', 'android', 'openharmony'].includes(sys);

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
