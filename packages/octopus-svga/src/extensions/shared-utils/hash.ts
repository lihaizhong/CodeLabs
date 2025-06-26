/**
 * 简易的hash算法
 * @param buff 
 * @param start 
 * @param end 
 * @param step 
 * @returns 
 */
export function calculateHash(buff: Uint8Array, start: number, end: number, step: number) {
  // 使用简单的哈希算法
    let hash = 0;

    for (let i = start; i < end; i += step) {
      // 简单的哈希算法，类似于字符串哈希
      hash = (hash << 5) - hash + buff[i];
      hash = hash & hash; // 转换为32位整数
    }

    // 添加数据长度作为哈希的一部分，增加唯一性
    hash = (hash << 5) - hash + end - start;
    hash = hash & hash;
    // 转换为字符串
    return hash.toString(36);
}
