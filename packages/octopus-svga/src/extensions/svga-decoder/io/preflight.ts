import Reader from "./Reader";

export class Preflight {
  private caches: Map<string, any> = new Map();

  private count: number = 0;

  get size() {
    return this.caches.size;
  }

  get hitCount() {
    return this.count;
  }

  // get cache() {
  //   return Object.fromEntries(this.caches);
  // }

  /**
   * 计算二进制数据的哈希值
   * @param reader Reader对象
   * @param end 结束位置
   * @returns 哈希值
   */
  calculate(reader: Reader, end: number): string {
    // 保存原始位置
    const { pos: startPos, buf } = reader;
    const endPos = Math.min(end, reader.len);
    const dataLength = endPos - startPos;
    // 采样数据以加快计算速度，同时保持足够的唯一性
    // 对于大数据，每隔几个字节采样一次
    const step = Math.max(1, Math.floor(dataLength / 100));
    // 使用简单的哈希算法
    let hash = 0;

    for (let i = startPos; i < endPos; i += step) {
      // 简单的哈希算法，类似于字符串哈希
      hash = (hash << 5) - hash + buf[i];
      hash = hash & hash; // 转换为32位整数
    }

    // 添加数据长度作为哈希的一部分，增加唯一性
    hash = (hash << 5) - hash + dataLength;
    hash = hash & hash;
    // 转换为字符串
    return hash.toString(36);
  }

  /**
   * 检查是否存在缓存数据
   * @param key 键
   * @returns 是否存在
   */
  has(key: string): boolean {
    const hit = this.caches.has(key);

    if (hit) {
      this.count++;
    }

    return hit;

    // return this.caches.has(key);
  }

  /**
   * 获取缓存数据
   * @param key 键
   * @returns 缓存数据
   */
  get(key: string): any {
    return this.caches.get(key);
  }

  /**
   * 设置缓存数据
   * @param key 键
   * @param value 缓存数据
   */
  set(key: string, value: any) {
    this.caches.set(key, value);
  }

  /**
   * 清空所有缓存数据
   */
  clear() {
    this.count = 0;
    this.caches.clear();
  }
}
