declare class Stopwatch {
    private labels;
    private readonly isRealMachine;
    start(label: string): void;
    stop(label: string): void;
}
export interface Benchmark extends Stopwatch {
    now: () => number;
    time: <T extends any = any>(label: string, callback: () => Promise<T> | T) => Promise<T> | T;
    line: (size: number) => void;
    log: (...message: unknown[]) => void;
}
declare const benchmark: Benchmark;
export default benchmark;
