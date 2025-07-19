import { platform } from "./platform";

const badge = [
  "%cBENCHMARK",
  "padding: 2px 4px; background: #68B984; color: #FFFFFF; border-radius: 4px;",
];

class Stopwatch {
  private readonly timeLabels: Map<string, number> = new Map();

  private readonly markLabels: Map<string, number> = new Map();

  start(label: string) {
    this.timeLabels.set(label, platform.now());
  }

  stop(label: string) {
    const nowTime = platform.now();
    const { timeLabels } = this;

    if (timeLabels.has(label)) {
      console.log(`${label}: ${nowTime - timeLabels.get(label)!} ms`);
      timeLabels.delete(label);
    }
  }

  mark(label: string) {
    const nowTime = platform.now();
    const { markLabels } = this;

    if (markLabels.has(label)) {
      console.log(`${label}: ${nowTime - markLabels.get(label)!} ms`);
    }

    markLabels.set(label, nowTime);
  }

  reset(label: string) {
    this.markLabels.delete(label);
  }

  clear() {
    this.timeLabels.clear();
    this.markLabels.clear();
  }
}

export interface Benchmark extends Stopwatch {
  now: () => number;
  time: <T extends any = any>(
    label: string,
    callback: () => Promise<T> | T
  ) => Promise<T>;
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

export { benchmark };
