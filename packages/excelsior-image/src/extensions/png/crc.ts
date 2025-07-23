// CRC32 表
const table: Uint32Array = new Uint32Array(256);

for (let i = 0; i < 256; i++) {
  let c = i;
  let mask: number;
  for (let j = 0; j < 8; j++) {
    mask = -(c & 1); // 根据 LSB 生成 0xFFFFFFFF 或 0
    c = (c >>> 1) ^ (0xedb88320 & mask);
  }

  table[i] = c;
}

// 计算 CRC32
export function crc32(buff: Uint8Array): number {
  const { length } = buff;
  let crc = 0xffffffff;

  for (let i = 0; i < length; i++) {
    crc = table[(crc ^ buff[i]) & 0xff] ^ (crc >>> 8);
  }

  return crc ^ 0xffffffff;
}
