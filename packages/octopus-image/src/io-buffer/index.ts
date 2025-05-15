import { decode, encode } from "./text";

type InputData = number | ArrayBufferLike | ArrayBufferView | IOBuffer | Buffer;

const DEFAULT_BYTE_LENGTH = 1024 * 8;
const hostBigEndian = (() => {
  const array = new Uint8Array(4);
  const view = new Uint32Array(array.buffer);

  return !((view[0] = 1) & array[0]);
})();

const typedArrays = {
  int8: Int8Array,
  uint8: Uint8Array,
  int16: Int16Array,
  uint16: Uint16Array,
  int32: Int32Array,
  uint32: Uint32Array,
  int64: BigInt64Array,
  uint64: BigUint64Array,
  float32: Float32Array,
  float64: Float64Array
}

type TypedArrays = typeof typedArrays;

interface IOBufferOptions {
  /**
   * 忽略 ArrayBuffer 的前n个字节
   */
  offset?: number;
}

export class IOBuffer {
  /**
   * 映射到内部 ArrayBuffer 对象
   */
  public buffer: ArrayBufferLike;
  /**
   * 内部 ArrayBuffer 的字节长度
   */
  public byteLength: number;
  /**
   * 内部 ArrayBuffer 的字节偏移量
   */
  public byteOffset: number;
  /**
   * 内部 ArrayBuffer 的字节长度
   */
  public length: number;
  /**
   * 缓冲区指针的当前偏移量
   */
  public offset: number;

  private lastWrittenByte: number;
  private littleEndian: boolean;

  private _data: DataView;
  private _mark: number;
  private _marks: number[];

  /**
   * 创建一个新的 IOBuffer
   * @param data 用于构造 IOBuffer 的数据
   * @param options 可选对象
   */
  public constructor(
    data: InputData = DEFAULT_BYTE_LENGTH,
    options: IOBufferOptions = {},
  ) {
    let dataIsGiven = false;

    if (typeof data === 'number') {
      data = new ArrayBuffer(data);
    } else {
      dataIsGiven = true;
      this.lastWrittenByte = data.byteLength;
    }

    const offset = options.offset ? options.offset >>> 0 : 0;
    const byteLength = data.byteLength - offset;
    let dvOffset = offset;

    if (ArrayBuffer.isView(data) || data instanceof IOBuffer) {
      if (data.byteLength !== data.buffer.byteLength) {
        dvOffset = data.byteOffset + offset;
      }

      data = data.buffer;
    }

    this.lastWrittenByte = dataIsGiven ? byteLength : 0;
    this.buffer = data;
    this.length = byteLength;
    this.byteLength = byteLength;
    this.byteOffset = dvOffset;
    this.offset = 0;
    this.littleEndian = true;
    this._data = new DataView(this.buffer, dvOffset, byteLength);
    this._mark = 0;
    this._marks = [];
  }

  /**
   * @private
   * 更新最近写入字节的偏移量
   */
  private _updateLastWrittenByte(): void {
    if (this.offset > this.lastWrittenByte) {
      this.lastWrittenByte = this.offset;
    }
  }

  /**
   * 检查分配给缓冲区的内存是否足以在偏移量之后存储更多字节。
   * @param byteLength 需要的内存字节量
   * @returns 
   */
  public available(byteLength = 1): boolean {
    return this.offset + byteLength <= this.length;
  }

  /**
   * 检查是否使用 little-endian 模式读写多字节值。
   * @returns 
   */
  public isLittleEndian(): boolean {
    return this.littleEndian;
  }

  /**
   * 设置读写多字节值的 little-endian 模式。
   * @returns 
   */
  public setLittleEndian(): this {
    this.littleEndian = true;

    return this;
  }

  /**
   * 检查是否使用 big-endian 模式读写多字节值。
   * @returns 
   */
  public isBigEndian(): boolean {
    return !this.littleEndian;
  }

  /**
   * 为读写多字节值切换到 big-endian 模式。
   * @returns 
   */
  public setBigEndian(): this {
    this.littleEndian = false;

    return this;
  }

  /**
   * 将指针向前移动 n 个字节
   * @param n 要跳过的字节数
   * @returns
   */
  public skip(n = 1): this {
    this.offset += n;

    return this;
  }

  /**
   * 将指针向后移动 n 个字节
   * @param n 要回移的字节数
   * @returns 
   */
  public back(n = 1): this {
    this.offset -= n;

    return this;
  }

