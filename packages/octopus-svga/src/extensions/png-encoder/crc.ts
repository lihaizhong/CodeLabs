// CRC32 表初始化
function initCRC32Table(): Uint32Array {
  return Uint32Array.from(Array(256), (_, i) => {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    return c >>> 0;
  });
}

export class CRC32 {
  private static table = initCRC32Table();

  private readonly cache = new Map<string, number>();

  calculate(buff: Uint8Array): number {
    if (!buff || !(buff instanceof Uint8Array)) {
      throw new TypeError('Input must be a Uint8Array');
    }
  
    const { table } = CRC32;
    const { cache } = this;
    const key = String.fromCharCode.apply(null, Array.from(buff));
  
    if (cache.has(key)) {
      return cache.get(key)!;
    }
  
    let crc = 0xffffffff;
    const { length } = buff;
  
    // 使用位运算优化
    for (let i = 0; i < length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buff[i]) & 0xff];
    }
  
    const result = (crc ^ 0xffffffff) >>> 0;
    cache.set(key, result);

    return result;
  }

  clear(){
    this.cache.clear();
  }
}