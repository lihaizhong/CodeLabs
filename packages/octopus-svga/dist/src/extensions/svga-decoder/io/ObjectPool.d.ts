export declare class ObjectPool<T> {
    private readonly factory;
    private readonly reset;
    private readonly maxSize;
    private readonly pool;
    constructor(factory: () => T, reset: (obj: T) => void, maxSize?: number);
    acquire(): T;
    release(obj: T): void;
}