  /**
   * 将指针移动到给定的偏移量
   * @param offset 移动到的偏移量
   * @returns
   */
  public seek(offset: number): this {
    this.offset = offset;

    return this;
  }

  /**
   * 将指针移动到给定的偏移量
   * @see {@link IOBuffer#reset}
   * @returns
   */
  public mark(): this {
    this._mark = this.offset;

    return this;
  }

  /**
   * 将指针移回由标记设置的最后一个指针偏移量
   * @see {@link IOBuffer#mark}
   * @returns
   */
  public reset(): this {
    this.offset = this._mark;

    return this;
  }

  /**
   * 将当前指针偏移量推入标记堆栈
   * @see {@link IOBuffer#popMark}
   * @returns
   */
  public pushMark(): this {
    this._marks.push(this.offset);

    return this;
  }

  /**
   * 从标记堆栈中弹出最后一个指针偏移量，并将当前指针偏移量设置为弹出的值
   * @see {@link IOBuffer#pushMark}
   * @returns
   */
  public popMark(): this {
    const offset = this._marks.pop();

    if (offset === undefined) {
      throw new Error('Mark stack empty');
    }

    this.seek(offset);

    return this;
  }

  /**
   * 将指针偏移量移回 0
   * @returns
   */
  public rewind(): this {
    this.offset = 0;

    return this;
  }

  /**
   * 确保缓冲区有足够的内存在当前指针偏移量处写入给定的 byteLength。如果缓冲区的内存不足，此方法将创建一个长度为（byteLength + 当前偏移量）两倍的新缓冲区（副本）。
   * @param byteLength 所需的内存（以字节为单位）
   * @returns
   */
  public ensureAvailable(byteLength = 1): this {
    if (!this.available(byteLength)) {
      const lengthNeeded = this.offset + byteLength;
      const newLength = lengthNeeded * 2;
      const newArray = new Uint8Array(newLength);

      newArray.set(new Uint8Array(this.buffer));

      this.buffer = newArray.buffer;
      this.length = this.byteLength = newLength;
      this._data = new DataView(this.buffer);
    }

    return this;
  }

  /**
   * 读取一个字节，如果字节的值为 0，则返回 false，否则返回 true。指针向前移动一个字节
   * @returns
   */
  public readBoolean(): boolean {
    return this.readUint8() !== 0;
  }

  /**
   * 读取一个带符号的 8 位整数，并将指针向前移动 1 字节
   * @returns
   */
  public readInt8(): number {
    return this._data.getInt8(this.offset++);
  }

  /**
   * 读取一个无符号 8 位整数，并将指针向前移动 1 字节
   * @returns
   */
  public readUint8(): number {
    return this._data.getUint8(this.offset++);
  }

  /**
   * Alias for {@link IOBuffer#readUint8}.
   * @returns
   */
  public readByte(): number {
    return this.readUint8();
  }

  /**
   * 读取 n 字节并将指针向前移动 n 字节
   * @param n 要读取的字节数
   * @returns
   */
  public readBytes(n = 1): Uint8Array {
    return this.readArray(n, 'uint8');
  }

  /**
   * 创建一个与类型 type 和大小 size 相对应的数组。例如，类型 uint8 将创建一个 Uint8Array
   * @param size 结果数组的大小
   * @param type 要读取的元素的数字类型
   * @returns
   */
  public readArray<T extends keyof typeof typedArrays>(
    size: number,
    type: T
  ): InstanceType<TypedArrays[T]> {
    const bytes = typedArrays[type].BYTES_PER_ELEMENT * size;
    const offset = this.byteOffset + this.offset;

    if (
      this.littleEndian === hostBigEndian
      && type !== 'uint8'
      && type !== 'int8'
    ) {
      const slice = new Uint8Array(this.buffer.slice(offset, offset + bytes) as ArrayBuffer);
      slice.reverse();

      const returnArray = new typedArrays[type](slice.buffer);

      this.offset += bytes;
      returnArray.reverse();

      return returnArray as InstanceType<TypedArrays[T]>;
    }

    const slice = this.buffer.slice(offset, offset + bytes) as ArrayBuffer;
    const returnArray = new typedArrays[type](slice);

    this.offset += bytes;

    return returnArray as InstanceType<TypedArrays[T]>;
  }

  /**
   * 读取一个 16 位有符号整数，并将指针向前移动 2 字节
   * @returns
   */
  public readInt16(): number {
    const value = this._data.getInt16(this.offset, this.littleEndian);

    this.offset += 2;
    return value;
  }

