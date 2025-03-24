declare const _default: {
    count: number;
    label(label: string): void;
    time(label: string, callback: () => unknown): Promise<unknown>;
    line(size?: number): void;
    log(...message: unknown[]): void;
};
export default _default;
