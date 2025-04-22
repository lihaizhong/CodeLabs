// import { utf8 } from "./utf8"
import { platform } from "../../../platform"
import float from "./float";
// import { LongBits } from "../dts";

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
  static create(buffer: Reader | Uint8Array) {
    if (buffer instanceof Reader) {
      return buffer;
    }

    if (buffer instanceof Uint8Array) {
      return new Reader(buffer);
    }

    throw Error("illegal buffer");
  }

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

  private slice(buf: Uint8Array, begin: number, end: number) {
    return buf.subarray(begin, end);
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

  // private readLongVarint() {
  //   // tends to deopt with local vars for octet etc.
  //   const bits = new LongBits(0, 0);
  //   let i = 0;

  //   if (this.len - this.pos > 4) {
  //     // fast route (lo)
  //     for (let i = 0; i < 4; ++i) {
  //       // 1st..4th
  //       bits.lo = (bits.lo | ((this.buf[this.pos] & 127) << (i * 7))) >>> 0;
  //       if (this.buf[this.pos++] < 128) {
  //         return bits;
  //       }
  //     }
  //     // 5th
  //     bits.lo = (bits.lo | ((this.buf[this.pos] & 127) << 28)) >>> 0;
  //     bits.hi = (bits.hi | ((this.buf[this.pos] & 127) >> 4)) >>> 0;
  //     if (this.buf[this.pos++] < 128) {
  //       return bits;
  //     }
  //     i = 0;
  //   } else {
  //     for (; i < 3; ++i) {
  //       /* istanbul ignore if */
  //       if (this.pos >= this.len) {
  //         throw this.indexOutOfRange(this);
  //       }
  //       // 1st..3th
  //       bits.lo = (bits.lo | ((this.buf[this.pos] & 127) << (i * 7))) >>> 0;
  //       if (this.buf[this.pos++] < 128) {
  //         return bits;
  //       }
  //     }
  //     // 4th
  //     bits.lo = (bits.lo | ((this.buf[this.pos++] & 127) << (i * 7))) >>> 0;
  //     return bits;
  //   }
  //   if (this.len - this.pos > 4) {
  //     // fast route (hi)
  //     for (; i < 5; ++i) {
  //       // 6th..10th
  //       bits.hi = (bits.hi | ((this.buf[this.pos] & 127) << (i * 7 + 3))) >>> 0;
  //       if (this.buf[this.pos++] < 128) {
  //         return bits;
  //       }
  //     }
  //   } else {
  //     for (; i < 5; ++i) {
  //       /* istanbul ignore if */
  //       if (this.pos >= this.len) {
  //         throw this.indexOutOfRange(this);
  //       }
  //       // 6th..10th
  //       bits.hi = (bits.hi | ((this.buf[this.pos] & 127) << (i * 7 + 3))) >>> 0;
  //       if (this.buf[this.pos++] < 128) {
  //         return bits;
  //       }
  //     }
  //   }

  //   /* istanbul ignore next */
  //   throw Error("invalid varint encoding");
  // }

  // private readFixed32_end(buf: Uint8Array, end: number) {
  //   // note that this uses `end`, not `pos`
  //   return (
  //     (buf[end - 4] |
  //       (buf[end - 3] << 8) |
  //       (buf[end - 2] << 16) |
  //       (buf[end - 1] << 24)) >>>
  //     0
  //   );
  // }

  // private readFixed64(/* this: Reader */) {
  //   /* istanbul ignore if */
  //   if (this.pos + 8 > this.len) throw this.indexOutOfRange(this, 8);

  //   return new LongBits(
  //     this.readFixed32_end(this.buf, (this.pos += 4)),
  //     this.readFixed32_end(this.buf, (this.pos += 4))
  //   );
  // }

  /**
   * Reads a varint as an unsigned 32 bit value.
   * @function
   * @returns {number} Value read
   */
  uint32() {
    let value = 4294967295;

    value = (this.buf[this.pos] & 127) >>> 0;
    if (this.buf[this.pos++] < 128) {
      return value;
    }

    value = (value | ((this.buf[this.pos] & 127) << 7)) >>> 0;
    if (this.buf[this.pos++] < 128) {
      return value;
    }

    value = (value | ((this.buf[this.pos] & 127) << 14)) >>> 0;
    if (this.buf[this.pos++] < 128) {
      return value;
    }

    value = (value | ((this.buf[this.pos] & 127) << 21)) >>> 0;
    if (this.buf[this.pos++] < 128) {
      return value;
    }

    value = (value | ((this.buf[this.pos] & 15) << 28)) >>> 0;
    if (this.buf[this.pos++] < 128) {
      return value;
    }

    if ((this.pos += 5) > this.len) {
      this.pos = this.len;

      throw this.indexOutOfRange(this, 10);
    }

    return value;
  }

  /**
   * Reads a varint as a signed 32 bit value.
   * @returns {number} Value read
   */
  int32() {
    return this.uint32() | 0;
  }

  /**
   * Reads a zig-zag encoded varint as a signed 32 bit value.
   * @returns {number} Value read
   */
  // sint32() {
  //   const value = this.uint32();

  //   return ((value >>> 1) ^ -(value & 1)) | 0;
  // }

  /**
   * Reads a varint as an unsigned 64 bit value.
   * @name Reader#uint64
   * @function
   * @returns {Long} Value read
   */
  // uint64() {
  //   return this.readLongVarint().toNumber(true);
  // }

  /**
   * Reads a varint as a signed 64 bit value.
   * @name Reader#int64
   * @function
   * @returns {Long} Value read
   */
  // int64() {
  //   return this.readLongVarint().toNumber(false);
  // }

  /**
   * Reads a zig-zag encoded varint as a signed 64 bit value.
   * @name Reader#sint64
   * @function
   * @returns {Long} Value read
   */
  // sint64() {
  //   return this.readLongVarint().zzDecode().toNumber(false);
  // }

  /**
   * Reads a varint as a boolean.
   * @returns {boolean} Value read
   */
  // bool() {
  //   return this.uint32() != 0;
  // }

  /**
   * Reads fixed 32 bits as an unsigned 32 bit integer.
   * @returns {number} Value read
   */
  // fixed32() {
  //   if (this.pos + 4 > this.len) {
  //     throw this.indexOutOfRange(this, 4);
  //   }

  //   return this.readFixed32_end(this.buf, (this.pos += 4));
  // }

  /**
   * Reads fixed 32 bits as a signed 32 bit integer.
   * @returns {number} Value read
   */
  // sfixed32() {
  //   if (this.pos + 4 > this.len) {
  //     throw this.indexOutOfRange(this, 4);
  //   }

  //   return this.readFixed32_end(this.buf, (this.pos += 4)) | 0;
  // }

  /**
   * Reads fixed 64 bits.
   * @name Reader#fixed64
   * @function
   * @returns {Long} Value read
   */
  // fixed64() {
  //   return this.readFixed64().toNumber(true);
  // }

  /**
   * Reads zig-zag encoded fixed 64 bits.
   * @name Reader#sfixed64
   * @function
   * @returns {Long} Value read
   */
  // sfixed64() {
  //   return this.readFixed64().zzDecode().toNumber(false);
  // }

  /**
   * Reads a float (32 bit) as a number.
   * @function
   * @returns {number} Value read
   */
  float() {
    if (this.pos + 4 > this.len) {
      throw this.indexOutOfRange(this, 4);
    }

    const value = float.readFloatLE(this.buf, this.pos);
    this.pos += 4;

    return value;
  }

  /**
   * Reads a double (64 bit float) as a number.
   * @function
   * @returns {number} Value read
   */
  // double() {
  //   if (this.pos + 8 > this.len) {
  //     throw this.indexOutOfRange(this, 4);
  //   }

  //   const value = float.readDoubleLE(this.buf, this.pos);
  //   this.pos += 8;

  //   return value;
  // }

  /**
   * Reads a sequence of bytes preceeded by its length as a varint.
   * @returns {Uint8Array} Value read
   */
  bytes() {
    const length = this.uint32();
    const start = this.pos;
    const end = start + length;

    if (end > this.len) {
      throw this.indexOutOfRange(this, length);
    }

    this.pos += length;
    if (length === 0) {
      return Reader.EMPTY_UINT8ARRAY;
    }

    return this.slice(this.buf, start, end);
  }

  /**
   * Reads a string preceeded by its byte length as a varint.
   * @returns {string} Value read
   */
  string() {
    const bytes = this.bytes();

    return platform.decode.utf8(bytes, 0, bytes.length);
  }

  /**
   * Skips the specified number of bytes if specified, otherwise skips a varint.
   * @param {number} [length] Length if known, otherwise a varint is assumed
   * @returns {Reader} `this`
   */
  skip(length?: number) {
    if (typeof length == "number") {
      /* istanbul ignore if */
      if (this.pos + length > this.len) {
        throw this.indexOutOfRange(this, length);
      }
      this.pos += length;
    } else {
      // 优化变长整数跳过逻辑
      const startPos = this.pos;

      while (this.pos < this.len) {
        if (this.buf[this.pos++] < 128) {
          return this;
        }
        // 防止无限循环，最多读取10个字节
        if (this.pos - startPos >= 10) {
          throw Error("invalid varint encoding");
        }
      }
      throw this.indexOutOfRange(this);
    }
    return this;
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
        while ((wireType = this.uint32() & 7) != 4) {
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
