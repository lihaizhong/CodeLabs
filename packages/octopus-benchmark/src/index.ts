import { platform } from "./platform";

const badge = ["%cBENCHMARK", "padding: 2px 4px; background: #68B984; color: #FFFFFF; border-radius: 4px;"];
// 检查系统
const sys: string = (() => {
  switch (platform.globals.env) {
    case "weapp":
      return wx.getDeviceInfo().platform as string;
    case "alipay":
      return my.getDeviceBaseInfo().platform as string;
    case "tt":
      return tt.getDeviceInfoSync().platform as string;
    default:
      return "unknown";
  }
})().toLocaleLowerCase();

class Stopwatch {
  private labels: Map<string, number> = new Map();

  private readonly isRealMachine = ["ios", "android", "openharmony"].includes(
    sys
  );

  start(label: string) {
    if (this.isRealMachine) {
      this.labels.set(label, platform.now());
    } else {
      console.time(label);
    }
  }

  stop(label: string) {
    if (this.isRealMachine) {
      const startTime = this.labels.get(label);
      if (typeof startTime === "number") {
        console.log(`${label}: ${platform.now() - startTime} ms`);
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

benchmark.now = () => platform.now();

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
