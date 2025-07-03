import { platform } from "../../core/platform";

export class CRC32 {
  // CRC32 Table 初始化
  private static table = Uint32Array.from(Array(256), (_, i) => {
    let c = i;

    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }

    return c >>> 0;
  });

  private static WHITE_COLOR: number = 0xffffffff;

  private readonly caches = new Map<string, number>();

  calculate(buff: Uint8Array): number {
    if (!(buff instanceof Uint8Array)) {
      throw new TypeError('Input must be a Uint8Array');
    }

    const { caches } = this;
    const key = platform.decode.bytesToString(buff);
  
    if (caches.has(key)) {
      return caches.get(key)!;
    }

    let crc = CRC32.WHITE_COLOR;
    // 使用位运算优化
    for (let i = 0; i < buff.length; i++) {
      crc = (crc >>> 8) ^ CRC32.table[(crc ^ buff[i]) & 0xff];
    }

    caches.set(key, (crc ^ CRC32.WHITE_COLOR) >>> 0);

    return caches.get(key) as number;
  }

  clear(){
    this.caches.clear();
  }
}