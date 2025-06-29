import { platform } from "./platform";

const badge = [
  "%cBENCHMARK",
  "padding: 2px 4px; background: #68B984; color: #FFFFFF; border-radius: 4px;",
];

class Stopwatch {
  private readonly isRealMachine = ["ios", "android", "openharmony"].includes(
    platform.system
  );

  private readonly timeLabels: Map<string, number> = new Map();

  private readonly markLabels: Map<string, number> = new Map();

  start(label: string) {
    if (this.isRealMachine) {
      this.timeLabels.set(label, platform.now());
    } else {
      console.time(label);
    }
  }

  stop(label: string) {
    if (this.isRealMachine) {
      const nowTime = platform.now();

      if (this.timeLabels.has(label)) {
        console.log(
          `${label}: ${nowTime - (this.timeLabels.get(label) as number)} ms`
        );
        this.timeLabels.delete(label);
      }
    } else {
      console.timeEnd(label);
    }
  }

  mark(label: string) {
    const nowTime = platform.now();

    if (this.markLabels.has(label)) {
      console.log(
        `${label}: ${nowTime - (this.markLabels.get(label) as number)} ms`
      );
    }

    this.markLabels.set(label, nowTime);
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
  ) => Promise<T> | T;
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
