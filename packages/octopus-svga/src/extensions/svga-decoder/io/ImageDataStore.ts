/**
 * 对于复杂的数据结构，可以使用TypedArray或DataView直接操作二进制数据，而不是创建大量JavaScript对象
 * * 使用TypedArray存储图像数据
 */
export class ImageDataStore {
  private buffer: ArrayBuffer;
  private widths: Uint16Array;
  private heights: Uint16Array;
  private offsets: Uint32Array;
  private lengths: Uint32Array;
  private data: Uint8Array;
  private count: number = 0;
  
  constructor(capacity: number, dataSize: number) {
    // 为元数据分配内存
    const metaSize = capacity * (2 + 2 + 4 + 4); // width + height + offset + length
    this.buffer = new ArrayBuffer(metaSize);
    
    // 创建视图
    this.widths = new Uint16Array(this.buffer, 0, capacity);
    this.heights = new Uint16Array(this.buffer, capacity * 2, capacity);
    this.offsets = new Uint32Array(this.buffer, capacity * 4, capacity);
    this.lengths = new Uint32Array(this.buffer, capacity * 8, capacity);
    
    // 为图像数据分配内存
    this.data = new Uint8Array(dataSize);
  }
  
  add(width: number, height: number, imageData: Uint8Array): number {
    const index = this.count++;
    const offset = index > 0 ? this.offsets[index - 1] + this.lengths[index - 1] : 0;
    
    this.widths[index] = width;
    this.heights[index] = height;
    this.offsets[index] = offset;
    this.lengths[index] = imageData.length;
    
    this.data.set(imageData, offset);
    
    return index;
  }
  
  get(index: number): { width: number, height: number, data: Uint8Array } {
    if (index >= this.count) throw new Error("Index out of bounds");
    
    return {
      width: this.widths[index],
      height: this.heights[index],
      data: this.data.subarray(this.offsets[index], this.offsets[index] + this.lengths[index])
    };
  }
}