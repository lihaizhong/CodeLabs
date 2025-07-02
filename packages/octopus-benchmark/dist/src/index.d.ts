declare class Stopwatch {
    private readonly hasConsoleTime;
    private readonly timeLabels;
    private readonly markLabels;
    start(label: string): void;
    stop(label: string): void;
    mark(label: string): void;
    reset(label: string): void;
    clear(): void;
}
export interface Benchmark extends Stopwatch {
    now: () => number;
    time: <T extends any = any>(label: string, callback: () => Promise<T> | T) => Promise<T> | T;
    line: (size: number) => void;
    log: (...message: unknown[]) => void;
}
declare const benchmark: Benchmark;
export default benchmark;
