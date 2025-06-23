import Reader from "./Reader";

/**
 * 计算二进制数据的哈希值
 * @param reader Reader对象或Uint8Array
 * @param length 长度
 * @returns 哈希值
 */
export function calculateHash(reader: Reader | Uint8Array, length?: number): string {
  if (!(reader instanceof Reader)) {
    reader = Reader.create(reader);
  }

  // 保存原始位置
  const startPos = reader.pos;
  const endPos =
    length === undefined ? reader.len : Math.min(startPos + length, reader.len);

  // 使用简单的哈希算法
  let hash = 0;
  const buf = reader.buf;

  // 采样数据以加快计算速度，同时保持足够的唯一性
  // 对于大数据，每隔几个字节采样一次
  const step = Math.max(1, Math.floor((endPos - startPos) / 100));

  for (let i = startPos; i < endPos; i += step) {
    // 简单的哈希算法，类似于字符串哈希
    hash = (hash << 5) - hash + buf[i];
    hash = hash & hash; // 转换为32位整数
  }

  // 添加数据长度作为哈希的一部分，增加唯一性
  hash = (hash << 5) - hash + (endPos - startPos);
  hash = hash & hash;

  // 重置读取位置
  reader.pos = startPos;

  // 转换为字符串
  return hash.toString(36);
}
