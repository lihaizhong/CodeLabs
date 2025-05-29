import Reader from "./Reader";
/**
 * 对于不立即需要的字段，可以实现懒加载和延迟解析
 */
export declare class LazyDecodedField<T> {
    private reader?;
    private decoderFn?;
    private value?;
    private pos?;
    private end?;
    constructor(reader: Reader, decoderFn: (reader: Reader) => T);
    get(): T;
}