  /**
   * 读取一个 16 位无符号整数，并将指针向前移动 2 字节
   * @returns
   */
  public readUint16(): number {
    const value = this._data.getUint16(this.offset, this.littleEndian);

    this.offset += 2;
    return value;
  }

  /**
   * 读取一个 32 位有符号整数，并将指针向前移动 4 字节
   * @returns
   */
  public readInt32(): number {
    const value = this._data.getInt32(this.offset, this.littleEndian);

    this.offset += 4;
    return value;
  }

  /**
   * 读取一个 32 位无符号整数，并将指针向前移动 4 字节
   * @returns
   */
  public readUint32(): number {
    const value = this._data.getUint32(this.offset, this.littleEndian);

    this.offset += 4;
    return value;
  }

  /**
   * 读取一个 32 位浮点数并将指针向前移动 4 字节
   * @returns
   */
  public readFloat32(): number {
    const value = this._data.getFloat32(this.offset, this.littleEndian);

    this.offset += 4;
    return value;
  }

  /**
   * 读取 64 位浮点数并将指针向前移动 8 字节
   * @returns
   */
  public readFloat64(): number {
    const value = this._data.getFloat64(this.offset, this.littleEndian);

    this.offset += 8;
    return value;
  }

  /**
   * 读取一个 64 位带符号整数，并将指针向前移动 8 字节
   * @returns
   */
  public readBigInt64(): bigint {
    const value = this._data.getBigInt64(this.offset, this.littleEndian);

    this.offset += 8;
    return value;
  }

  /**
   * 读取一个 64 位无符号整数，并将指针向前移动 8 字节
   * @returns
   */
  public readBigUint64(): bigint {
    const value = this._data.getBigUint64(this.offset, this.littleEndian);

    this.offset += 8;
    return value;
  }

  /**
   * 读取一个 1 字节的ASCII字符并将指针向前移动 1 字节
   * @returns
   */
  public readChar(): string {
    return String.fromCharCode(this.readInt8());
  }

  /**
   * 读取 n 个 1 字节的ASCII字符并将指针向前移动 n 个字节
   * @param n 要读取的字符数
   * @returns
   */
  public readChars(n = 1): string {
    let result = '';

    for (let i = 0; i < n; i++) {
      result += this.readChar();
    }

    return result;
  }

  /**
   * 读取下一个 n 字节，返回一个UTF-8解码字符串，并将指针向前移动 n 字节
   * @param n 要读取的字节数
   * @returns
   */
  public readUtf8(n = 1): string {
    return decode(this.readBytes(n));
  }

  /**
   * 读取下一个 n 字节，返回一个用 encoding 解码的字符串，并将指针向前移动 n 字节。如果没有传递编码，则函数等价于 @see {@link IOBuffer#readUtf8}
   * @param n 要读取的字节数
   * @param encoding 要使用的编码。默认为utf8
   * @returns
   */
  public decodeText(n = 1, encoding = 'utf8'): string {
    return decode(this.readBytes(n), encoding);
  }

  /**
   * 如果传递的值为真，则写 0xff，否则写 0x00，并将指针向前移动 1 字节
   * @param value 要写入的值
   * @returns
   */
  public writeBoolean(value: unknown): this {
    this.writeUint8(value ? 0xff : 0x00);

    return this;
  }

  /**
   * 将 value 写入 8 位有符号整数，并将指针向前移动 1 字节
   * @param value 要写入的值
   * @returns
   */
  public writeInt8(value: number): this {
    this.ensureAvailable(1);
    this._data.setInt8(this.offset++, value);
    this._updateLastWrittenByte();

    return this;
  }

  /**
   * 将 value 写入 8 位无符号整数，并将指针向前移动 1 字节
   * @param value 要写入的值
   * @returns
   */
  public writeUint8(value: number): this {
    this.ensureAvailable(1);
    this._data.setUint8(this.offset++, value);
    this._updateLastWrittenByte();

    return this;
  }

  /**
   * An alias for {@link IOBuffer#writeUint8}
   * @param value 要写入的值
   * @returns
   */
  public writeBytes(bytes: ArrayLike<number>): this {
    const n = bytes.length;
    this.ensureAvailable(n);

    for (let i = 0; i < n; i++) {
      this._data.setUint8(this.offset++, bytes[i]);
    }

    this._updateLastWrittenByte();

    return this;
  }

