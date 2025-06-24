import Reader from "./Reader";
export declare class Preflight {
    private caches;
    private count;
    get size(): number;
    get hitCount(): number;
    /**
     * 计算二进制数据的哈希值
     * @param reader Reader对象
     * @param end 结束位置
     * @returns 哈希值
     */
    calculate(reader: Reader, end: number): string;
    /**
     * 检查是否存在缓存数据
     * @param key 键
     * @returns 是否存在
     */
    has(key: string): boolean;
    /**
     * 获取缓存数据
     * @param key 键
     * @returns 缓存数据
     */
    get(key: string): any;
    /**
     * 设置缓存数据
     * @param key 键
     * @param value 缓存数据
     */
    set(key: string, value: any): void;
    /**
     * 清空所有缓存数据
     */
    clear(): void;
}
