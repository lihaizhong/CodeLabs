/**
 * 对于复杂的数据结构，可以使用TypedArray或DataView直接操作二进制数据，而不是创建大量JavaScript对象
 * * 使用TypedArray存储图像数据
 */
export declare class ImageDataStore {
    private buffer;
    private widths;
    private heights;
    private offsets;
    private lengths;
    private data;
    private count;
    constructor(capacity: number, dataSize: number);
    add(width: number, height: number, imageData: Uint8Array): number;
    get(index: number): {
        width: number;
        height: number;
        data: Uint8Array;
    };
}
