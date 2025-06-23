import Reader from "./Reader";
/**
 * 计算二进制数据的哈希值
 * @param reader Reader对象或Uint8Array
 * @param length 长度
 * @returns 哈希值
 */
export declare function calculateHash(reader: Reader | Uint8Array, length?: number): string;
