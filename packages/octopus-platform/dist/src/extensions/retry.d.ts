export declare function retry<T>(fn: () => T | Promise<T>, intervals?: number[], times?: number): Promise<T>;
