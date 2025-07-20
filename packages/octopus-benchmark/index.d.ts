declare class Stopwatch {
    private readonly timeLabels;
    private readonly markLabels;
    start(label: string): void;
    stop(label: string): void;
    mark(label: string): void;
    reset(label: string): void;
    clear(): void;
}
interface Benchmark extends Stopwatch {
    now: () => number;
    time: <T extends any = any>(label: string, callback: () => Promise<T> | T) => Promise<T>;
    line: (size: number) => void;
    log: (...message: unknown[]) => void;
    info: (...message: unknown[]) => void;
}
declare const benchmark: Benchmark;

export { benchmark };
export type { Benchmark };
