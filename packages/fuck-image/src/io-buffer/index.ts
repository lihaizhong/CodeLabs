type InputData = number | ArrayBufferLike | ArrayBufferView | IOBuffer | Buffer;

const DEFAULT_BYTE_LENGTH = 1024 * 8;

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

  private _updateLastWrittenByte(): void {}

  public available(byteLength = 1): boolean {}

  public isLittleEndian(): boolean {}

  public setLittleEndian(): this {}

  public isBigEndian(): boolean {}

  public setBigEndian(): this {}

  public skip(n = 1): this {}

  public back(n = 1): this {}

  public seek(offset: number): this {}

  public mark(): this {}

  public reset(): this {}

  public pushMark(): this {}

  public popMark(): this {}

  public rewind(): this {}

  public ensureAvailable(byteLength = 1): this {}

  public readBoolean(): boolean {}

  public readInt8(): number {}

  public readUint8(): number {}

  public readByte(): number {}

  public readBytes(n = 1): Unit8Array {}

  public readArray<T extends keyof typeof typedArrays>(
    size: number,
    type: T
  ): InstanceType<TypedArrays[T]> {}

  public readInt16(): number {}

  public readUint16(): number {}

  public readInt32(): number {}

  public readUint32(): number {}

  public readFloat32(): number {}

  public readFloat64(): number {}

  public readBigInt64(): bigint {}

  public readBigUint64(): bigint {}

  public readChar(): string {}

  public readChars(n = 1): string {}

  public readUtf8(n = 1): string {}

  public decodeText(n = 1, encoding = 'utf8'): string {}

  public writeBoolean(value: unknown): this {}

  public writeInt8(value: number): this {}

  public writeUint8(value: number): this {}

  public writeBytes(bytes: ArrayLike<number>): this {}

  public writeInt16(value: number): this {}

  public writeUint16(value: number): this {}

  public writeInt32(value: number): this {}

  public writeUint32(value: number): this {}

  public writeFloat32(value: number): this {}

  public writeFloat64(value: number): this {}

  public writeBigInt64(value: bigint): this {}

  public writeBigUint64(value: bigint): this {}

  public writeChar(str: string): this {}

  public writeChars(str: string): this {}

  public writeUtf8(str: string): this {}

  public toArray(): Uint8Array {}

  public getWrittenByteLength(): number {}
}
