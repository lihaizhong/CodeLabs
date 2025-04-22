declare const _default: {
    /**
     * 从 Uint8Array 中读取一个 64 位有符号整数（小端序）并返回 BigInt
     */
    readLongLEAsBigInt(buf: Uint8Array, pos: number): bigint;
    /**
     * 从 Uint8Array 中读取一个 64 位无符号整数（小端序）并返回 BigInt
     */
    readULongLEAsBigInt(buf: Uint8Array, pos: number): bigint;
    /**
     * 将一个 BigInt 写入 Uint8Array 作为 64 位有符号整数（小端序）
     */
    writeLongLEFromBigInt(value: bigint, buf: Uint8Array, pos: number): void;
    /**
     * 将一个 BigInt 写入 Uint8Array 作为 64 位无符号整数（小端序）
     */
    writeULongLEFromBigInt(value: bigint, buf: Uint8Array, pos: number): void;
    readLongBEAsBigInt(buf: Uint8Array, pos: number): bigint;
    readULongBEAsBigInt(buf: Uint8Array, pos: number): bigint;
    writeLongBEFromBigInt(value: bigint, buf: Uint8Array, pos: number): void;
    writeULongBEFromBigInt(value: bigint, buf: Uint8Array, pos: number): void;
};
export default _default;
