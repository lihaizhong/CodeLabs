declare const _default: {
    label(label: string): void;
    time<T extends unknown>(label: string, callback: () => Promise<T> | T): Promise<T>;
    line(size?: number): void;
    log(...message: unknown[]): void;
};
export default _default;
