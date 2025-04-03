type InputData = number | ArrayBufferLike | ArrayBufferView | IOBuffer | Buffer;
declare const typedArrays: {
    int8: Int8ArrayConstructor;
    uint8: Uint8ArrayConstructor;
    int16: Int16ArrayConstructor;
    uint16: Uint16ArrayConstructor;
    int32: Int32ArrayConstructor;
    uint32: Uint32ArrayConstructor;
    int64: BigInt64ArrayConstructor;
    uint64: BigUint64ArrayConstructor;
    float32: Float32ArrayConstructor;
    float64: Float64ArrayConstructor;
};
type TypedArrays = typeof typedArrays;
interface IOBufferOptions {
    /**
     * 忽略 ArrayBuffer 的前n个字节
     */
    offset?: number;
}
export declare class IOBuffer {
    /**
     * 映射到内部 ArrayBuffer 对象
     */
    buffer: ArrayBufferLike;
    /**
     * 内部 ArrayBuffer 的字节长度
     */
    byteLength: number;
    /**
     * 内部 ArrayBuffer 的字节偏移量
     */
    byteOffset: number;
    /**
     * 内部 ArrayBuffer 的字节长度
     */
    length: number;
    /**
     * 缓冲区指针的当前偏移量
     */
    offset: number;
    private lastWrittenByte;
    private littleEndian;
    private _data;
    private _mark;
    private _marks;
    /**
     * 创建一个新的 IOBuffer
     * @param data 用于构造 IOBuffer 的数据
     * @param options 可选对象
     */
    constructor(data?: InputData, options?: IOBufferOptions);
    /**
     * @private
     * 更新最近写入字节的偏移量
     */
    private _updateLastWrittenByte;
    /**
     * 检查分配给缓冲区的内存是否足以在偏移量之后存储更多字节。
     * @param byteLength 需要的内存字节量
     * @returns
     */
    available(byteLength?: number): boolean;
    /**
     * 检查是否使用 little-endian 模式读写多字节值。
     * @returns
     */
    isLittleEndian(): boolean;
    /**
     * 设置读写多字节值的 little-endian 模式。
     * @returns
     */
    setLittleEndian(): this;
    /**
     * 检查是否使用 big-endian 模式读写多字节值。
     * @returns
     */
    isBigEndian(): boolean;
    /**
     * 为读写多字节值切换到 big-endian 模式。
     * @returns
     */
    setBigEndian(): this;
    /**
     * 将指针向前移动 n 个字节
     * @param n 要跳过的字节数
     * @returns
     */
    skip(n?: number): this;
    /**
     * 将指针向后移动 n 个字节
     * @param n 要回移的字节数
     * @returns
     */
    back(n?: number): this;
    /**
     * 将指针移动到给定的偏移量
     * @param offset 移动到的偏移量
     * @returns
     */
    seek(offset: number): this;
    /**
     * 将指针移动到给定的偏移量
     * @see {@link IOBuffer#reset}
     * @returns
     */
    mark(): this;
    /**
     * 将指针移回由标记设置的最后一个指针偏移量
     * @see {@link IOBuffer#mark}
     * @returns
     */
    reset(): this;
    /**
     * 将当前指针偏移量推入标记堆栈
     * @see {@link IOBuffer#popMark}
     * @returns
     */
    pushMark(): this;
    /**
     * 从标记堆栈中弹出最后一个指针偏移量，并将当前指针偏移量设置为弹出的值
     * @see {@link IOBuffer#pushMark}
     * @returns
     */
    popMark(): this;
    /**
     * 将指针偏移量移回 0
     * @returns
     */
    rewind(): this;
    /**
     * 确保缓冲区有足够的内存在当前指针偏移量处写入给定的 byteLength。如果缓冲区的内存不足，此方法将创建一个长度为（byteLength + 当前偏移量）两倍的新缓冲区（副本）。
     * @param byteLength 所需的内存（以字节为单位）
     * @returns
     */
    ensureAvailable(byteLength?: number): this;
    /**
     * 读取一个字节，如果字节的值为 0，则返回 false，否则返回 true。指针向前移动一个字节
     * @returns
     */
    readBoolean(): boolean;
    /**
     * 读取一个带符号的 8 位整数，并将指针向前移动 1 字节
     * @returns
     */
    readInt8(): number;
    /**
     * 读取一个无符号 8 位整数，并将指针向前移动 1 字节
     * @returns
     */
    readUint8(): number;
    /**
     * Alias for {@link IOBuffer#readUint8}.
     * @returns
     */
    readByte(): number;
    /**
     * 读取 n 字节并将指针向前移动 n 字节
     * @param n 要读取的字节数
     * @returns
     */
    readBytes(n?: number): Uint8Array;
    /**
     * 创建一个与类型 type 和大小 size 相对应的数组。例如，类型 uint8 将创建一个 Uint8Array
     * @param size 结果数组的大小
     * @param type 要读取的元素的数字类型
     * @returns
     */
    readArray<T extends keyof typeof typedArrays>(size: number, type: T): InstanceType<TypedArrays[T]>;
    /**
     * 读取一个 16 位有符号整数，并将指针向前移动 2 字节
     * @returns
     */
    readInt16(): number;
    /**
     * 读取一个 16 位无符号整数，并将指针向前移动 2 字节
     * @returns
     */
    readUint16(): number;
    /**
     * 读取一个 32 位有符号整数，并将指针向前移动 4 字节
     * @returns
     */
    readInt32(): number;
    /**
     * 读取一个 32 位无符号整数，并将指针向前移动 4 字节
     * @returns
     */
    readUint32(): number;
    /**
     * 读取一个 32 位浮点数并将指针向前移动 4 字节
     * @returns
     */
    readFloat32(): number;
    /**
     * 读取 64 位浮点数并将指针向前移动 8 字节
     * @returns
     */
    readFloat64(): number;
    /**
     * 读取一个 64 位带符号整数，并将指针向前移动 8 字节
     * @returns
     */
    readBigInt64(): bigint;
    /**
     * 读取一个 64 位无符号整数，并将指针向前移动 8 字节
     * @returns
     */
    readBigUint64(): bigint;
    /**
     * 读取一个 1 字节的ASCII字符并将指针向前移动 1 字节
     * @returns
     */
    readChar(): string;
    /**
     * 读取 n 个 1 字节的ASCII字符并将指针向前移动 n 个字节
     * @param n 要读取的字符数
     * @returns
     */
    readChars(n?: number): string;
    /**
     * 读取下一个 n 字节，返回一个UTF-8解码字符串，并将指针向前移动 n 字节
     * @param n 要读取的字节数
     * @returns
     */
    readUtf8(n?: number): string;
    /**
     * 读取下一个 n 字节，返回一个用 encoding 解码的字符串，并将指针向前移动 n 字节。如果没有传递编码，则函数等价于 @see {@link IOBuffer#readUtf8}
     * @param n 要读取的字节数
     * @param encoding 要使用的编码。默认为utf8
     * @returns
     */
    decodeText(n?: number, encoding?: string): string;
    /**
     * 如果传递的值为真，则写 0xff，否则写 0x00，并将指针向前移动 1 字节
     * @param value 要写入的值
     * @returns
     */
    writeBoolean(value: unknown): this;
    /**
     * 将 value 写入 8 位有符号整数，并将指针向前移动 1 字节
     * @param value 要写入的值
     * @returns
     */
    writeInt8(value: number): this;
    /**
     * 将 value 写入 8 位无符号整数，并将指针向前移动 1 字节
     * @param value 要写入的值
     * @returns
     */
    writeUint8(value: number): this;
    /**
     * An alias for {@link IOBuffer#writeUint8}
     * @param value 要写入的值
     * @returns
     */
    writeBytes(bytes: ArrayLike<number>): this;
    /**
     * 将 value 写入 16 位带符号整数，并将指针向前移动 2 字节
     * @param value 要写入的值
     * @returns
     */
    writeInt16(value: number): this;
    /**
     * 将 value 写入 16 位无符号整数，并将指针向前移动 2 字节
     * @param value 要写入的值
     * @returns
     */
    writeUint16(value: number): this;
    /**
     * 将 value 写入为 32 位带符号整数，并将指针向前移动 4 字节
     * @param value 要写入的值
     * @returns
     */
    writeInt32(value: number): this;
    /**
     * 将 value 写入为 32 位无符号整数，并将指针向前移动 4 字节
     * @param value 要写入的值
     * @returns
     */
    writeUint32(value: number): this;
    /**
     * 将 value 写入 32 位浮点数，并将指针向前移动 4 字节
     * @param value 要写入的值
     * @returns
     */
    writeFloat32(value: number): this;
    /**
     * 将 value 写入 64 位浮点数，并将指针向前移动 8 字节
     * @param value 要写入的值
     * @returns
     */
    writeFloat64(value: number): this;
    /**
     * 将 value 写入 64 位带符号的 bigint，并将指针向前移动 8 字节
     * @param value 要写入的值
     * @returns
     */
    writeBigInt64(value: bigint): this;
    /**
     * 将 value 写入 64 位 unsigned bigint，并将指针向前移动 8 字节
     * @param value 要写入的值
     * @returns
     */
    writeBigUint64(value: bigint): this;
    /**
     * 将 str 的第一个字符的 charCode 写成一个 8 位无符号整数，并将指针向前移动 1 字节。
     * @param str 要写的字符
     * @returns
     */
    writeChar(str: string): this;
    /**
     * 将所有 str 字符的 charCodes 写入为 8 位无符号整数，并将指针向前移动 str 。长度的字节
     * @param str 要写的字
     * @returns
     */
    writeChars(str: string): this;
    /**
     * UTF-8 编码并将 str 写入当前指针偏移量，并根据编码长度向前移动指针
     * @param str 要写入的字符串
     * @returns
     */
    writeUtf8(str: string): this;
    /**
     * 导出内部缓冲区的 Uint8Array 视图。视图从字节偏移开始，并计算其长度，直到最后写入字节或原始长度为止
     * @returns
     */
    toArray(): Uint8Array;
    /**
     *  获取到目前为止写入的字节总数，而不考虑当前偏移量
     * @returns
     */
    getWrittenByteLength(): number;
}
export {};
