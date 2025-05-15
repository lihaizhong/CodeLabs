export declare class UTF8 {
    /**
     * 读取UTF8字节作为字符串
     * @param {Uint8Array} buffer 缓存数据
     * @param {number} start 缓存数据开始位置
     * @param {number} end 缓存数据结束为止
     * @returns {string}
     */
    read(buffer: Uint8Array, start: number, end: number): string;
    /**
     * 将字符串写入UTF8字节
     * @param {string} string 字符串数据
     * @param {Uint8Array} buffer 目标缓存数据
     * @param {number} offset 目标缓存偏移量
     * @returns {number}
     */
    write(string: string, buffer: Uint8Array, offset: number): number;
    /**
     * 计算字符串的UTF8字节长度
     * @param {string} string 字符串数据
     * @returns {number}
     */
    length(string: string): number;
}
