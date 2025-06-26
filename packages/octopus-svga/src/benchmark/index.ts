const badge = ["%cBENCHMARK", "padding: 2px 4px; background: #68B984; color: #FFFFFF; border-radius: 4px;"];

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
  if (env === "h5" || env === "tt") {
    return () => performance.now();
  }

  if (env === "weapp") {
    // @ts-ignore
    return () => wx.getPerformance().now();
  }

  if (env === "alipay") {
    return () => my.getPerformance().now() / 1000;
  }

  return () => Date.now();
})();

class Stopwatch {
  private labels: Map<string, number> = new Map();

  private readonly isRealMachine = ["ios", "android", "openharmony"].includes(
    sys
  );

  start(label: string) {
    if (this.isRealMachine) {
      this.labels.set(label, now());
    } else {
      console.time(label);
    }
  }

  stop(label: string) {
    if (this.isRealMachine) {
      const startTime = this.labels.get(label);
      if (typeof startTime === "number") {
        console.log(`${label}: ${now() - startTime} ms`);
        this.labels.delete(label);
      }
    } else {
      console.timeEnd(label);
    }
  }
}

export interface Benchmark extends Stopwatch {
  now: () => number;
  time: <T extends any = any>(label: string, callback: () => Promise<T> | T) => Promise<T> | T;
  line: (size: number) => void;
  log: (...message: unknown[]) => void;
}

const stopwatch = new Stopwatch();
const benchmark: Benchmark = Object.create(stopwatch);

benchmark.now = now;

benchmark.time = async (label, callback) => {
  stopwatch.start(label);
  const result = await callback();
  stopwatch.stop(label);

  return result;
};

benchmark.line = (size = 40) => {
  console.log("-".repeat(size));
};

benchmark.log = (...message) => {
  console.log(...badge, ...message);
};

export default benchmark;
