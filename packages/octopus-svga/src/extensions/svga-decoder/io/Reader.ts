import { platform } from "../../../platform";
import { readFloatLE } from "./float";
import { Preflight } from "./preflight";

export default class Reader {
  // 添加静态缓存，用于常用的空数组
  private static EMPTY_UINT8ARRAY = new Uint8Array(0);

  /**
   * Creates a new reader using the specified buffer.
   * @function
   * @param {Reader|Uint8Array|Buffer} buffer Buffer to read from
   * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
   * @throws {Error} If `buffer` is not a valid buffer
   */
  // static create(buffer: Reader | Uint8Array) {
  //   if (buffer instanceof Reader) {
  //     return buffer;
  //   }

  //   if (buffer instanceof Uint8Array) {
  //     return new Reader(buffer);
  //   }

  //   throw Error("illegal buffer");
  // }

  /**
   * Read buffer.
   * @type {Uint8Array}
   */
  buf: Uint8Array;
  /**
   * Read buffer position.
   * @type {number}
   */
  pos: number;
  /**
   * Read buffer length.
   * @type {number}
   */
  len: number;

  preflight = new Preflight();

  /**
   * Constructs a new reader instance using the specified buffer.
   * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
   * @constructor
   * @param {Uint8Array} buffer Buffer to read from
   */
  constructor(buffer: Uint8Array) {
    this.buf = buffer;
    this.pos = 0;
    this.len = buffer.length;
  }

  private indexOutOfRange(reader: Reader, writeLength?: number) {
    return new RangeError(
      "index out of range: " +
        reader.pos +
        " + " +
        (writeLength || 1) +
        " > " +
        reader.len
    );
  }

  /**
   * 将复杂逻辑分离到单独方法
   * @returns
   */
  private readVarint32Slow() {
    let byte = this.buf[this.pos++];
    let value = byte & 0x7f;
    let shift = 7;

    // 使用do-while循环减少条件判断
    do {
      if (this.pos >= this.len) {
        throw this.indexOutOfRange(this);
      }

      byte = this.buf[this.pos++];
      value |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte >= 128 && shift < 32);

    return value >>> 0; // 确保无符号
  }

  /**
   * Reads a varint as an unsigned 32 bit value.
   * @function
   * @returns {number} Value read
   */
  uint32() {
    // 快速路径：大多数情况下是单字节
    const byte = this.buf[this.pos];

    if (byte < 128) {
      this.pos++;

      return byte;
    }

    // 慢速路径：多字节处理
    return this.readVarint32Slow();
  }

  /**
   * Reads a varint as a signed 32 bit value.
   * @returns {number} Value read
   */
  int32() {
    return this.uint32() | 0;
  }

  /**
   * Reads a float (32 bit) as a number.
   * @function
   * @returns {number} Value read
   */
  float() {
    if (this.pos + 4 > this.len) {
      throw this.indexOutOfRange(this, 4);
    }

    const value = readFloatLE(this.buf, this.pos);

    this.pos += 4;

    return value;
  }

  private getBytesRange() {
    const length = this.uint32();
    const start = this.pos;
    const end = start + length;

    if (end > this.len) {
      throw this.indexOutOfRange(this, length);
    }

    return [start, end, length];
  }

  /**
   * Reads a sequence of bytes preceeded by its length as a varint.
   * @returns {Uint8Array} Value read
   */
  bytes() {
    const [start, end, length] = this.getBytesRange();

    this.pos += length;

    if (length === 0) {
      return Reader.EMPTY_UINT8ARRAY;
    }

    return this.buf.subarray(start, end);
  }

  /**
   * Reads a string preceeded by its byte length as a varint.
   * @returns {string} Value read
   */
  string() {
    const [start, end] = this.getBytesRange();
    // 直接在原始buffer上解码，避免创建中间bytes对象
    const result = platform.decode.utf8(this.buf, start, end);

    this.pos = end;

    return result;
  }

  /**
   * Skips the specified number of bytes if specified, otherwise skips a varint.
   * @param {number} [length] Length if known, otherwise a varint is assumed
   * @returns {Reader} `this`
   */
  skip(length?: number) {
    if (typeof length === "number") {
      if (this.pos + length > this.len) {
        throw this.indexOutOfRange(this, length);
      }

      this.pos += length;

      return this;
    }
    
    // 变长整数跳过优化 - 使用位运算
    const buf = this.buf;
    const len = this.len;
    let pos = this.pos;
    
    // 一次检查多个字节，减少循环次数
    while (pos < len) {
      const byte = buf[pos++];

      if ((byte & 0x80) === 0) {
        this.pos = pos;

        return this;
      }

      // 快速检查连续的高位字节
      if (pos < len && (buf[pos] & 0x80) !== 0) {
        pos++;

        if (pos < len && (buf[pos] & 0x80) !== 0) {
          pos++;

          if (pos < len && (buf[pos] & 0x80) !== 0) {
            pos++;

            // 继续检查剩余字节
            while (pos < len && (buf[pos] & 0x80) !== 0) {
              pos++;

              if (pos - this.pos >= 10) {
                throw Error("invalid varint encoding");
              }
            }

            if (pos < len) {
              this.pos = pos + 1;

              return this;
            }
          }
        }
      }
    }
    
    throw this.indexOutOfRange(this);
  }

  /**
   * Skips the next element of the specified wire type.
   * @param {number} wireType Wire type received
   * @returns {Reader} `this`
   */
  skipType(wireType: number) {
    switch (wireType) {
      case 0:
        this.skip();
        break;
      case 1:
        this.skip(8);
        break;
      case 2:
        this.skip(this.uint32());
        break;
      case 3:
        while ((wireType = this.uint32() & 7) !== 4) {
          this.skipType(wireType);
        }
        break;
      case 5:
        this.skip(4);
        break;

      /* istanbul ignore next */
      default:
        throw Error("invalid wire type " + wireType + " at offset " + this.pos);
    }

    return this;
  }
}
