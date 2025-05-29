import Reader from "./Reader";

/**
 * 对于不立即需要的字段，可以实现懒加载和延迟解析
 */
export class LazyDecodedField<T> {
  private reader?: Reader;
  private decoderFn?: (reader: Reader) => T;
  private value?: T;
  private pos?: number;
  private end?: number;
  
  constructor(reader: Reader, decoderFn: (reader: Reader) => T) {
    // 保存当前位置和解码函数
    this.reader = reader;
    this.decoderFn = decoderFn;
    this.pos = reader.pos;
    
    // 计算字段结束位置并跳过
    const length = reader.uint32();
    this.end = reader.pos + length;
    reader.pos = this.end;
  }
  
  get(): T {
    // 如果已经解码，直接返回
    if (this.value !== undefined) {
      return this.value;
    }
    
    // 否则，解码并缓存结果
    if (this.reader && this.decoderFn && this.pos !== undefined && this.end !== undefined) {
      const originalPos = this.reader.pos;
      this.reader.pos = this.pos;
      this.value = this.decoderFn(this.reader);
      this.reader.pos = originalPos;
      
      // 释放资源
      this.reader = undefined;
      this.decoderFn = undefined;
      this.pos = undefined;
      this.end = undefined;
    } else {
      throw new Error("Cannot decode lazy field: resources have been released");
    }
    
    return this.value;
  }
}
