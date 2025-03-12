declare const _default: {
    count: number;
    label(label: string): void;
    time(label: string, callback: () => any): Promise<any>;
    line(size?: number): void;
    log(...message: any[]): void;
};
export default _default;
