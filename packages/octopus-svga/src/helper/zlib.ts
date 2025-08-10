/**
 * 检查数据是否为zlib压缩格式
 * @param data 待检查的二进制数据
 * @returns 是否为zlib压缩格式
 */
export function isZlibCompressed(data: Uint8Array): boolean {
  // 检查数据长度是否足够（至少需要2字节头部和4字节ADLER-32校验和）
  if (data.length < 6) {
    return false;
  }

  // 获取CMF和FLG字节
  const cmf = data[0];
  const flg = data[1];

  // 检查CMF的压缩方法（低4位为8表示DEFLATE）
  if ((cmf & 0x0f) !== 8) {
    return false;
  }

  // 检查窗口大小（高4位通常为7，但不是严格要求）
  // - 这里不强制检查，因为理论上可以是其他值

  // 验证头部校验（CMF * 256 + FLG必须是31的倍数）
  if ((cmf * 256 + flg) % 31 !== 0) {
    return false;
  }

  // 检查字典标志位（如果设置了字典，需要额外验证，但这种情况很少见）
  const fdict = (flg & 0x20) !== 0;
  if (fdict) {
    // 标准zlib压缩通常不使用预定义字典
    // 这里假设不使用字典，若检测到字典标志则认为不是标准zlib格式
    return false;
  }

  // 尝试提取ADLER-32校验和并验证其格式
  // 虽然无法验证校验和值（需要解压后计算），但可以检查其是否为合理的数值
  const adler32Bytes = data.slice(-4);

  if (adler32Bytes.length !== 4) {
    return false;
  }

  const adler32 =
    (adler32Bytes[0] << 24) |
    (adler32Bytes[1] << 16) |
    (adler32Bytes[2] << 8) |
    adler32Bytes[3];

  // 有效的ADLER-32值应大于0（除非是空数据）
  if (data.length > 2 && adler32 === 0) {
    return false;
  }

  // 所有检查都通过，数据可能是zlib压缩格式
  return true;
}