  /**
   * 将 value 写入 16 位带符号整数，并将指针向前移动 2 字节
   * @param value 要写入的值
   * @returns
   */
  public writeInt16(value: number): this {
    this.ensureAvailable(2);
    this._data.setInt16(this.offset, value, this.littleEndian);
    this.offset += 2;
    this._updateLastWrittenByte();

    return this;
  }

  /**
   * 将 value 写入 16 位无符号整数，并将指针向前移动 2 字节
   * @param value 要写入的值
   * @returns
   */
  public writeUint16(value: number): this {
    this.ensureAvailable(2);
    this._data.setUint16(this.offset, value, this.littleEndian);
    this.offset += 2;
    this._updateLastWrittenByte();

    return this;
  }

  /**
   * 将 value 写入为 32 位带符号整数，并将指针向前移动 4 字节
   * @param value 要写入的值
   * @returns
   */
  public writeInt32(value: number): this {
    this.ensureAvailable(4);
    this._data.setInt32(this.offset, value, this.littleEndian);
    this.offset += 4;
    this._updateLastWrittenByte();

    return this;
  }

  /**
   * 将 value 写入为 32 位无符号整数，并将指针向前移动 4 字节
   * @param value 要写入的值
   * @returns
   */
  public writeUint32(value: number): this {
    this.ensureAvailable(4);
    this._data.setUint32(this.offset, value, this.littleEndian);
    this.offset += 4;
    this._updateLastWrittenByte();

    return this;
  }

  /**
   * 将 value 写入 32 位浮点数，并将指针向前移动 4 字节
   * @param value 要写入的值
   * @returns
   */
  public writeFloat32(value: number): this {
    this.ensureAvailable(8);
    this._data.setFloat32(this.offset, value, this.littleEndian);
    this.offset += 4;
    this._updateLastWrittenByte();

    return this;
  }

  /**
   * 将 value 写入 64 位浮点数，并将指针向前移动 8 字节
   * @param value 要写入的值
   * @returns
   */
  public writeFloat64(value: number): this {
    this.ensureAvailable(8);
    this._data.setFloat64(this.offset, value, this.littleEndian);
    this.offset += 8;
    this._updateLastWrittenByte();

    return this;
  }

  /**
   * 将 value 写入 64 位带符号的 bigint，并将指针向前移动 8 字节
   * @param value 要写入的值
   * @returns
   */
  public writeBigInt64(value: bigint): this {
    this.ensureAvailable(8);
    this._data.setBigInt64(this.offset, value, this.littleEndian);
    this.offset += 8;
    this._updateLastWrittenByte();

    return this;
  }

  /**
   * 将 value 写入 64 位 unsigned bigint，并将指针向前移动 8 字节
   * @param value 要写入的值
   * @returns
   */
  public writeBigUint64(value: bigint): this {
    this.ensureAvailable(8);
    this._data.setBigUint64(this.offset, value, this.littleEndian);
    this.offset += 8;
    this._updateLastWrittenByte();

    return this;
  }

  /**
   * 将 str 的第一个字符的 charCode 写成一个 8 位无符号整数，并将指针向前移动 1 字节。
   * @param str 要写的字符
   * @returns
   */
  public writeChar(str: string): this {
    return this.writeUint8(str.charCodeAt(0));
  }

  /**
   * 将所有 str 字符的 charCodes 写入为 8 位无符号整数，并将指针向前移动 str 。长度的字节
   * @param str 要写的字
   * @returns
   */
  public writeChars(str: string): this {
    for (let i = 0; i < str.length; i++) {
      this.writeUint8(str.charCodeAt(i));
    }

    return this;
  }

  /**
   * UTF-8 编码并将 str 写入当前指针偏移量，并根据编码长度向前移动指针
   * @param str 要写入的字符串
   * @returns
   */
  public writeUtf8(str: string): this {
    return this.writeBytes(encode(str));
  }

  /**
   * 导出内部缓冲区的 Uint8Array 视图。视图从字节偏移开始，并计算其长度，直到最后写入字节或原始长度为止
   * @returns
   */
  public toArray(): Uint8Array {
    return new Uint8Array(this.buffer, this.byteOffset, this.lastWrittenByte);
  }

  /**
   *  获取到目前为止写入的字节总数，而不考虑当前偏移量
   * @returns
   */
  public getWrittenByteLength(): number {
    return this.lastWrittenByte - this.byteOffset;
  }
}
