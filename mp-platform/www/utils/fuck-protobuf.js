function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var float$1;
var hasRequiredFloat;

function requireFloat () {
	if (hasRequiredFloat) return float$1;
	hasRequiredFloat = 1;

	float$1 = factory(factory);

	/**
	 * Reads / writes floats / doubles from / to buffers.
	 * @name util.float
	 * @namespace
	 */

	/**
	 * Writes a 32 bit float to a buffer using little endian byte order.
	 * @name util.float.writeFloatLE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Writes a 32 bit float to a buffer using big endian byte order.
	 * @name util.float.writeFloatBE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Reads a 32 bit float from a buffer using little endian byte order.
	 * @name util.float.readFloatLE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Reads a 32 bit float from a buffer using big endian byte order.
	 * @name util.float.readFloatBE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Writes a 64 bit double to a buffer using little endian byte order.
	 * @name util.float.writeDoubleLE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Writes a 64 bit double to a buffer using big endian byte order.
	 * @name util.float.writeDoubleBE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Reads a 64 bit double from a buffer using little endian byte order.
	 * @name util.float.readDoubleLE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Reads a 64 bit double from a buffer using big endian byte order.
	 * @name util.float.readDoubleBE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	// Factory function for the purpose of node-based testing in modified global environments
	function factory(exports) {

	    // float: typed array
	    if (typeof Float32Array !== "undefined") (function() {

	        var f32 = new Float32Array([ -0 ]),
	            f8b = new Uint8Array(f32.buffer),
	            le  = f8b[3] === 128;

	        function writeFloat_f32_cpy(val, buf, pos) {
	            f32[0] = val;
	            buf[pos    ] = f8b[0];
	            buf[pos + 1] = f8b[1];
	            buf[pos + 2] = f8b[2];
	            buf[pos + 3] = f8b[3];
	        }

	        function writeFloat_f32_rev(val, buf, pos) {
	            f32[0] = val;
	            buf[pos    ] = f8b[3];
	            buf[pos + 1] = f8b[2];
	            buf[pos + 2] = f8b[1];
	            buf[pos + 3] = f8b[0];
	        }

	        /* istanbul ignore next */
	        exports.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
	        /* istanbul ignore next */
	        exports.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;

	        function readFloat_f32_cpy(buf, pos) {
	            f8b[0] = buf[pos    ];
	            f8b[1] = buf[pos + 1];
	            f8b[2] = buf[pos + 2];
	            f8b[3] = buf[pos + 3];
	            return f32[0];
	        }

	        function readFloat_f32_rev(buf, pos) {
	            f8b[3] = buf[pos    ];
	            f8b[2] = buf[pos + 1];
	            f8b[1] = buf[pos + 2];
	            f8b[0] = buf[pos + 3];
	            return f32[0];
	        }

	        /* istanbul ignore next */
	        exports.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
	        /* istanbul ignore next */
	        exports.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;

	    // float: ieee754
	    })(); else (function() {

	        function writeFloat_ieee754(writeUint, val, buf, pos) {
	            var sign = val < 0 ? 1 : 0;
	            if (sign)
	                val = -val;
	            if (val === 0)
	                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos);
	            else if (isNaN(val))
	                writeUint(2143289344, buf, pos);
	            else if (val > 3.4028234663852886e+38) // +-Infinity
	                writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
	            else if (val < 1.1754943508222875e-38) // denormal
	                writeUint((sign << 31 | Math.round(val / 1.401298464324817e-45)) >>> 0, buf, pos);
	            else {
	                var exponent = Math.floor(Math.log(val) / Math.LN2),
	                    mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
	                writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
	            }
	        }

	        exports.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
	        exports.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);

	        function readFloat_ieee754(readUint, buf, pos) {
	            var uint = readUint(buf, pos),
	                sign = (uint >> 31) * 2 + 1,
	                exponent = uint >>> 23 & 255,
	                mantissa = uint & 8388607;
	            return exponent === 255
	                ? mantissa
	                ? NaN
	                : sign * Infinity
	                : exponent === 0 // denormal
	                ? sign * 1.401298464324817e-45 * mantissa
	                : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
	        }

	        exports.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
	        exports.readFloatBE = readFloat_ieee754.bind(null, readUintBE);

	    })();

	    // double: typed array
	    if (typeof Float64Array !== "undefined") (function() {

	        var f64 = new Float64Array([-0]),
	            f8b = new Uint8Array(f64.buffer),
	            le  = f8b[7] === 128;

	        function writeDouble_f64_cpy(val, buf, pos) {
	            f64[0] = val;
	            buf[pos    ] = f8b[0];
	            buf[pos + 1] = f8b[1];
	            buf[pos + 2] = f8b[2];
	            buf[pos + 3] = f8b[3];
	            buf[pos + 4] = f8b[4];
	            buf[pos + 5] = f8b[5];
	            buf[pos + 6] = f8b[6];
	            buf[pos + 7] = f8b[7];
	        }

	        function writeDouble_f64_rev(val, buf, pos) {
	            f64[0] = val;
	            buf[pos    ] = f8b[7];
	            buf[pos + 1] = f8b[6];
	            buf[pos + 2] = f8b[5];
	            buf[pos + 3] = f8b[4];
	            buf[pos + 4] = f8b[3];
	            buf[pos + 5] = f8b[2];
	            buf[pos + 6] = f8b[1];
	            buf[pos + 7] = f8b[0];
	        }

	        /* istanbul ignore next */
	        exports.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
	        /* istanbul ignore next */
	        exports.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;

	        function readDouble_f64_cpy(buf, pos) {
	            f8b[0] = buf[pos    ];
	            f8b[1] = buf[pos + 1];
	            f8b[2] = buf[pos + 2];
	            f8b[3] = buf[pos + 3];
	            f8b[4] = buf[pos + 4];
	            f8b[5] = buf[pos + 5];
	            f8b[6] = buf[pos + 6];
	            f8b[7] = buf[pos + 7];
	            return f64[0];
	        }

	        function readDouble_f64_rev(buf, pos) {
	            f8b[7] = buf[pos    ];
	            f8b[6] = buf[pos + 1];
	            f8b[5] = buf[pos + 2];
	            f8b[4] = buf[pos + 3];
	            f8b[3] = buf[pos + 4];
	            f8b[2] = buf[pos + 5];
	            f8b[1] = buf[pos + 6];
	            f8b[0] = buf[pos + 7];
	            return f64[0];
	        }

	        /* istanbul ignore next */
	        exports.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
	        /* istanbul ignore next */
	        exports.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;

	    // double: ieee754
	    })(); else (function() {

	        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
	            var sign = val < 0 ? 1 : 0;
	            if (sign)
	                val = -val;
	            if (val === 0) {
	                writeUint(0, buf, pos + off0);
	                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos + off1);
	            } else if (isNaN(val)) {
	                writeUint(0, buf, pos + off0);
	                writeUint(2146959360, buf, pos + off1);
	            } else if (val > 1.7976931348623157e+308) { // +-Infinity
	                writeUint(0, buf, pos + off0);
	                writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
	            } else {
	                var mantissa;
	                if (val < 2.2250738585072014e-308) { // denormal
	                    mantissa = val / 5e-324;
	                    writeUint(mantissa >>> 0, buf, pos + off0);
	                    writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
	                } else {
	                    var exponent = Math.floor(Math.log(val) / Math.LN2);
	                    if (exponent === 1024)
	                        exponent = 1023;
	                    mantissa = val * Math.pow(2, -exponent);
	                    writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
	                    writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
	                }
	            }
	        }

	        exports.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
	        exports.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);

	        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
	            var lo = readUint(buf, pos + off0),
	                hi = readUint(buf, pos + off1);
	            var sign = (hi >> 31) * 2 + 1,
	                exponent = hi >>> 20 & 2047,
	                mantissa = 4294967296 * (hi & 1048575) + lo;
	            return exponent === 2047
	                ? mantissa
	                ? NaN
	                : sign * Infinity
	                : exponent === 0 // denormal
	                ? sign * 5e-324 * mantissa
	                : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
	        }

	        exports.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
	        exports.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);

	    })();

	    return exports;
	}

	// uint helpers

	function writeUintLE(val, buf, pos) {
	    buf[pos    ] =  val        & 255;
	    buf[pos + 1] =  val >>> 8  & 255;
	    buf[pos + 2] =  val >>> 16 & 255;
	    buf[pos + 3] =  val >>> 24;
	}

	function writeUintBE(val, buf, pos) {
	    buf[pos    ] =  val >>> 24;
	    buf[pos + 1] =  val >>> 16 & 255;
	    buf[pos + 2] =  val >>> 8  & 255;
	    buf[pos + 3] =  val        & 255;
	}

	function readUintLE(buf, pos) {
	    return (buf[pos    ]
	          | buf[pos + 1] << 8
	          | buf[pos + 2] << 16
	          | buf[pos + 3] << 24) >>> 0;
	}

	function readUintBE(buf, pos) {
	    return (buf[pos    ] << 24
	          | buf[pos + 1] << 16
	          | buf[pos + 2] << 8
	          | buf[pos + 3]) >>> 0;
	}
	return float$1;
}

var floatExports = requireFloat();
var float = /*@__PURE__*/getDefaultExportFromCjs(floatExports);

var utf8$1 = {};

var hasRequiredUtf8;

function requireUtf8 () {
	if (hasRequiredUtf8) return utf8$1;
	hasRequiredUtf8 = 1;
	(function (exports) {

		/**
		 * A minimal UTF8 implementation for number arrays.
		 * @memberof util
		 * @namespace
		 */
		var utf8 = exports;

		/**
		 * Calculates the UTF8 byte length of a string.
		 * @param {string} string String
		 * @returns {number} Byte length
		 */
		utf8.length = function utf8_length(string) {
		    var len = 0,
		        c = 0;
		    for (var i = 0; i < string.length; ++i) {
		        c = string.charCodeAt(i);
		        if (c < 128)
		            len += 1;
		        else if (c < 2048)
		            len += 2;
		        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
		            ++i;
		            len += 4;
		        } else
		            len += 3;
		    }
		    return len;
		};

		/**
		 * Reads UTF8 bytes as a string.
		 * @param {Uint8Array} buffer Source buffer
		 * @param {number} start Source start
		 * @param {number} end Source end
		 * @returns {string} String read
		 */
		utf8.read = function utf8_read(buffer, start, end) {
		    var len = end - start;
		    if (len < 1)
		        return "";
		    var parts = null,
		        chunk = [],
		        i = 0, // char offset
		        t;     // temporary
		    while (start < end) {
		        t = buffer[start++];
		        if (t < 128)
		            chunk[i++] = t;
		        else if (t > 191 && t < 224)
		            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
		        else if (t > 239 && t < 365) {
		            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
		            chunk[i++] = 0xD800 + (t >> 10);
		            chunk[i++] = 0xDC00 + (t & 1023);
		        } else
		            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
		        if (i > 8191) {
		            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
		            i = 0;
		        }
		    }
		    if (parts) {
		        if (i)
		            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
		        return parts.join("");
		    }
		    return String.fromCharCode.apply(String, chunk.slice(0, i));
		};

		/**
		 * Writes a string as UTF8 bytes.
		 * @param {string} string Source string
		 * @param {Uint8Array} buffer Destination buffer
		 * @param {number} offset Destination offset
		 * @returns {number} Bytes written
		 */
		utf8.write = function utf8_write(string, buffer, offset) {
		    var start = offset,
		        c1, // character 1
		        c2; // character 2
		    for (var i = 0; i < string.length; ++i) {
		        c1 = string.charCodeAt(i);
		        if (c1 < 128) {
		            buffer[offset++] = c1;
		        } else if (c1 < 2048) {
		            buffer[offset++] = c1 >> 6       | 192;
		            buffer[offset++] = c1       & 63 | 128;
		        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
		            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
		            ++i;
		            buffer[offset++] = c1 >> 18      | 240;
		            buffer[offset++] = c1 >> 12 & 63 | 128;
		            buffer[offset++] = c1 >> 6  & 63 | 128;
		            buffer[offset++] = c1       & 63 | 128;
		        } else {
		            buffer[offset++] = c1 >> 12      | 224;
		            buffer[offset++] = c1 >> 6  & 63 | 128;
		            buffer[offset++] = c1       & 63 | 128;
		        }
		    }
		    return offset - start;
		}; 
	} (utf8$1));
	return utf8$1;
}

var utf8Exports = requireUtf8();
var utf8 = /*@__PURE__*/getDefaultExportFromCjs(utf8Exports);

// import { LongBits } from "../dts";
class Reader {
    /**
     * Creates a new reader using the specified buffer.
     * @function
     * @param {Reader|Uint8Array|Buffer} buffer Buffer to read from
     * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
     * @throws {Error} If `buffer` is not a valid buffer
     */
    static create(buffer) {
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
    buf;
    /**
     * Read buffer position.
     * @type {number}
     */
    pos;
    /**
     * Read buffer length.
     * @type {number}
     */
    len;
    /**
     * Constructs a new reader instance using the specified buffer.
     * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
     * @constructor
     * @param {Uint8Array} buffer Buffer to read from
     */
    constructor(buffer) {
        this.buf = buffer;
        this.pos = 0;
        this.len = buffer.length;
    }
    slice(buf, begin, end) {
        return buf.subarray(begin, end);
    }
    indexOutOfRange(reader, writeLength) {
        return RangeError("index out of range: " +
            reader.pos +
            " + " +
            (writeLength || 1) +
            " > " +
            reader.len);
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
        const end = this.pos + length;
        if (end > this.len) {
            throw this.indexOutOfRange(this, length);
        }
        this.pos += length;
        if (start == end) {
            return new Uint8Array(0);
        }
        return this.slice(this.buf, start, end);
    }
    /**
     * Reads a string preceeded by its byte length as a varint.
     * @returns {string} Value read
     */
    string() {
        const bytes = this.bytes();
        return utf8.read(bytes, 0, bytes.length);
    }
    /**
     * Skips the specified number of bytes if specified, otherwise skips a varint.
     * @param {number} [length] Length if known, otherwise a varint is assumed
     * @returns {Reader} `this`
     */
    skip(length) {
        if (typeof length == "number") {
            /* istanbul ignore if */
            if (this.pos + length > this.len) {
                throw this.indexOutOfRange(this, length);
            }
            this.pos += length;
        }
        else {
            do {
                /* istanbul ignore if */
                if (this.pos >= this.len) {
                    throw this.indexOutOfRange(this);
                }
            } while (this.buf[this.pos++] & 128);
        }
        return this;
    }
    /**
     * Skips the next element of the specified wire type.
     * @param {number} wireType Wire type received
     * @returns {Reader} `this`
     */
    skipType(wireType) {
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

// export class LayoutWriter {
//   /**
//    * Encodes the specified Layout message. Does not implicitly {@link com.opensource.svga.Layout.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.Layout
//    * @static
//    * @param {com.opensource.svga.ILayout} message Layout message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: Layout, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (message.x != null && Object.hasOwn(message, "x")) {
//       writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.x);
//     }
//     if (message.y != null && Object.hasOwn(message, "y")) {
//       writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.y);
//     }
//     if (message.width != null && Object.hasOwn(message, "width")) {
//       writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.width);
//     }
//     if (message.height != null && Object.hasOwn(message, "height")) {
//       writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.height);
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified Layout message, length delimited. Does not implicitly {@link com.opensource.svga.Layout.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.Layout
//    * @static
//    * @param {com.opensource.svga.ILayout} message Layout message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: Layout, writer: Writer): Writer {
//     return Layout.encode(message, writer).ldelim();
//   }
// }
class Layout {
    /**
     * Decodes a Layout message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.Layout} Layout
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        const end = length == undefined ? reader.len : reader.pos + length;
        const message = new Layout();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.x = reader.float();
                    break;
                }
                case 2: {
                    message.y = reader.float();
                    break;
                }
                case 3: {
                    message.width = reader.float();
                    break;
                }
                case 4: {
                    message.height = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a Layout message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.Layout} Layout
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): Layout {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies a Layout message.
     * @function verify
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   if (message.x != null && message.hasOwnProperty("x")) {
    //     if (typeof message.x != "number") {
    //       return "x: number expected";
    //     }
    //   }
    //   if (message.y != null && message.hasOwnProperty("y")) {
    //     if (typeof message.y != "number") {
    //       return "y: number expected";
    //     }
    //   }
    //   if (message.width != null && message.hasOwnProperty("width")) {
    //     if (typeof message.width != "number") {
    //       return "width: number expected";
    //     }
    //   }
    //   if (message.height != null && message.hasOwnProperty("height")) {
    //     if (typeof message.height != "number") {
    //       return "height: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a Layout message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.Layout} Layout
     */
    // static fromObject(object: Record<string, any>): Layout {
    //   if (object instanceof Layout) {
    //     return object;
    //   }
    //   const message = new Layout();
    //   if (object.x != null) {
    //     message.x = +object.x;
    //   }
    //   if (object.y != null) {
    //     message.y = +object.y;
    //   }
    //   if (object.width != null) {
    //     message.width = +object.width;
    //   }
    //   if (object.height != null) {
    //     message.height = +object.height;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a Layout message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {com.opensource.svga.Layout} message Layout
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: Layout,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   const object: Record<string, any> = {};
    //   if (options.defaults) {
    //     object.x = 0;
    //     object.y = 0;
    //     object.width = 0;
    //     object.height = 0;
    //   }
    //   if (message.x != null && message.hasOwnProperty("x")) {
    //     object.x =
    //       options.json && !isFinite(message.x) ? "" + message.x : message.x;
    //   }
    //   if (message.y != null && message.hasOwnProperty("y")) {
    //     object.y =
    //       options.json && !isFinite(message.y) ? "" + message.y : message.y;
    //   }
    //   if (message.width != null && message.hasOwnProperty("width")) {
    //     object.width =
    //       options.json && !isFinite(message.width)
    //         ? "" + message.width
    //         : message.width;
    //   }
    //   if (message.height != null && message.hasOwnProperty("height")) {
    //     object.height =
    //       options.json && !isFinite(message.height)
    //         ? "" + message.height
    //         : message.height;
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for Layout
     * @function getTypeUrl
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string): string {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return typeUrlPrefix + "/com.opensource.svga.Layout";
    // }
    /**
     * Layout x.
     * @member {number} x
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    x = 0;
    /**
     * Layout y.
     * @member {number} y
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    y = 0;
    /**
     * Layout width.
     * @member {number} width
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    width = 0;
    /**
     * Layout height.
     * @member {number} height
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    height = 0;
    /**
     * Constructs a new Layout.
     * @memberof com.opensource.svga
     * @classdesc Represents a Layout.
     * @implements ILayout
     * @constructor
     * @param {com.opensource.svga.ILayout=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.x != null) {
                this.x = properties.x;
            }
            if (properties.y != null) {
                this.y = properties.y;
            }
            if (properties.width != null) {
                this.width = properties.width;
            }
            if (properties.height != null) {
                this.height = properties.height;
            }
        }
    }
}

// export class TransformWriter {
//   /**
//    * Encodes the specified Transform message. Does not implicitly {@link com.opensource.svga.Transform.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.Transform
//    * @static
//    * @param {com.opensource.svga.ITransform} message Transform message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: Transform, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (message.a != null && Object.hasOwn(message, "a")) {
//       writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.a);
//     }
//     if (message.b != null && Object.hasOwn(message, "b")) {
//       writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.b);
//     }
//     if (message.c != null && Object.hasOwn(message, "c")) {
//       writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.c);
//     }
//     if (message.d != null && Object.hasOwn(message, "d")) {
//       writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.d);
//     }
//     if (message.tx != null && Object.hasOwn(message, "tx")) {
//       writer.uint32(/* id 5, wireType 5 =*/ 45).float(message.tx);
//     }
//     if (message.ty != null && Object.hasOwn(message, "ty")) {
//       writer.uint32(/* id 6, wireType 5 =*/ 53).float(message.ty);
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified Transform message, length delimited. Does not implicitly {@link com.opensource.svga.Transform.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.Transform
//    * @static
//    * @param {com.opensource.svga.ITransform} message Transform message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: Transform, writer: Writer): Writer {
//     return Transform.encode(message, writer).ldelim();
//   }
// }
class Transform {
    /**
     * Decodes a Transform message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.Transform} Transform
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        let end = length == undefined ? reader.len : reader.pos + length;
        let message = new Transform();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.a = reader.float();
                    break;
                }
                case 2: {
                    message.b = reader.float();
                    break;
                }
                case 3: {
                    message.c = reader.float();
                    break;
                }
                case 4: {
                    message.d = reader.float();
                    break;
                }
                case 5: {
                    message.tx = reader.float();
                    break;
                }
                case 6: {
                    message.ty = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a Transform message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.Transform} Transform
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): Transform {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies a Transform message.
     * @function verify
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>) {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   if (message.a != null && message.hasOwnProperty("a")) {
    //     if (typeof message.a != "number") {
    //       return "a: number expected";
    //     }
    //   }
    //   if (message.b != null && message.hasOwnProperty("b")) {
    //     if (typeof message.b != "number") {
    //       return "b: number expected";
    //     }
    //   }
    //   if (message.c != null && message.hasOwnProperty("c")) {
    //     if (typeof message.c != "number") {
    //       return "c: number expected";
    //     }
    //   }
    //   if (message.d != null && message.hasOwnProperty("d")) {
    //     if (typeof message.d != "number") {
    //       return "d: number expected";
    //     }
    //   }
    //   if (message.tx != null && message.hasOwnProperty("tx")) {
    //     if (typeof message.tx != "number") {
    //       return "tx: number expected";
    //     }
    //   }
    //   if (message.ty != null && message.hasOwnProperty("ty")) {
    //     if (typeof message.ty != "number") {
    //       return "ty: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a Transform message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.Transform} Transform
     */
    // static fromObject(object: Record<string, any>): Transform {
    //   if (object instanceof Transform) {
    //     return object;
    //   }
    //   let message = new Transform();
    //   if (object.a != null) {
    //     message.a = +object.a;
    //   }
    //   if (object.b != null) {
    //     message.b = +object.b;
    //   }
    //   if (object.c != null) {
    //     message.c = +object.c;
    //   }
    //   if (object.d != null) {
    //     message.d = +object.d;
    //   }
    //   if (object.tx != null) {
    //     message.tx = +object.tx;
    //   }
    //   if (object.ty != null) {
    //     message.ty = +object.ty;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a Transform message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {com.opensource.svga.Transform} message Transform
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: Transform,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   let object: Record<string, any> = {};
    //   if (options.defaults) {
    //     object.a = 0;
    //     object.b = 0;
    //     object.c = 0;
    //     object.d = 0;
    //     object.tx = 0;
    //     object.ty = 0;
    //   }
    //   if (message.a != null && message.hasOwnProperty("a")) {
    //     object.a =
    //       options.json && !isFinite(message.a) ? "" + message.a : message.a;
    //   }
    //   if (message.b != null && message.hasOwnProperty("b")) {
    //     object.b =
    //       options.json && !isFinite(message.b) ? "" + message.b : message.b;
    //   }
    //   if (message.c != null && message.hasOwnProperty("c")) {
    //     object.c =
    //       options.json && !isFinite(message.c) ? "" + message.c : message.c;
    //   }
    //   if (message.d != null && message.hasOwnProperty("d")) {
    //     object.d =
    //       options.json && !isFinite(message.d) ? "" + message.d : message.d;
    //   }
    //   if (message.tx != null && message.hasOwnProperty("tx")) {
    //     object.tx =
    //       options.json && !isFinite(message.tx) ? "" + message.tx : message.tx;
    //   }
    //   if (message.ty != null && message.hasOwnProperty("ty")) {
    //     object.ty =
    //       options.json && !isFinite(message.ty) ? "" + message.ty : message.ty;
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for Transform
     * @function getTypeUrl
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string): string {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return typeUrlPrefix + "/com.opensource.svga.Transform";
    // }
    /**
     * Transform a.
     * @member {number} a
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    a = 0;
    /**
     * Transform b.
     * @member {number} b
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    b = 0;
    /**
     * Transform c.
     * @member {number} c
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    c = 0;
    /**
     * Transform d.
     * @member {number} d
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    d = 0;
    /**
     * Transform tx.
     * @member {number} tx
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    tx = 0;
    /**
     * Transform ty.
     * @member {number} ty
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    ty = 0;
    /**
     * Constructs a new Transform.
     * @memberof com.opensource.svga
     * @classdesc Represents a Transform.
     * @implements ITransform
     * @constructor
     * @param {com.opensource.svga.ITransform=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.a != null) {
                this.a = properties.a;
            }
            if (properties.b != null) {
                this.b = properties.b;
            }
            if (properties.c != null) {
                this.c = properties.c;
            }
            if (properties.d != null) {
                this.d = properties.d;
            }
            if (properties.tx != null) {
                this.tx = properties.tx;
            }
            if (properties.ty != null) {
                this.ty = properties.ty;
            }
        }
    }
}

// export class ShapeArgsWriter {
//   /**
//    * Encodes the specified ShapeArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeArgs.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
//    * @static
//    * @param {com.opensource.svga.ShapeEntity.IShapeArgs} message ShapeArgs message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: ShapeArgs, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (message.d != null && Object.hasOwn(message, "d")) {
//       writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.d);
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified ShapeArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeArgs.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
//    * @static
//    * @param {com.opensource.svga.ShapeEntity.IShapeArgs} message ShapeArgs message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: ShapeArgs, writer: Writer): Writer {
//     return ShapeArgs.encode(message, writer).ldelim();
//   }
// }
class ShapeArgs {
    /**
     * Decodes a ShapeArgs message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        const end = length == undefined ? reader.len : reader.pos + length;
        const message = new ShapeArgs();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.d = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a ShapeArgs message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): ShapeArgs {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies a ShapeArgs message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   if (message.d != null && message.hasOwnProperty("d")) {
    //     if (!isString(message.d)) {
    //       return "d: string expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a ShapeArgs message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
     */
    // static fromObject(object: Record<string, any>): ShapeArgs {
    //   if (object instanceof ShapeEntity.ShapeArgs) {
    //     return object;
    //   }
    //   const message = new ShapeEntity.ShapeArgs();
    //   if (object.d != null) {
    //     message.d = "" + object.d;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a ShapeArgs message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeArgs} message ShapeArgs
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: ShapeArgs,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   const object: Record<string, any> = {};
    //   if (options.defaults) {
    //     object.d = "";
    //   }
    //   if (message.d != null && message.hasOwnProperty("d")) {
    //     object.d = message.d;
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for ShapeArgs
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string): string {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeArgs";
    // }
    d = "";
    /**
     * Constructs a new ShapeArgs.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents a ShapeArgs.
     * @implements IShapeArgs
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IShapeArgs=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.d != null) {
                this.d = properties.d;
            }
        }
    }
}

// export class RectArgsWriter {
//   /**
//    * Encodes the specified RectArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.RectArgs.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.ShapeEntity.RectArgs
//    * @static
//    * @param {com.opensource.svga.ShapeEntity.IRectArgs} message RectArgs message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: RectArgs, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (message.x != null && Object.hasOwn(message, "x")) {
//       writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.x);
//     }
//     if (message.y != null && Object.hasOwn(message, "y")) {
//       writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.y);
//     }
//     if (message.width != null && Object.hasOwn(message, "width")) {
//       writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.width);
//     }
//     if (message.height != null && Object.hasOwn(message, "height")) {
//       writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.height);
//     }
//     if (
//       message.cornerRadius != null &&
//       Object.hasOwn(message, "cornerRadius")
//     ) {
//       writer.uint32(/* id 5, wireType 5 =*/ 45).float(message.cornerRadius);
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified RectArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.RectArgs.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.ShapeEntity.RectArgs
//    * @static
//    * @param {com.opensource.svga.ShapeEntity.IRectArgs} message RectArgs message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: RectArgs, writer: Writer): Writer {
//     return RectArgs.encode(message, writer).ldelim();
//   }
// }
class RectArgs {
    /**
     * Decodes a RectArgs message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        const end = length == undefined ? reader.len : reader.pos + length;
        const message = new RectArgs();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.x = reader.float();
                    break;
                }
                case 2: {
                    message.y = reader.float();
                    break;
                }
                case 3: {
                    message.width = reader.float();
                    break;
                }
                case 4: {
                    message.height = reader.float();
                    break;
                }
                case 5: {
                    message.cornerRadius = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a RectArgs message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): RectArgs {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies a RectArgs message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   if (message.x != null && message.hasOwnProperty("x")) {
    //     if (typeof message.x != "number") {
    //       return "x: number expected";
    //     }
    //   }
    //   if (message.y != null && message.hasOwnProperty("y")) {
    //     if (typeof message.y != "number") {
    //       return "y: number expected";
    //     }
    //   }
    //   if (message.width != null && message.hasOwnProperty("width")) {
    //     if (typeof message.width != "number") {
    //       return "width: number expected";
    //     }
    //   }
    //   if (message.height != null && message.hasOwnProperty("height")) {
    //     if (typeof message.height != "number") {
    //       return "height: number expected";
    //     }
    //   }
    //   if (
    //     message.cornerRadius != null &&
    //     message.hasOwnProperty("cornerRadius")
    //   ) {
    //     if (typeof message.cornerRadius != "number") {
    //       return "cornerRadius: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a RectArgs message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
     */
    // static fromObject(object: Record<string, any>): RectArgs {
    //   if (object instanceof ShapeEntity.RectArgs) {
    //     return object;
    //   }
    //   const message = new ShapeEntity.RectArgs();
    //   if (object.x != null) {
    //     message.x = +object.x;
    //   }
    //   if (object.y != null) {
    //     message.y = +object.y;
    //   }
    //   if (object.width != null) {
    //     message.width = +object.width;
    //   }
    //   if (object.height != null) {
    //     message.height = +object.height;
    //   }
    //   if (object.cornerRadius != null) {
    //     message.cornerRadius = +object.cornerRadius;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a RectArgs message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.RectArgs} message RectArgs
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: RectArgs,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   const object: Record<string, any> = {};
    //   if (options.defaults) {
    //     object.x = 0;
    //     object.y = 0;
    //     object.width = 0;
    //     object.height = 0;
    //     object.cornerRadius = 0;
    //   }
    //   if (message.x != null && message.hasOwnProperty("x")) {
    //     object.x =
    //       options.json && !isFinite(message.x) ? "" + message.x : message.x;
    //   }
    //   if (message.y != null && message.hasOwnProperty("y")) {
    //     object.y =
    //       options.json && !isFinite(message.y) ? "" + message.y : message.y;
    //   }
    //   if (message.width != null && message.hasOwnProperty("width")) {
    //     object.width =
    //       options.json && !isFinite(message.width)
    //         ? "" + message.width
    //         : message.width;
    //   }
    //   if (message.height != null && message.hasOwnProperty("height")) {
    //     object.height =
    //       options.json && !isFinite(message.height)
    //         ? "" + message.height
    //         : message.height;
    //   }
    //   if (
    //     message.cornerRadius != null &&
    //     message.hasOwnProperty("cornerRadius")
    //   ) {
    //     object.cornerRadius =
    //       options.json && !isFinite(message.cornerRadius)
    //         ? "" + message.cornerRadius
    //         : message.cornerRadius;
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for RectArgs
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string): string {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.RectArgs";
    // }
    /**
     * RectArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    x = 0;
    /**
     * RectArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    y = 0;
    /**
     * RectArgs width.
     * @member {number} width
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    width = 0;
    /**
     * RectArgs height.
     * @member {number} height
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    height = 0;
    /**
     * RectArgs cornerRadius.
     * @member {number} cornerRadius
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    cornerRadius = 0;
    /**
     * Constructs a new RectArgs.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents a RectArgs.
     * @implements IRectArgs
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IRectArgs=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.x != null) {
                this.x = properties.x;
            }
            if (properties.y != null) {
                this.y = properties.y;
            }
            if (properties.width != null) {
                this.width = properties.width;
            }
            if (properties.height != null) {
                this.height = properties.height;
            }
            if (properties.cornerRadius != null) {
                this.cornerRadius = properties.cornerRadius;
            }
        }
    }
}

// export class EllipseArgsWriter {
//   /**
//    * Encodes the specified EllipseArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.EllipseArgs.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
//    * @static
//    * @param {com.opensource.svga.ShapeEntity.IEllipseArgs} message EllipseArgs message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: EllipseArgs, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (message.x != null && Object.hasOwn(message, "x")) {
//       writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.x);
//     }
//     if (message.y != null && Object.hasOwn(message, "y")) {
//       writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.y);
//     }
//     if (message.radiusX != null && Object.hasOwn(message, "radiusX")) {
//       writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.radiusX);
//     }
//     if (message.radiusY != null && Object.hasOwn(message, "radiusY")) {
//       writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.radiusY);
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified EllipseArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.EllipseArgs.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
//    * @static
//    * @param {com.opensource.svga.ShapeEntity.IEllipseArgs} message EllipseArgs message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: EllipseArgs, writer: Writer): Writer {
//     return EllipseArgs.encode(message, writer).ldelim();
//   }
// }
class EllipseArgs {
    /**
     * Decodes an EllipseArgs message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        const end = length == undefined ? reader.len : reader.pos + length;
        const message = new EllipseArgs();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.x = reader.float();
                    break;
                }
                case 2: {
                    message.y = reader.float();
                    break;
                }
                case 3: {
                    message.radiusX = reader.float();
                    break;
                }
                case 4: {
                    message.radiusY = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes an EllipseArgs message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): EllipseArgs {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies an EllipseArgs message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   if (message.x != null && message.hasOwnProperty("x")) {
    //     if (typeof message.x != "number") {
    //       return "x: number expected";
    //     }
    //   }
    //   if (message.y != null && message.hasOwnProperty("y")) {
    //     if (typeof message.y != "number") {
    //       return "y: number expected";
    //     }
    //   }
    //   if (message.radiusX != null && message.hasOwnProperty("radiusX")) {
    //     if (typeof message.radiusX != "number") {
    //       return "radiusX: number expected";
    //     }
    //   }
    //   if (message.radiusY != null && message.hasOwnProperty("radiusY")) {
    //     if (typeof message.radiusY != "number") {
    //       return "radiusY: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates an EllipseArgs message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     */
    // static fromObject(object: Record<string, any>): EllipseArgs {
    //   if (object instanceof ShapeEntity.EllipseArgs) {
    //     return object;
    //   }
    //   const message = new ShapeEntity.EllipseArgs();
    //   if (object.x != null) {
    //     message.x = +object.x;
    //   }
    //   if (object.y != null) {
    //     message.y = +object.y;
    //   }
    //   if (object.radiusX != null) {
    //     message.radiusX = +object.radiusX;
    //   }
    //   if (object.radiusY != null) {
    //     message.radiusY = +object.radiusY;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from an EllipseArgs message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.EllipseArgs} message EllipseArgs
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: EllipseArgs,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   const object: Record<string, any> = {};
    //   if (options.defaults) {
    //     object.x = 0;
    //     object.y = 0;
    //     object.radiusX = 0;
    //     object.radiusY = 0;
    //   }
    //   if (message.x != null && message.hasOwnProperty("x")) {
    //     object.x =
    //       options.json && !isFinite(message.x) ? "" + message.x : message.x;
    //   }
    //   if (message.y != null && message.hasOwnProperty("y")) {
    //     object.y =
    //       options.json && !isFinite(message.y) ? "" + message.y : message.y;
    //   }
    //   if (message.radiusX != null && message.hasOwnProperty("radiusX")) {
    //     object.radiusX =
    //       options.json && !isFinite(message.radiusX)
    //         ? "" + message.radiusX
    //         : message.radiusX;
    //   }
    //   if (message.radiusY != null && message.hasOwnProperty("radiusY")) {
    //     object.radiusY =
    //       options.json && !isFinite(message.radiusY)
    //         ? "" + message.radiusY
    //         : message.radiusY;
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for EllipseArgs
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string): string {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.EllipseArgs";
    // }
    /**
     * EllipseArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    x = 0;
    /**
     * EllipseArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    y = 0;
    /**
     * EllipseArgs radiusX.
     * @member {number} radiusX
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusX = 0;
    /**
     * EllipseArgs radiusY.
     * @member {number} radiusY
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusY = 0;
    /**
     * Constructs a new EllipseArgs.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents an EllipseArgs.
     * @implements IEllipseArgs
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.x != null) {
                this.x = properties.x;
            }
            if (properties.y != null) {
                this.y = properties.y;
            }
            if (properties.radiusX != null) {
                this.radiusX = properties.radiusX;
            }
            if (properties.radiusY != null) {
                this.radiusY = properties.radiusY;
            }
        }
    }
}

// export class RGBAColorWriter {
//   /**
//    * Encodes the specified RGBAColor message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
//    * @static
//    * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor} message RGBAColor message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: RGBAColor, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (message.r != null && Object.hasOwn(message, "r")) {
//       writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.r);
//     }
//     if (message.g != null && Object.hasOwn(message, "g")) {
//       writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.g);
//     }
//     if (message.b != null && Object.hasOwn(message, "b")) {
//       writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.b);
//     }
//     if (message.a != null && Object.hasOwn(message, "a")) {
//       writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.a);
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified RGBAColor message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
//    * @static
//    * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor} message RGBAColor message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: RGBAColor, writer: Writer): Writer {
//     return RGBAColor.encode(message, writer).ldelim();
//   }
// }
class RGBAColor {
    /**
     * Decodes a RGBAColor message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        const end = length == undefined ? reader.len : reader.pos + length;
        const message = new RGBAColor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.r = reader.float();
                    break;
                }
                case 2: {
                    message.g = reader.float();
                    break;
                }
                case 3: {
                    message.b = reader.float();
                    break;
                }
                case 4: {
                    message.a = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a RGBAColor message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): RGBAColor {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies a RGBAColor message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   if (message.r != null && message.hasOwnProperty("r")) {
    //     if (typeof message.r != "number") {
    //       return "r: number expected";
    //     }
    //   }
    //   if (message.g != null && message.hasOwnProperty("g")) {
    //     if (typeof message.g != "number") {
    //       return "g: number expected";
    //     }
    //   }
    //   if (message.b != null && message.hasOwnProperty("b")) {
    //     if (typeof message.b != "number") {
    //       return "b: number expected";
    //     }
    //   }
    //   if (message.a != null && message.hasOwnProperty("a")) {
    //     if (typeof message.a != "number") {
    //       return "a: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a RGBAColor message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     */
    // static fromObject(object: Record<string, any>): RGBAColor {
    //   if (object instanceof RGBAColor) {
    //     return object;
    //   }
    //   const message = new RGBAColor();
    //   if (object.r != null) {
    //     message.r = +object.r;
    //   }
    //   if (object.g != null) {
    //     message.g = +object.g;
    //   }
    //   if (object.b != null) {
    //     message.b = +object.b;
    //   }
    //   if (object.a != null) {
    //     message.a = +object.a;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a RGBAColor message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} message RGBAColor
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: RGBAColor,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   const object: Record<string, any> = {};
    //   if (options.defaults) {
    //     object.r = 0;
    //     object.g = 0;
    //     object.b = 0;
    //     object.a = 0;
    //   }
    //   if (message.r != null && message.hasOwnProperty("r")) {
    //     object.r =
    //       options.json && !isFinite(message.r) ? "" + message.r : message.r;
    //   }
    //   if (message.g != null && message.hasOwnProperty("g")) {
    //     object.g =
    //       options.json && !isFinite(message.g) ? "" + message.g : message.g;
    //   }
    //   if (message.b != null && message.hasOwnProperty("b")) {
    //     object.b =
    //       options.json && !isFinite(message.b) ? "" + message.b : message.b;
    //   }
    //   if (message.a != null && message.hasOwnProperty("a")) {
    //     object.a =
    //       options.json && !isFinite(message.a) ? "" + message.a : message.a;
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for RGBAColor
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string): string {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return (
    //     typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor"
    //   );
    // }
    /**
     * RGBAColor r.
     * @member {number} r
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    r = 0;
    /**
     * RGBAColor g.
     * @member {number} g
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    g = 0;
    /**
     * RGBAColor b.
     * @member {number} b
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    b = 0;
    /**
     * RGBAColor a.
     * @member {number} a
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    a = 0;
    /**
     * Constructs a new RGBAColor.
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @classdesc Represents a RGBAColor.
     * @implements IRGBAColor
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.r != null) {
                this.r = properties.r;
            }
            if (properties.g != null) {
                this.g = properties.g;
            }
            if (properties.b != null) {
                this.b = properties.b;
            }
            if (properties.a != null) {
                this.a = properties.a;
            }
        }
    }
}

// export class ShapeStyleWriter {
//   /**
//    * Encodes the specified ShapeStyle message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
//    * @static
//    * @param {com.opensource.svga.ShapeEntity.IShapeStyle} message ShapeStyle message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: ShapeStyle, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (message.fill != null && Object.hasOwn(message, "fill")) {
//       RGBAColor.encode(
//         message.fill,
//         writer.uint32(/* id 1, wireType 2 =*/ 10).fork()
//       ).ldelim();
//     }
//     if (message.stroke != null && Object.hasOwn(message, "stroke")) {
//       RGBAColor.encode(
//         message.stroke,
//         writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
//       ).ldelim();
//     }
//     if (message.strokeWidth != null && Object.hasOwn(message, "strokeWidth")) {
//       writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.strokeWidth);
//     }
//     if (message.lineCap != null && Object.hasOwn(message, "lineCap")) {
//       writer.uint32(/* id 4, wireType 0 =*/ 32).int32(message.lineCap);
//     }
//     if (message.lineJoin != null && Object.hasOwn(message, "lineJoin")) {
//       writer.uint32(/* id 5, wireType 0 =*/ 40).int32(message.lineJoin);
//     }
//     if (message.miterLimit != null && Object.hasOwn(message, "miterLimit")) {
//       writer.uint32(/* id 6, wireType 5 =*/ 53).float(message.miterLimit);
//     }
//     if (message.lineDashI != null && Object.hasOwn(message, "lineDashI")) {
//       writer.uint32(/* id 7, wireType 5 =*/ 61).float(message.lineDashI);
//     }
//     if (message.lineDashII != null && Object.hasOwn(message, "lineDashII")) {
//       writer.uint32(/* id 8, wireType 5 =*/ 69).float(message.lineDashII);
//     }
//     if (message.lineDashIII != null && Object.hasOwn(message, "lineDashIII")) {
//       writer.uint32(/* id 9, wireType 5 =*/ 77).float(message.lineDashIII);
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified ShapeStyle message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
//    * @static
//    * @param {com.opensource.svga.ShapeEntity.IShapeStyle} message ShapeStyle message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: ShapeStyle, writer: Writer): Writer {
//     return ShapeStyle.encode(message, writer).ldelim();
//   }
// }
class ShapeStyle {
    /**
     * Decodes a ShapeStyle message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        const end = length == undefined ? reader.len : reader.pos + length;
        const message = new ShapeStyle();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.fill = RGBAColor.decode(reader, reader.uint32());
                    break;
                }
                case 2: {
                    message.stroke = RGBAColor.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    message.strokeWidth = reader.float();
                    break;
                }
                case 4: {
                    message.lineCap = reader.int32();
                    break;
                }
                case 5: {
                    message.lineJoin = reader.int32();
                    break;
                }
                case 6: {
                    message.miterLimit = reader.float();
                    break;
                }
                case 7: {
                    message.lineDashI = reader.float();
                    break;
                }
                case 8: {
                    message.lineDashII = reader.float();
                    break;
                }
                case 9: {
                    message.lineDashIII = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a ShapeStyle message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): ShapeStyle {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies a ShapeStyle message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   if (message.fill != null && message.hasOwnProperty("fill")) {
    //     const error = RGBAColor.verify(message.fill);
    //     if (error) {
    //       return "fill." + error;
    //     }
    //   }
    //   if (message.stroke != null && message.hasOwnProperty("stroke")) {
    //     const error = RGBAColor.verify(message.stroke);
    //     if (error) {
    //       return "stroke." + error;
    //     }
    //   }
    //   if (message.strokeWidth != null && message.hasOwnProperty("strokeWidth")) {
    //     if (typeof message.strokeWidth != "number") {
    //       return "strokeWidth: number expected";
    //     }
    //   }
    //   if (message.lineCap != null && message.hasOwnProperty("lineCap"))
    //     switch (message.lineCap) {
    //       default:
    //         return "lineCap: enum value expected";
    //       case 0:
    //       case 1:
    //       case 2:
    //         break;
    //     }
    //   if (message.lineJoin != null && message.hasOwnProperty("lineJoin"))
    //     switch (message.lineJoin) {
    //       default:
    //         return "lineJoin: enum value expected";
    //       case 0:
    //       case 1:
    //       case 2:
    //         break;
    //     }
    //   if (message.miterLimit != null && message.hasOwnProperty("miterLimit")) {
    //     if (typeof message.miterLimit != "number") {
    //       return "miterLimit: number expected";
    //     }
    //   }
    //   if (message.lineDashI != null && message.hasOwnProperty("lineDashI")) {
    //     if (typeof message.lineDashI != "number") {
    //       return "lineDashI: number expected";
    //     }
    //   }
    //   if (message.lineDashII != null && message.hasOwnProperty("lineDashII")) {
    //     if (typeof message.lineDashII != "number") {
    //       return "lineDashII: number expected";
    //     }
    //   }
    //   if (message.lineDashIII != null && message.hasOwnProperty("lineDashIII")) {
    //     if (typeof message.lineDashIII != "number") {
    //       return "lineDashIII: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a ShapeStyle message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
     */
    // static fromObject(object: Record<string, any>): ShapeStyle {
    //   if (object instanceof ShapeEntity.ShapeStyle) {
    //     return object;
    //   }
    //   const message = new ShapeEntity.ShapeStyle();
    //   if (object.fill != null) {
    //     if (typeof object.fill != "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.ShapeStyle.fill: object expected"
    //       );
    //     }
    //     message.fill = RGBAColor.fromObject(object.fill);
    //   }
    //   if (object.stroke != null) {
    //     if (typeof object.stroke != "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.ShapeStyle.stroke: object expected"
    //       );
    //     }
    //     message.stroke = RGBAColor.fromObject(
    //       object.stroke
    //     );
    //   }
    //   if (object.strokeWidth != null) {
    //     message.strokeWidth = Number(object.strokeWidth);
    //   }
    //   switch (object.lineCap) {
    //     default:
    //       if (typeof object.lineCap == "number") {
    //         message.lineCap = object.lineCap;
    //         break;
    //       }
    //       break;
    //     case "LineCap_BUTT":
    //     case 0:
    //       message.lineCap = 0;
    //       break;
    //     case "LineCap_ROUND":
    //     case 1:
    //       message.lineCap = 1;
    //       break;
    //     case "LineCap_SQUARE":
    //     case 2:
    //       message.lineCap = 2;
    //       break;
    //   }
    //   switch (object.lineJoin) {
    //     default:
    //       if (typeof object.lineJoin == "number") {
    //         message.lineJoin = object.lineJoin;
    //         break;
    //       }
    //       break;
    //     case "LineJoin_MITER":
    //     case 0:
    //       message.lineJoin = 0;
    //       break;
    //     case "LineJoin_ROUND":
    //     case 1:
    //       message.lineJoin = 1;
    //       break;
    //     case "LineJoin_BEVEL":
    //     case 2:
    //       message.lineJoin = 2;
    //       break;
    //   }
    //   if (object.miterLimit != null) {
    //     message.miterLimit = +object.miterLimit;
    //   }
    //   if (object.lineDashI != null) {
    //     message.lineDashI = +object.lineDashI;
    //   }
    //   if (object.lineDashII != null) {
    //     message.lineDashII = +object.lineDashII;
    //   }
    //   if (object.lineDashIII != null) {
    //     message.lineDashIII = +object.lineDashIII;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a ShapeStyle message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle} message ShapeStyle
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: ShapeStyle,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   const object: Record<string, any> = {};
    //   if (options.defaults) {
    //     object.fill = null;
    //     object.stroke = null;
    //     object.strokeWidth = 0;
    //     object.lineCap = options.enums == String ? "LineCap_BUTT" : 0;
    //     object.lineJoin = options.enums == String ? "LineJoin_MITER" : 0;
    //     object.miterLimit = 0;
    //     object.lineDashI = 0;
    //     object.lineDashII = 0;
    //     object.lineDashIII = 0;
    //   }
    //   if (message.fill != null && message.hasOwnProperty("fill")) {
    //     object.fill = RGBAColor.toObject(
    //       message.fill,
    //       options
    //     );
    //   }
    //   if (message.stroke != null && message.hasOwnProperty("stroke")) {
    //     object.stroke = RGBAColor.toObject(
    //       message.stroke,
    //       options
    //     );
    //   }
    //   if (message.strokeWidth != null && message.hasOwnProperty("strokeWidth")) {
    //     object.strokeWidth =
    //       options.json && !isFinite(message.strokeWidth)
    //         ? "" + message.strokeWidth
    //         : message.strokeWidth;
    //   }
    //   if (message.lineCap != null && message.hasOwnProperty("lineCap")) {
    //     object.lineCap =
    //       options.enums == String
    //         ? LineCap[message.lineCap] == undefined
    //           ? message.lineCap
    //           : LineCap[message.lineCap]
    //         : message.lineCap;
    //   }
    //   if (message.lineJoin != null && message.hasOwnProperty("lineJoin")) {
    //     object.lineJoin =
    //       options.enums == String
    //         ? LineJoin[message.lineJoin] == undefined
    //           ? message.lineJoin
    //           : LineJoin[message.lineJoin]
    //         : message.lineJoin;
    //   }
    //   if (message.miterLimit != null && message.hasOwnProperty("miterLimit")) {
    //     object.miterLimit =
    //       options.json && !isFinite(message.miterLimit)
    //         ? "" + message.miterLimit
    //         : message.miterLimit;
    //   }
    //   if (message.lineDashI != null && message.hasOwnProperty("lineDashI")) {
    //     object.lineDashI =
    //       options.json && !isFinite(message.lineDashI)
    //         ? "" + message.lineDashI
    //         : message.lineDashI;
    //   }
    //   if (message.lineDashII != null && message.hasOwnProperty("lineDashII")) {
    //     object.lineDashII =
    //       options.json && !isFinite(message.lineDashII)
    //         ? "" + message.lineDashII
    //         : message.lineDashII;
    //   }
    //   if (message.lineDashIII != null && message.hasOwnProperty("lineDashIII")) {
    //     object.lineDashIII =
    //       options.json && !isFinite(message.lineDashIII)
    //         ? "" + message.lineDashIII
    //         : message.lineDashIII;
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for ShapeStyle
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string): string {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeStyle";
    // }
    /**
     * ShapeStyle fill.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} fill
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    fill = null;
    /**
     * ShapeStyle stroke.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} stroke
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    stroke = null;
    /**
     * ShapeStyle strokeWidth.
     * @member {number} strokeWidth
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    strokeWidth = 0;
    /**
     * ShapeStyle lineCap.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap} lineCap
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineCap = 0;
    /**
     * ShapeStyle lineJoin.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin} lineJoin
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineJoin = 0;
    /**
     * ShapeStyle miterLimit.
     * @member {number} miterLimit
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    miterLimit = 0;
    /**
     * ShapeStyle lineDashI.
     * @member {number} lineDashI
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashI = 0;
    /**
     * ShapeStyle lineDashII.
     * @member {number} lineDashII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashII = 0;
    /**
     * ShapeStyle lineDashIII.
     * @member {number} lineDashIII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashIII = 0;
    /**
     * Constructs a new ShapeStyle.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents a ShapeStyle.
     * @implements IShapeStyle
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IShapeStyle=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.fill != null) {
                this.fill = properties.fill;
            }
            if (properties.lineCap != null) {
                this.lineCap = properties.lineCap;
            }
            if (properties.lineDashI != null) {
                this.lineDashI = properties.lineDashI;
            }
            if (properties.lineDashII != null) {
                this.lineDashII = properties.lineDashII;
            }
            if (properties.lineDashIII != null) {
                this.lineDashIII = properties.lineDashIII;
            }
            if (properties.lineJoin != null) {
                this.lineJoin = properties.lineJoin;
            }
            if (properties.miterLimit != null) {
                this.miterLimit = properties.miterLimit;
            }
            if (properties.stroke != null) {
                this.stroke = properties.stroke;
            }
            if (properties.strokeWidth != null) {
                this.strokeWidth = properties.strokeWidth;
            }
        }
    }
}

// export class ShapeEntityWriter {
//   /**
//    * Encodes the specified ShapeEntity message. Does not implicitly {@link com.opensource.svga.ShapeEntity.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.ShapeEntity
//    * @static
//    * @param {com.opensource.svga.IShapeEntity} message ShapeEntity message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: ShapeEntity, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (message.type != null && Object.hasOwn(message, "type")) {
//       writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.type);
//     }
//     if (message.shape != null && Object.hasOwn(message, "shape")) {
//       ShapeArgs.encode(
//         message.shape,
//         writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
//       ).ldelim();
//     }
//     if (message.rect != null && Object.hasOwn(message, "rect")) {
//       RectArgs.encode(
//         message.rect,
//         writer.uint32(/* id 3, wireType 2 =*/ 26).fork()
//       ).ldelim();
//     }
//     if (message.ellipse != null && Object.hasOwn(message, "ellipse")) {
//       EllipseArgs.encode(
//         message.ellipse,
//         writer.uint32(/* id 4, wireType 2 =*/ 34).fork()
//       ).ldelim();
//     }
//     if (message.styles != null && Object.hasOwn(message, "styles")) {
//       ShapeStyle.encode(
//         message.styles,
//         writer.uint32(/* id 10, wireType 2 =*/ 82).fork()
//       ).ldelim();
//     }
//     if (message.transform != null && Object.hasOwn(message, "transform")) {
//       Transform.encode(
//         message.transform,
//         writer.uint32(/* id 11, wireType 2 =*/ 90).fork()
//       ).ldelim();
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified ShapeEntity message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.ShapeEntity
//    * @static
//    * @param {com.opensource.svga.IShapeEntity} message ShapeEntity message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: ShapeEntity, writer: Writer): Writer {
//     return ShapeEntity.encode(message, writer).ldelim();
//   }
// }
class ShapeEntity {
    /**
     * Decodes a ShapeEntity message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        const end = length == undefined ? reader.len : reader.pos + length;
        const message = new ShapeEntity();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.type = reader.int32();
                    break;
                }
                case 2: {
                    message.shape = ShapeArgs.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    message.rect = RectArgs.decode(reader, reader.uint32());
                    break;
                }
                case 4: {
                    message.ellipse = EllipseArgs.decode(reader, reader.uint32());
                    break;
                }
                case 10: {
                    message.styles = ShapeStyle.decode(reader, reader.uint32());
                    break;
                }
                case 11: {
                    message.transform = Transform.decode(reader, reader.uint32());
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a ShapeEntity message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): ShapeEntity {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies a ShapeEntity message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   const properties: Record<string, any> = {};
    //   if (message.type != null && message.hasOwnProperty("type"))
    //     switch (message.type) {
    //       default:
    //         return "type: enum value expected";
    //       case 0:
    //       case 1:
    //       case 2:
    //       case 3:
    //         break;
    //     }
    //   if (message.shape != null && message.hasOwnProperty("shape")) {
    //     properties.args = 1;
    //     {
    //       let error = ShapeEntity.ShapeArgs.verify(message.shape);
    //       if (error) {
    //         return "shape." + error;
    //       }
    //     }
    //   }
    //   if (message.rect != null && message.hasOwnProperty("rect")) {
    //     if (properties.args == 1) {
    //       return "args: multiple values";
    //     }
    //     properties.args = 1;
    //     {
    //       const error = ShapeEntity.RectArgs.verify(message.rect);
    //       if (error) {
    //         return "rect." + error;
    //       }
    //     }
    //   }
    //   if (message.ellipse != null && message.hasOwnProperty("ellipse")) {
    //     if (properties.args == 1) {
    //       return "args: multiple values";
    //     }
    //     properties.args = 1;
    //     const error = ShapeEntity.EllipseArgs.verify(message.ellipse);
    //     if (error) {
    //       return "ellipse." + error;
    //     }
    //   }
    //   if (message.styles != null && message.hasOwnProperty("styles")) {
    //     const error = ShapeEntity.ShapeStyle.verify(message.styles);
    //     if (error) {
    //       return "styles." + error;
    //     }
    //   }
    //   if (message.transform != null && message.hasOwnProperty("transform")) {
    //     const error = Transform.verify(message.transform);
    //     if (error) {
    //       return "transform." + error;
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a ShapeEntity message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
     */
    // static fromObject(object: Record<string, any>): ShapeEntity {
    //   if (object instanceof ShapeEntity) {
    //     return object;
    //   }
    //   const message = new ShapeEntity();
    //   switch (object.type) {
    //     default:
    //       if (typeof object.type == "number") {
    //         message.type = object.type;
    //         break;
    //       }
    //       break;
    //     case "SHAPE":
    //     case 0:
    //       message.type = 0;
    //       break;
    //     case "RECT":
    //     case 1:
    //       message.type = 1;
    //       break;
    //     case "ELLIPSE":
    //     case 2:
    //       message.type = 2;
    //       break;
    //     case "KEEP":
    //     case 3:
    //       message.type = 3;
    //       break;
    //   }
    //   if (object.shape != null) {
    //     if (typeof object.shape != "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.shape: object expected"
    //       );
    //     }
    //     message.shape = ShapeArgs.fromObject(object.shape);
    //   }
    //   if (object.rect != null) {
    //     if (typeof object.rect != "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.rect: object expected"
    //       );
    //     }
    //     message.rect = RectArgs.fromObject(object.rect);
    //   }
    //   if (object.ellipse != null) {
    //     if (typeof object.ellipse != "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.ellipse: object expected"
    //       );
    //     }
    //     message.ellipse = EllipseArgs.fromObject(object.ellipse);
    //   }
    //   if (object.styles != null) {
    //     if (typeof object.styles != "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.styles: object expected"
    //       );
    //     }
    //     message.styles = ShapeStyle.fromObject(object.styles);
    //   }
    //   if (object.transform != null) {
    //     if (typeof object.transform != "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.transform: object expected"
    //       );
    //     }
    //     message.transform = Transform.fromObject(object.transform);
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a ShapeEntity message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {com.opensource.svga.ShapeEntity} message ShapeEntity
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: ShapeEntity,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   const object: Record<string, any> = {};
    //   if (options.defaults) {
    //     object.type = options.enums == String ? "SHAPE" : 0;
    //     object.styles = null;
    //     object.transform = null;
    //   }
    //   if (message.type != null && message.hasOwnProperty("type")) {
    //     object.type =
    //       options.enums == String
    //         ? ShapeType[message.type] == undefined
    //           ? message.type
    //           : ShapeType[message.type]
    //         : message.type;
    //   }
    //   if (message.shape != null && message.hasOwnProperty("shape")) {
    //     object.shape = ShapeEntity.ShapeArgs.toObject(message.shape, options);
    //     if (options.oneofs) {
    //       object.args = "shape";
    //     }
    //   }
    //   if (message.rect != null && message.hasOwnProperty("rect")) {
    //     object.rect = ShapeEntity.RectArgs.toObject(message.rect, options);
    //     if (options.oneofs) {
    //       object.args = "rect";
    //     }
    //   }
    //   if (message.ellipse != null && message.hasOwnProperty("ellipse")) {
    //     object.ellipse = ShapeEntity.EllipseArgs.toObject(
    //       message.ellipse,
    //       options
    //     );
    //     if (options.oneofs) {
    //       object.args = "ellipse";
    //     }
    //   }
    //   if (message.styles != null && message.hasOwnProperty("styles")) {
    //     object.styles = ShapeEntity.ShapeStyle.toObject(message.styles, options);
    //   }
    //   if (message.transform != null && message.hasOwnProperty("transform")) {
    //     object.transform = Transform.toObject(message.transform, options);
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for ShapeEntity
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string): string {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return typeUrlPrefix + "/com.opensource.svga.ShapeEntity";
    // }
    /**
     * ShapeEntity type.
     * @member {com.opensource.svga.ShapeEntity.ShapeType} type
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    type = 0;
    /**
     * ShapeEntity shape.
     * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    shape = null;
    /**
     * ShapeEntity rect.
     * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    rect = null;
    /**
     * ShapeEntity ellipse.
     * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    ellipse = null;
    /**
     * ShapeEntity styles.
     * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    styles = null;
    /**
     * ShapeEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    transform = null;
    $oneOfFields = [
        "shape",
        "rect",
        "ellipse",
    ];
    $fieldMap = {};
    get args() {
        const keys = Object.keys(this);
        for (let i = keys.length - 1; i > -1; --i) {
            const key = keys[i];
            const value = this[key];
            if (this.$fieldMap[key] == 1 && value != null) {
                return key;
            }
        }
        return "";
    }
    set args(name) {
        for (var i = 0; i < this.$oneOfFields.length; ++i) {
            const key = this.$oneOfFields[i];
            if (key != name) {
                delete this[key];
            }
        }
    }
    /**
     * Constructs a new ShapeEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a ShapeEntity.
     * @implements IShapeEntity
     * @constructor
     * @param {com.opensource.svga.IShapeEntity=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.type != null) {
                this.type = properties.type;
            }
            if (properties.ellipse != null) {
                this.ellipse = properties.ellipse;
            }
            if (properties.rect != null) {
                this.rect = properties.rect;
            }
            if (properties.shape != null) {
                this.shape = properties.shape;
            }
            if (properties.styles != null) {
                this.styles = properties.styles;
            }
            if (properties.transform != null) {
                this.transform = properties.transform;
            }
        }
        for (var i = 0; i < this.$oneOfFields.length; ++i) {
            this.$fieldMap[this.$oneOfFields[i]] = 1;
        }
    }
}

// export class FrameEntityWriter {
//   /**
//    * Encodes the specified FrameEntity message. Does not implicitly {@link com.opensource.svga.FrameEntity.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.FrameEntity
//    * @static
//    * @param {com.opensource.svga.IFrameEntity} message FrameEntity message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: FrameEntity, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (message.alpha != null && Object.hasOwn(message, "alpha")) {
//       writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.alpha);
//     }
//     if (message.layout != null && Object.hasOwn(message, "layout")) {
//       Layout.encode(
//         message.layout,
//         writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
//       ).ldelim();
//     }
//     if (message.transform != null && Object.hasOwn(message, "transform")) {
//       Transform.encode(
//         message.transform,
//         writer.uint32(/* id 3, wireType 2 =*/ 26).fork()
//       ).ldelim();
//     }
//     if (message.clipPath != null && Object.hasOwn(message, "clipPath")) {
//       writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.clipPath);
//     }
//     if (message.shapes != null && message.shapes.length) {
//       for (let i = 0; i < message.shapes.length; ++i) {
//         ShapeEntity.encode(
//           message.shapes[i],
//           writer.uint32(/* id 5, wireType 2 =*/ 42).fork()
//         ).ldelim();
//       }
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified FrameEntity message, length delimited. Does not implicitly {@link com.opensource.svga.FrameEntity.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.FrameEntity
//    * @static
//    * @param {com.opensource.svga.IFrameEntity} message FrameEntity message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: FrameEntity, writer: Writer): Writer {
//     return FrameEntity.encode(message, writer).ldelim();
//   }
// }
class FrameEntity {
    /**
     * Decodes a FrameEntity message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.FrameEntity} FrameEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        const end = length == undefined ? reader.len : reader.pos + length;
        const message = new FrameEntity();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.alpha = reader.float();
                    break;
                }
                case 2: {
                    message.layout = Layout.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    message.transform = Transform.decode(reader, reader.uint32());
                    break;
                }
                case 4: {
                    message.clipPath = reader.string();
                    break;
                }
                case 5: {
                    if (!(message.shapes && message.shapes.length)) {
                        message.shapes = [];
                    }
                    message.shapes.push(ShapeEntity.decode(reader, reader.uint32()));
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a FrameEntity message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.FrameEntity} FrameEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): FrameEntity {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies a FrameEntity message.
     * @function verify
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   if (message.alpha != null && message.hasOwnProperty("alpha")) {
    //     if (typeof message.alpha != "number") {
    //       return "alpha: number expected";
    //     }
    //   }
    //   if (message.layout != null && message.hasOwnProperty("layout")) {
    //     const error = Layout.verify(message.layout);
    //     if (error) {
    //       return "layout." + error;
    //     }
    //   }
    //   if (message.transform != null && message.hasOwnProperty("transform")) {
    //     const error = Transform.verify(message.transform);
    //     if (error) {
    //       return "transform." + error;
    //     }
    //   }
    //   if (message.clipPath != null && message.hasOwnProperty("clipPath")) {
    //     if (!isString(message.clipPath)) {
    //       return "clipPath: string expected";
    //     }
    //   }
    //   if (message.shapes != null && message.hasOwnProperty("shapes")) {
    //     if (!Array.isArray(message.shapes)) {
    //       return "shapes: array expected";
    //     }
    //     for (let i = 0; i < message.shapes.length; ++i) {
    //       const error = ShapeEntity.verify(message.shapes[i]);
    //       if (error) {
    //         return "shapes." + error;
    //       }
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a FrameEntity message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.FrameEntity} FrameEntity
     */
    // static fromObject(object: Record<string, any>): FrameEntity {
    //   if (object instanceof FrameEntity) {
    //     return object;
    //   }
    //   const message = new FrameEntity();
    //   if (object.alpha != null) {
    //     message.alpha = +object.alpha;
    //   }
    //   if (object.layout != null) {
    //     if (typeof object.layout != "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.FrameEntity.layout: object expected"
    //       );
    //     }
    //     message.layout = Layout.fromObject(object.layout);
    //   }
    //   if (object.transform != null) {
    //     if (typeof object.transform != "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.FrameEntity.transform: object expected"
    //       );
    //     }
    //     message.transform = Transform.fromObject(object.transform);
    //   }
    //   if (object.clipPath != null) {
    //     message.clipPath = String(object.clipPath);
    //   }
    //   if (object.shapes) {
    //     if (!Array.isArray(object.shapes)) {
    //       throw TypeError(
    //         ".com.opensource.svga.FrameEntity.shapes: array expected"
    //       );
    //     }
    //     message.shapes = [];
    //     for (let i = 0; i < object.shapes.length; ++i) {
    //       if (typeof object.shapes[i] != "object") {
    //         throw TypeError(
    //           ".com.opensource.svga.FrameEntity.shapes: object expected"
    //         );
    //       }
    //       message.shapes[i] = ShapeEntity.fromObject(object.shapes[i]);
    //     }
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a FrameEntity message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {com.opensource.svga.FrameEntity} message FrameEntity
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: FrameEntity,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   const object: Record<string, any> = {};
    //   if (options.arrays || options.defaults) {
    //     object.shapes = [];
    //   }
    //   if (options.defaults) {
    //     object.alpha = 0;
    //     object.layout = null;
    //     object.transform = null;
    //     object.clipPath = "";
    //   }
    //   if (message.alpha != null && message.hasOwnProperty("alpha")) {
    //     object.alpha =
    //       options.json && !isFinite(message.alpha)
    //         ? "" + message.alpha
    //         : message.alpha;
    //   }
    //   if (message.layout != null && message.hasOwnProperty("layout")) {
    //     object.layout = Layout.toObject(message.layout, options);
    //   }
    //   if (message.transform != null && message.hasOwnProperty("transform")) {
    //     object.transform = Transform.toObject(message.transform, options);
    //   }
    //   if (message.clipPath != null && message.hasOwnProperty("clipPath")) {
    //     object.clipPath = message.clipPath;
    //   }
    //   if (message.shapes && message.shapes.length) {
    //     object.shapes = [];
    //     for (let j = 0; j < message.shapes.length; ++j) {
    //       object.shapes[j] = ShapeEntity.toObject(message.shapes[j], options);
    //     }
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for FrameEntity
     * @function getTypeUrl
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string): string {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return typeUrlPrefix + "/com.opensource.svga.FrameEntity";
    // }
    /**
     * FrameEntity shapes.
     * @member {Array.<com.opensource.svga.IShapeEntity>} shapes
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    shapes = [];
    /**
     * FrameEntity alpha.
     * @member {number} alpha
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    alpha = 0;
    /**
     * FrameEntity layout.
     * @member {com.opensource.svga.ILayout|null|undefined} layout
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    layout = null;
    /**
     * FrameEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    transform = null;
    /**
     * FrameEntity clipPath.
     * @member {string} clipPath
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    clipPath = "";
    /**
     * Constructs a new FrameEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a FrameEntity.
     * @implements IFrameEntity
     * @constructor
     * @param {com.opensource.svga.IFrameEntity=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.alpha != null) {
                this.alpha = properties.alpha;
            }
            if (properties.clipPath != null) {
                this.clipPath = properties.clipPath;
            }
            if (properties.layout != null) {
                this.layout = properties.layout;
            }
            if (properties.shapes != null) {
                this.shapes = properties.shapes;
            }
            if (properties.transform != null) {
                this.transform = properties.transform;
            }
        }
    }
}

// export class SpriteEntityWriter {
//   /**
//    * Encodes the specified SpriteEntity message. Does not implicitly {@link com.opensource.svga.SpriteEntity.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.SpriteEntity
//    * @static
//    * @param {com.opensource.svga.ISpriteEntity} message SpriteEntity message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: SpriteEntity, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (message.imageKey != null && Object.hasOwn(message, "imageKey")) {
//       writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.imageKey);
//     }
//     if (message.frames != null && message.frames.length) {
//       for (let i = 0; i < message.frames.length; ++i) {
//         FrameEntity.encode(
//           message.frames[i],
//           writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
//         ).ldelim();
//       }
//     }
//     if (message.matteKey != null && Object.hasOwn(message, "matteKey")) {
//       writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.matteKey);
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified SpriteEntity message, length delimited. Does not implicitly {@link com.opensource.svga.SpriteEntity.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.SpriteEntity
//    * @static
//    * @param {com.opensource.svga.ISpriteEntity} message SpriteEntity message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: SpriteEntity, writer: Writer): Writer {
//     return SpriteEntity.encode(message, writer).ldelim();
//   }
// }
class SpriteEntity {
    /**
     * Decodes a SpriteEntity message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        const end = length == undefined ? reader.len : reader.pos + length;
        const message = new SpriteEntity();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.imageKey = reader.string();
                    break;
                }
                case 2: {
                    if (!(message.frames && message.frames.length)) {
                        message.frames = [];
                    }
                    message.frames.push(FrameEntity.decode(reader, reader.uint32()));
                    break;
                }
                case 3: {
                    message.matteKey = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a SpriteEntity message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): SpriteEntity {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies a SpriteEntity message.
     * @function verify
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   if (message.imageKey != null && message.hasOwnProperty("imageKey")) {
    //     if (!isString(message.imageKey)) {
    //       return "imageKey: string expected";
    //     }
    //   }
    //   if (message.frames != null && message.hasOwnProperty("frames")) {
    //     if (!Array.isArray(message.frames)) {
    //       return "frames: array expected";
    //     }
    //     for (let i = 0; i < message.frames.length; ++i) {
    //       const error = FrameEntity.verify(message.frames[i]);
    //       if (error) {
    //         return "frames." + error;
    //       }
    //     }
    //   }
    //   if (message.matteKey != null && message.hasOwnProperty("matteKey")) {
    //     if (!isString(message.matteKey)) {
    //       return "matteKey: string expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a SpriteEntity message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
     */
    // static fromObject(object: Record<string, any>): SpriteEntity {
    //   if (object instanceof SpriteEntity) {
    //     return object;
    //   }
    //   const message = new SpriteEntity();
    //   if (object.imageKey != null) {
    //     message.imageKey = "" + object.imageKey;
    //   }
    //   if (object.frames) {
    //     if (!Array.isArray(object.frames)) {
    //       throw TypeError(
    //         ".com.opensource.svga.SpriteEntity.frames: array expected"
    //       );
    //     }
    //     message.frames = [];
    //     for (let i = 0; i < object.frames.length; ++i) {
    //       if (typeof object.frames[i] != "object") {
    //         throw TypeError(
    //           ".com.opensource.svga.SpriteEntity.frames: object expected"
    //         );
    //       }
    //       message.frames[i] = FrameEntity.fromObject(object.frames[i]);
    //     }
    //   }
    //   if (object.matteKey != null) {
    //     message.matteKey = "" + object.matteKey;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a SpriteEntity message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {com.opensource.svga.SpriteEntity} message SpriteEntity
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: SpriteEntity,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   const object: Record<string, any> = {};
    //   if (options.arrays || options.defaults) {
    //     object.frames = [];
    //   }
    //   if (options.defaults) {
    //     object.imageKey = "";
    //     object.matteKey = "";
    //   }
    //   if (message.imageKey != null && message.hasOwnProperty("imageKey")) {
    //     object.imageKey = message.imageKey;
    //   }
    //   if (message.frames && message.frames.length) {
    //     object.frames = [];
    //     for (let j = 0; j < message.frames.length; ++j) {
    //       object.frames[j] = FrameEntity.toObject(message.frames[j], options);
    //     }
    //   }
    //   if (message.matteKey != null && message.hasOwnProperty("matteKey")) {
    //     object.matteKey = message.matteKey;
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for SpriteEntity
     * @function getTypeUrl
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string): string {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return typeUrlPrefix + "/com.opensource.svga.SpriteEntity";
    // }
    /**
     * SpriteEntity frames.
     * @member {Array.<com.opensource.svga.IFrameEntity>} frames
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    frames = [];
    /**
     * SpriteEntity imageKey.
     * @member {string} imageKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    imageKey = "";
    /**
     * SpriteEntity matteKey.
     * @member {string} matteKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    matteKey = "";
    /**
     * Constructs a new SpriteEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a SpriteEntity.
     * @implements ISpriteEntity
     * @constructor
     * @param {com.opensource.svga.ISpriteEntity=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.frames != null) {
                this.frames = properties.frames;
            }
            if (properties.imageKey != null) {
                this.imageKey = properties.imageKey;
            }
            if (properties.matteKey != null) {
                this.matteKey = properties.matteKey;
            }
        }
    }
}

// export class MovieParamsWriter {
//   /**
//    * Encodes the specified MovieParams message. Does not implicitly {@link com.opensource.svga.MovieParams.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.MovieParams
//    * @static
//    * @param {com.opensource.svga.IMovieParams} message MovieParams message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: MovieParams, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (
//       message.viewBoxWidth != null &&
//       Object.hasOwn(message, "viewBoxWidth")
//     ) {
//       writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.viewBoxWidth);
//     }
//     if (
//       message.viewBoxHeight != null &&
//       Object.hasOwn(message, "viewBoxHeight")
//     ) {
//       writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.viewBoxHeight);
//     }
//     if (message.fps != null && Object.hasOwn(message, "fps")) {
//       writer.uint32(/* id 3, wireType 0 =*/ 24).int32(message.fps);
//     }
//     if (message.frames != null && Object.hasOwn(message, "frames")) {
//       writer.uint32(/* id 4, wireType 0 =*/ 32).int32(message.frames);
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified MovieParams message, length delimited. Does not implicitly {@link com.opensource.svga.MovieParams.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.MovieParams
//    * @static
//    * @param {com.opensource.svga.IMovieParams} message MovieParams message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: MovieParams, writer: Writer): Writer {
//     return MovieParams.encode(message, writer).ldelim();
//   }
// }
class MovieParams {
    /**
     * Decodes a MovieParams message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.MovieParams} MovieParams
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        let end = length == undefined ? reader.len : reader.pos + length;
        let message = new MovieParams();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.viewBoxWidth = reader.float();
                    break;
                }
                case 2: {
                    message.viewBoxHeight = reader.float();
                    break;
                }
                case 3: {
                    message.fps = reader.int32();
                    break;
                }
                case 4: {
                    message.frames = reader.int32();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a MovieParams message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.MovieParams} MovieParams
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): MovieParams {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies a MovieParams message.
     * @function verify
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   if (
    //     message.viewBoxWidth != null &&
    //     message.hasOwnProperty("viewBoxWidth")
    //   ) {
    //     if (typeof message.viewBoxWidth != "number") {
    //       return "viewBoxWidth: number expected";
    //     }
    //   }
    //   if (
    //     message.viewBoxHeight != null &&
    //     message.hasOwnProperty("viewBoxHeight")
    //   ) {
    //     if (typeof message.viewBoxHeight != "number") {
    //       return "viewBoxHeight: number expected";
    //     }
    //   }
    //   if (message.fps != null && message.hasOwnProperty("fps")) {
    //     if (!isInteger(message.fps)) {
    //       return "fps: integer expected";
    //     }
    //   }
    //   if (message.frames != null && message.hasOwnProperty("frames")) {
    //     if (!isInteger(message.frames)) {
    //       return "frames: integer expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a MovieParams message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.MovieParams} MovieParams
     */
    // static fromObject(object: Record<string, any>): MovieParams {
    //   if (object instanceof MovieParams) {
    //     return object;
    //   }
    //   const message = new MovieParams();
    //   if (object.viewBoxWidth != null) {
    //     message.viewBoxWidth = +object.viewBoxWidth;
    //   }
    //   if (object.viewBoxHeight != null) {
    //     message.viewBoxHeight = +object.viewBoxHeight;
    //   }
    //   if (object.fps != null) {
    //     message.fps = object.fps | 0;
    //   }
    //   if (object.frames != null) {
    //     message.frames = object.frames | 0;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a MovieParams message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {com.opensource.svga.MovieParams} message MovieParams
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: MovieParams,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   const object: Record<string, any> = {};
    //   if (options.defaults) {
    //     object.viewBoxWidth = 0;
    //     object.viewBoxHeight = 0;
    //     object.fps = 0;
    //     object.frames = 0;
    //   }
    //   if (
    //     message.viewBoxWidth != null &&
    //     message.hasOwnProperty("viewBoxWidth")
    //   ) {
    //     object.viewBoxWidth =
    //       options.json && !isFinite(message.viewBoxWidth)
    //         ? "" + message.viewBoxWidth
    //         : message.viewBoxWidth;
    //   }
    //   if (
    //     message.viewBoxHeight != null &&
    //     message.hasOwnProperty("viewBoxHeight")
    //   ) {
    //     object.viewBoxHeight =
    //       options.json && !isFinite(message.viewBoxHeight)
    //         ? "" + message.viewBoxHeight
    //         : message.viewBoxHeight;
    //   }
    //   if (message.fps != null && message.hasOwnProperty("fps")) {
    //     object.fps = message.fps;
    //   }
    //   if (message.frames != null && message.hasOwnProperty("frames")) {
    //     object.frames = message.frames;
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for MovieParams
     * @function getTypeUrl
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string): string {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return typeUrlPrefix + "/com.opensource.svga.MovieParams";
    // }
    /**
     * MovieParams viewBoxWidth.
     * @member {number} viewBoxWidth
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxWidth = 0;
    /**
     * MovieParams viewBoxHeight.
     * @member {number} viewBoxHeight
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxHeight = 0;
    /**
     * MovieParams fps.
     * @member {number} fps
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    fps = 0;
    /**
     * MovieParams frames.
     * @member {number} frames
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    frames = 0;
    /**
     * Constructs a new MovieParams.
     * @memberof com.opensource.svga
     * @classdesc Represents a MovieParams.
     * @implements IMovieParams
     * @constructor
     * @param {com.opensource.svga.IMovieParams=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.viewBoxWidth != null) {
                this.viewBoxWidth = properties.viewBoxWidth;
            }
            if (properties.viewBoxHeight != null) {
                this.viewBoxHeight = properties.viewBoxHeight;
            }
            if (properties.fps != null) {
                this.fps = properties.fps;
            }
            if (properties.frames != null) {
                this.frames = properties.frames;
            }
        }
    }
}

/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
const emptyObject = Object.freeze({});

// import base64 from "@protobufjs/base64";
// export class MovieEntityWriter {
//   /**
//    * Encodes the specified MovieEntity message. Does not implicitly {@link com.opensource.svga.MovieEntity.verify|verify} messages.
//    * @function encode
//    * @memberof com.opensource.svga.MovieEntity
//    * @static
//    * @param {com.opensource.svga.IMovieEntity} message MovieEntity message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encode(message: MovieEntity, writer: Writer): Writer {
//     if (!writer) {
//       writer = Writer.create();
//     }
//     if (message.version != null && Object.hasOwn(message, "version")) {
//       writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.version);
//     }
//     if (message.params != null && Object.hasOwn(message, "params")) {
//       MovieParams.encode(
//         message.params,
//         writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
//       ).ldelim();
//     }
//     if (message.images != null && Object.hasOwn(message, "images")) {
//       const keys = Object.keys(message.images);
//       for (let i = 0; i < keys.length; ++i) {
//         writer
//           .uint32(/* id 3, wireType 2 =*/ 26)
//           .fork()
//           .uint32(/* id 1, wireType 2 =*/ 10)
//           .string(keys[i])
//           .uint32(/* id 2, wireType 2 =*/ 18)
//           .bytes(message.images[keys[i]])
//           .ldelim();
//       }
//     }
//     if (message.sprites != null && message.sprites.length) {
//       for (let i = 0; i < message.sprites.length; ++i) {
//         SpriteEntity.encode(
//           message.sprites[i],
//           writer.uint32(/* id 4, wireType 2 =*/ 34).fork()
//         ).ldelim();
//       }
//     }
//     return writer;
//   }
//   /**
//    * Encodes the specified MovieEntity message, length delimited. Does not implicitly {@link com.opensource.svga.MovieEntity.verify|verify} messages.
//    * @function encodeDelimited
//    * @memberof com.opensource.svga.MovieEntity
//    * @static
//    * @param {com.opensource.svga.IMovieEntity} message MovieEntity message or plain object to encode
//    * @param {$protobuf.Writer} [writer] Writer to encode to
//    * @returns {$protobuf.Writer} Writer
//    */
//   static encodeDelimited(message: MovieEntity, writer: Writer): Writer {
//     return MovieEntity.encode(message, writer).ldelim();
//   }
// }
class MovieEntity {
    /**
     * Decodes a MovieEntity message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.MovieEntity} MovieEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        reader = Reader.create(reader);
        const end = length == undefined ? reader.len : reader.pos + length;
        const message = new MovieEntity();
        let key;
        let value;
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.version = reader.string();
                    break;
                }
                case 2: {
                    message.params = MovieParams.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    if (message.images == emptyObject) {
                        message.images = {};
                    }
                    const end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = [];
                    while (reader.pos < end2) {
                        let tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.bytes();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                        }
                    }
                    message.images[key] = value;
                    break;
                }
                case 4: {
                    if (!(message.sprites && message.sprites.length)) {
                        message.sprites = [];
                    }
                    message.sprites.push(SpriteEntity.decode(reader, reader.uint32()));
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a MovieEntity message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.MovieEntity} MovieEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    // static decodeDelimited(reader: Reader | Uint8Array): MovieEntity {
    //   reader = Reader.create(reader);
    //   return this.decode(reader, reader.uint32());
    // }
    /**
     * Verifies a MovieEntity message.
     * @function verify
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message != "object" || message == null) {
    //     return "object expected";
    //   }
    //   if (message.version != null && message.hasOwnProperty("version")) {
    //     if (!isString(message.version)) {
    //       return "version: string expected";
    //     }
    //   }
    //   if (message.params != null && message.hasOwnProperty("params")) {
    //     const error = MovieParams.verify(message.params);
    //     if (error) {
    //       return "params." + error;
    //     }
    //   }
    //   if (message.images != null && message.hasOwnProperty("images")) {
    //     if (!isObject(message.images)) {
    //       return "images: object expected";
    //     }
    //     const keys = Object.keys(message.images);
    //     for (let i = 0; i < keys.length; ++i) {
    //       const key = keys[i];
    //       if (
    //         !(
    //           (message.images[key] &&
    //             typeof message.images[key].length == "number") ||
    //           isString(message.images[key])
    //         )
    //       ) {
    //         return "images: buffer{k:string} expected";
    //       }
    //     }
    //   }
    //   if (message.sprites != null && message.hasOwnProperty("sprites")) {
    //     if (!Array.isArray(message.sprites)) {
    //       return "sprites: array expected";
    //     }
    //     for (let i = 0; i < message.sprites.length; ++i) {
    //       const error = SpriteEntity.verify(message.sprites[i]);
    //       if (error) {
    //         return "sprites." + error;
    //       }
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a MovieEntity message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.MovieEntity} MovieEntity
     */
    // static fromObject(object: Record<string, any>): MovieEntity {
    //   if (object instanceof MovieEntity) {
    //     return object;
    //   }
    //   const message = new MovieEntity();
    //   if (object.version != null) {
    //     message.version = "" + object.version;
    //   }
    //   if (object.params != null) {
    //     if (typeof object.params != "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.MovieEntity.params: object expected"
    //       );
    //     }
    //     message.params = MovieParams.fromObject(object.params);
    //   }
    //   if (object.images) {
    //     if (typeof object.images != "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.MovieEntity.images: object expected"
    //       );
    //     }
    //     message.images = {};
    //     const keys = Object.keys(object.images);
    //     for (let i = 0; i < keys.length; ++i) {
    //       const key = keys[i];
    //       if (typeof object.images[key] == "string") {
    //         base64.decode(
    //           object.images[key],
    //           (message.images[key] = new Uint8Array(
    //             base64.length(object.images[key])
    //           )),
    //           0
    //         );
    //       } else if (object.images[key].length >= 0) {
    //         message.images[key] = object.images[key];
    //       }
    //     }
    //   }
    //   if (object.sprites) {
    //     if (!Array.isArray(object.sprites)) {
    //       throw TypeError(
    //         ".com.opensource.svga.MovieEntity.sprites: array expected"
    //       );
    //     }
    //     message.sprites = [];
    //     for (let i = 0; i < object.sprites.length; ++i) {
    //       if (typeof object.sprites[i] != "object") {
    //         throw TypeError(
    //           ".com.opensource.svga.MovieEntity.sprites: object expected"
    //         );
    //       }
    //       message.sprites[i] = SpriteEntity.fromObject(object.sprites[i]);
    //     }
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a MovieEntity message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {com.opensource.svga.MovieEntity} message MovieEntity
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    // static toObject(
    //   message: MovieEntity,
    //   options: Record<string, any>
    // ): Record<string, any> {
    //   if (!options) {
    //     options = {};
    //   }
    //   const object: Record<string, any> = {};
    //   if (options.arrays || options.defaults) {
    //     object.sprites = [];
    //   }
    //   if (options.objects || options.defaults) {
    //     object.images = {};
    //   }
    //   if (options.defaults) {
    //     object.version = "";
    //     object.params = null;
    //   }
    //   if (message.version != null && message.hasOwnProperty("version")) {
    //     object.version = message.version;
    //   }
    //   if (message.params != null && message.hasOwnProperty("params")) {
    //     object.params = MovieParams.toObject(message.params, options);
    //   }
    //   let keys2;
    //   if (message.images && (keys2 = Object.keys(message.images)).length) {
    //     object.images = {};
    //     for (let j = 0; j < keys2.length; ++j) {
    //       const key = keys2[j];
    //       object.images[key] =
    //         options.bytes == String
    //           ? base64.encode(message.images[key], 0, message.images[key].length)
    //           : options.bytes == Array
    //           ? [...message.images[key]]
    //           : message.images[key];
    //     }
    //   }
    //   if (message.sprites && message.sprites.length) {
    //     object.sprites = [];
    //     for (let j = 0; j < message.sprites.length; ++j) {
    //       object.sprites[j] = SpriteEntity.toObject(message.sprites[j], options);
    //     }
    //   }
    //   return object;
    // }
    /**
     * Gets the default type url for MovieEntity
     * @function getTypeUrl
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    // static getTypeUrl(typeUrlPrefix?: string) {
    //   if (typeUrlPrefix == undefined) {
    //     typeUrlPrefix = "type.googleapis.com";
    //   }
    //   return typeUrlPrefix + "/com.opensource.svga.MovieEntity";
    // }
    /**
     * MovieEntity version.
     * @member {string} version
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    version = "";
    /**
     * MovieEntity params.
     * @member {com.opensource.svga.IMovieParams|null|undefined} params
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    params = null;
    /**
     * MovieEntity images.
     * @member {Object.<string,Uint8Array>} images
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    images = emptyObject;
    /**
     * MovieEntity sprites.
     * @member {Array.<com.opensource.svga.ISpriteEntity>} sprites
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    sprites = [];
    /**
     * Constructs a new MovieEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a MovieEntity.
     * @implements IMovieEntity
     * @constructor
     * @param {com.opensource.svga.IMovieEntity=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.version != null) {
                this.version = properties.version;
            }
            if (properties.images != null) {
                this.images = properties.images;
            }
            if (properties.params != null) {
                this.params = properties.params;
            }
            if (properties.sprites != null) {
                this.sprites = properties.sprites;
            }
        }
    }
}

// ---------------------------------------------------------------------
// qrBitBuffer
// ---------------------------------------------------------------------
class BitBuffer {
    buffer = [];
    lengthInBits = 0;
    getAt(i) {
        const bufIndex = ~~(i / 8);
        return ((this.buffer[bufIndex] >>> (7 - (i % 8))) & 1) == 1;
    }
    put(num, length) {
        for (let i = 0; i < length; i++) {
            this.putBit(((num >>> (length - i - 1)) & 1) == 1);
        }
    }
    putBit(bit) {
        const { lengthInBits: len, buffer } = this;
        const bufIndex = ~~(len / 8);
        if (buffer.length <= bufIndex) {
            buffer.push(0);
        }
        if (bit) {
            buffer[bufIndex] |= 0x80 >>> len % 8;
        }
        this.lengthInBits += 1;
    }
}

// ---------------------------------------------------------------------
// QRMode
// ---------------------------------------------------------------------
const QRMode = {
    MODE_NUMBER: 1 << 0,
    MODE_ALPHA_NUM: 1 << 1,
    MODE_8BIT_BYTE: 1 << 2,
    MODE_KANJI: 1 << 3,
};
// ---------------------------------------------------------------------
// QRErrorCorrectLevel
// ---------------------------------------------------------------------
const QRErrorCorrectLevel = {
    L: 1,
    M: 0,
    Q: 3,
    H: 2,
};
// ---------------------------------------------------------------------
// QRMaskPattern
// ---------------------------------------------------------------------
const QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7,
};

// ---------------------------------------------------------------------
// qr8BitByte
// ---------------------------------------------------------------------
class BitByte {
    bytes;
    constructor(data) {
        let parsedData = [];
        // Added to support UTF-8 Characters
        for (let i = 0; i < data.length; i++) {
            const byteArray = [];
            const code = data.charCodeAt(i);
            if (code > 0x10000) {
                byteArray[0] = 0xf0 | ((code & 0x1c0000) >>> 18);
                byteArray[1] = 0x80 | ((code & 0x3f000) >>> 12);
                byteArray[2] = 0x80 | ((code & 0xfc0) >>> 6);
                byteArray[3] = 0x80 | (code & 0x3f);
            }
            else if (code > 0x800) {
                byteArray[0] = 0xe0 | ((code & 0xf000) >>> 12);
                byteArray[1] = 0x80 | ((code & 0xfc0) >>> 6);
                byteArray[2] = 0x80 | (code & 0x3f);
            }
            else if (code > 0x80) {
                byteArray[0] = 0xc0 | ((code & 0x7c0) >>> 6);
                byteArray[1] = 0x80 | (code & 0x3f);
            }
            else {
                byteArray[0] = code;
            }
            // Fix Unicode corruption bug
            parsedData.push(byteArray);
        }
        this.bytes = parsedData.flat(1);
        const { bytes } = this;
        if (bytes.length != data.length) {
            bytes.unshift(191);
            bytes.unshift(187);
            bytes.unshift(239);
        }
    }
    get mode() {
        return QRMode.MODE_8BIT_BYTE;
    }
    get length() {
        return this.bytes.length;
    }
    write(buff) {
        const { bytes } = this;
        for (let i = 0; i < bytes.length; i++) {
            buff.put(bytes[i], 8);
        }
    }
}

// ---------------------------------------------------------------------
// QRRSBlock
// ---------------------------------------------------------------------
const RS_BLOCK_TABLE = [
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12],
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16],
];
class RSBlock {
    getRSBlockTable(typeNumber, errorCorrectLevel) {
        const { L, M, Q, H } = QRErrorCorrectLevel;
        const pos = (typeNumber - 1) * 4;
        switch (errorCorrectLevel) {
            case L:
                return RS_BLOCK_TABLE[pos + 0];
            case M:
                return RS_BLOCK_TABLE[pos + 1];
            case Q:
                return RS_BLOCK_TABLE[pos + 2];
            case H:
                return RS_BLOCK_TABLE[pos + 3];
            default:
                throw new Error(`bad rs block @ typeNumber:${typeNumber}/errorCorrectLevel: ${errorCorrectLevel}`);
        }
    }
    getRSBlocks(typeNumber, errorCorrectLevel) {
        const rsBlock = this.getRSBlockTable(typeNumber, errorCorrectLevel);
        const length = rsBlock.length / 3;
        const list = [];
        for (let i = 0; i < length; i++) {
            const count = rsBlock[i * 3];
            const totalCount = rsBlock[i * 3 + 1];
            const dataCount = rsBlock[i * 3 + 2];
            for (let j = 0; j < count; j++) {
                list.push({ totalCount, dataCount });
            }
        }
        return list;
    }
}

// ---------------------------------------------------------------------
// base64DecodeInputStream
// ---------------------------------------------------------------------
class Base64DecodeInputStream {
    data;
    pos = 0;
    buffer = 0;
    buflen = 0;
    constructor(data) {
        this.data = data;
    }
    decode(c) {
        if (c >= 0x41 && c <= 0x5a) {
            return c - 0x41;
        }
        if (c >= 0x61 && c <= 0x7a) {
            return c - 0x61 + 26;
        }
        if (c >= 0x30 && c <= 0x39) {
            return c - 0x30 + 52;
        }
        if (c == 0x2b) {
            return 62;
        }
        if (c == 0x2f) {
            return 63;
        }
        throw new Error(`c: ${c}`);
    }
    read() {
        while (this.buflen < 8) {
            if (this.pos >= this.data.length) {
                if (this.buflen == 0) {
                    return -1;
                }
                throw new Error(`unexpected end of file./${this.buflen}`);
            }
            const c = this.data.charAt(this.pos);
            this.pos++;
            if (c == '=') {
                this.buflen = 0;
                return -1;
            }
            else if (c.match(/^\s$/)) {
                // ignore if whitespace.
                continue;
            }
            this.buffer = (this.buffer << 6) | this.decode(c.charCodeAt(0));
            this.buflen += 6;
        }
        this.buflen -= 8;
        const n = (this.buffer >>> this.buflen) & 0xff;
        return n;
    }
}

// ---------------------------------------------------------------------
// QRMath
// ---------------------------------------------------------------------
const EXP_TABLE = new Array(256);
const LOG_TABLE = new Array(256);
// initialize tables
for (let i = 0; i < 8; i++) {
    EXP_TABLE[i] = 1 << i;
}
for (let i = 8; i < 256; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) {
    LOG_TABLE[EXP_TABLE[i]] = i;
}
const QRMath = {
    glog(n) {
        if (n < 1) {
            throw new Error(`glog(${n})`);
        }
        return LOG_TABLE[n];
    },
    gexp(n) {
        if (n < 0) {
            n = 255 + (n % 255);
        }
        else if (n > 255) {
            n %= 255;
        }
        return EXP_TABLE[n];
    }
};

// ---------------------------------------------------------------------
// Polynomial
// ---------------------------------------------------------------------
class Polynomial {
    num;
    constructor(num, shift) {
        const { length } = num;
        if (typeof length == 'undefined') {
            throw new Error(`${length}/${shift}`);
        }
        let offset = 0;
        while (offset < length && num[offset] == 0) {
            offset++;
        }
        const len = length - offset;
        this.num = new Array(len + shift);
        for (let i = 0; i < len; i++) {
            this.num[i] = num[i + offset];
        }
    }
    get length() {
        return this.num.length;
    }
    getAt(i) {
        return this.num[i];
    }
    multiply(e) {
        const { glog, gexp } = QRMath;
        const num = [];
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < e.length; j++) {
                num[i + j] ^= gexp(glog(this.getAt(i)) + glog(e.getAt(j)));
            }
        }
        return new Polynomial(num, 0);
    }
    mod(e) {
        if (this.length - e.length < 0) {
            return this;
        }
        const { glog, gexp } = QRMath;
        const ratio = glog(this.getAt(0)) - glog(e.getAt(0));
        const num = [];
        for (var i = 0; i < this.length; i++) {
            const n = this.getAt(i);
            num[i] = i < e.length ? n ^ gexp(glog(e.getAt(i)) + ratio) : n;
        }
        // recursive call
        return new Polynomial(num, 0).mod(e);
    }
}

const PATTERN_POSITION_TABLE = [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170],
];
const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
const G18 = (1 << 12) |
    (1 << 11) |
    (1 << 10) |
    (1 << 9) |
    (1 << 8) |
    (1 << 5) |
    (1 << 2) |
    (1 << 0);
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
const genBCHDigit = (data) => data == 0 ? 0 : Math.log2(data);
const BCH_G15 = genBCHDigit(G15);
const BCH_G18 = genBCHDigit(G18);
// ---------------------------------------------------------------------
// QRUtil
// ---------------------------------------------------------------------
const Util = {
    getBCHTypeInfo(data) {
        let d = data << 10;
        while (genBCHDigit(d) - BCH_G15 >= 0) {
            d ^= G15 << (genBCHDigit(d) - BCH_G15);
        }
        return ((data << 10) | d) ^ G15_MASK;
    },
    getBCHTypeNumber(data) {
        let d = data << 12;
        while (genBCHDigit(d) - BCH_G18 >= 0) {
            d ^= G18 << (genBCHDigit(d) - BCH_G18);
        }
        return (data << 12) | d;
    },
    getPatternPosition(typeNumber) {
        return PATTERN_POSITION_TABLE[typeNumber - 1];
    },
    getMaskFunction(maskPattern) {
        const { PATTERN000, PATTERN001, PATTERN010, PATTERN011, PATTERN100, PATTERN101, PATTERN110, PATTERN111, } = QRMaskPattern;
        switch (maskPattern) {
            case PATTERN000:
                return (i, j) => (i + j) % 2 == 0;
            case PATTERN001:
                return (i) => i % 2 == 0;
            case PATTERN010:
                return (_i, j) => j % 3 == 0;
            case PATTERN011:
                return (i, j) => (i + j) % 3 == 0;
            case PATTERN100:
                return (i, j) => (~~(i / 2) + ~~(j / 3)) % 2 == 0;
            case PATTERN101:
                return (i, j) => ((i * j) % 2) + ((i * j) % 3) == 0;
            case PATTERN110:
                return (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 == 0;
            case PATTERN111:
                return (i, j) => (((i * j) % 3) + ((i + j) % 2)) % 2 == 0;
            default:
                throw new Error(`bad maskPattern: ${maskPattern}`);
        }
    },
    getErrorCorrectPolynomial(errorCorrectLength) {
        let a = new Polynomial([1], 0);
        for (let i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new Polynomial([1, QRMath.gexp(i)], 0));
        }
        return a;
    },
    getLengthInBits(mode, type) {
        const { MODE_NUMBER, MODE_ALPHA_NUM, MODE_8BIT_BYTE, MODE_KANJI } = QRMode;
        if (type < 1 || type > 40) {
            throw new Error(`type: ${type}`);
        }
        if (type >= 1 && type < 10) {
            // 1 - 9
            switch (mode) {
                case MODE_NUMBER:
                    return 10;
                case MODE_ALPHA_NUM:
                    return 9;
                case MODE_8BIT_BYTE:
                    return 8;
                case MODE_KANJI:
                    return 8;
            }
        }
        if (type < 27) {
            // 10 - 26
            switch (mode) {
                case MODE_NUMBER:
                    return 12;
                case MODE_ALPHA_NUM:
                    return 11;
                case MODE_8BIT_BYTE:
                    return 16;
                case MODE_KANJI:
                    return 10;
            }
        }
        if (type <= 40) {
            // 27 - 40
            switch (mode) {
                case MODE_NUMBER:
                    return 14;
                case MODE_ALPHA_NUM:
                    return 13;
                case MODE_8BIT_BYTE:
                    return 16;
                case MODE_KANJI:
                    return 12;
            }
        }
        throw new Error(`mode: ${mode}`);
    },
    getLostPoint(qr) {
        const moduleCount = qr.getModuleCount();
        let lostPoint = 0;
        // LEVEL1
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                const dark = qr.isDark(row, col);
                let sameCount = 0;
                for (let r = -1; r <= 1; r++) {
                    const nRow = row + r;
                    if (nRow < 0 || moduleCount <= nRow)
                        continue;
                    for (let c = -1; c <= 1; c++) {
                        const nCol = col + c;
                        if (nCol < 0 || moduleCount <= nCol)
                            continue;
                        if (r == 0 && c == 0)
                            continue;
                        if (dark == qr.isDark(nRow, nCol)) {
                            sameCount++;
                        }
                    }
                }
                if (sameCount > 5) {
                    lostPoint += sameCount + 3 - 5;
                }
            }
        }
        // LEVEL2
        for (let row = 0; row < moduleCount - 1; row++) {
            for (let col = 0; col < moduleCount - 1; col++) {
                let count = 0;
                if (qr.isDark(row, col))
                    count++;
                if (qr.isDark(row + 1, col))
                    count++;
                if (qr.isDark(row, col + 1))
                    count++;
                if (qr.isDark(row + 1, col + 1))
                    count++;
                if (count == 0 || count == 4) {
                    lostPoint += 3;
                }
            }
        }
        // LEVEL3
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount - 6; col++) {
                if (qr.isDark(row, col) &&
                    !qr.isDark(row, col + 1) &&
                    qr.isDark(row, col + 2) &&
                    qr.isDark(row, col + 3) &&
                    qr.isDark(row, col + 4) &&
                    !qr.isDark(row, col + 5) &&
                    qr.isDark(row, col + 6)) {
                    lostPoint += 40;
                }
            }
        }
        for (let col = 0; col < moduleCount; col++) {
            for (let row = 0; row < moduleCount - 6; row++) {
                if (qr.isDark(row, col) &&
                    !qr.isDark(row + 1, col) &&
                    qr.isDark(row + 2, col) &&
                    qr.isDark(row + 3, col) &&
                    qr.isDark(row + 4, col) &&
                    !qr.isDark(row + 5, col) &&
                    qr.isDark(row + 6, col)) {
                    lostPoint += 40;
                }
            }
        }
        // LEVEL4
        let darkCount = 0;
        for (let col = 0; col < moduleCount; col++) {
            for (let row = 0; row < moduleCount; row++) {
                if (qr.isDark(row, col)) {
                    darkCount++;
                }
            }
        }
        const ratio = Math.abs((100 * darkCount) / Math.pow(moduleCount, 2) - 50) / 5;
        return lostPoint + ratio * 10;
    },
};

// ---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2025 LiHZSky
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
// http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//
// ---------------------------------------------------------------------
const PAD0 = 0xec;
const PAD1 = 0x11;
/**
 * QRCode实现
 * https://www.cnblogs.com/leestar54/p/15782929.html
 * @param typeNumber 1 to 40
 * @param errorCorrectLevel 'L','M','Q','H'
 */
class QRCode {
    typeNumber;
    // ---------------------------------------------------------------------
    // QRCode.stringToBytes
    // ---------------------------------------------------------------------
    static stringToBytes(s) {
        const bytes = [];
        for (let i = 0; i < s.length; i++) {
            bytes.push(s.charCodeAt(i) & 0xff);
        }
        return bytes;
    }
    // ---------------------------------------------------------------------
    // qrcode.createStringToBytes
    // ---------------------------------------------------------------------
    /**
     * @param unicodeData base64 string of byte array.
     * [16bit Unicode],[16bit Bytes], ...
     * @param numChars
     */
    static createStringToBytes(unicodeData, numChars) {
        // create conversion map.
        const unicodeMap = (() => {
            const bin = new Base64DecodeInputStream(unicodeData);
            const read = () => {
                const b = bin.read();
                if (b == -1)
                    throw new Error("character defect!");
                return b;
            };
            const unicodeMap = {};
            let count = 0;
            while (true) {
                const b0 = bin.read();
                if (b0 == -1)
                    break;
                const b1 = read();
                const b2 = read();
                const b3 = read();
                const k = String.fromCharCode((b0 << 8) | b1);
                const v = (b2 << 8) | b3;
                unicodeMap[k] = v;
                count += 1;
            }
            if (count != numChars) {
                throw new Error(`${count} != ${numChars}`);
            }
            return unicodeMap;
        })();
        const unknownChar = "?".charCodeAt(0);
        return (s) => {
            const bytes = [];
            for (let i = 0; i < s.length; i++) {
                const c = s.charCodeAt(i);
                if (c < 128) {
                    bytes.push(c);
                }
                else {
                    const b = unicodeMap[s.charAt(i)];
                    if (typeof b == "number") {
                        if ((b & 0xff) == b) {
                            // 1byte
                            bytes.push(b);
                        }
                        else {
                            // 2bytes
                            bytes.push(b >>> 8);
                            bytes.push(b & 0xff);
                        }
                    }
                    else {
                        bytes.push(unknownChar);
                    }
                }
            }
            return bytes;
        };
    }
    errorCorrectLevel;
    modules = [];
    moduleCount = 0;
    dataCache = null;
    dataList = [];
    constructor(typeNumber, errorCorrectLevel) {
        this.typeNumber = typeNumber;
        this.errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
    }
    makeImpl(test, maskPattern) {
        this.moduleCount = this.typeNumber * 4 + 17;
        this.modules = ((moduleCount) => {
            const modules = [];
            // 预设一个 moduleCount * moduleCount 的空白矩阵
            for (let row = 0; row < moduleCount; row++) {
                modules[row] = [];
                for (let col = 0; col < moduleCount; col++) {
                    modules[row][col] = null;
                }
            }
            return modules;
        })(this.moduleCount);
        const count = this.moduleCount - 7;
        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(count, 0);
        this.setupPositionProbePattern(0, count);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(test, maskPattern);
        if (this.typeNumber >= 7) {
            this.setupTypeNumber(test);
        }
        if (this.dataCache == null) {
            this.dataCache = this.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
        }
        this.mapData(this.dataCache, maskPattern);
    }
    setupPositionProbePattern(row, col) {
        const { modules, moduleCount } = this;
        for (let r = -1; r <= 7; r++) {
            const nr = row + r;
            if (nr <= -1 || moduleCount <= nr)
                continue;
            for (let c = -1; c <= 7; c++) {
                const nc = col + c;
                if (nc <= -1 || moduleCount <= nc)
                    continue;
                modules[nr][nc] =
                    (r >= 0 && r <= 6 && (c == 0 || c == 6)) ||
                        (c >= 0 && c <= 6 && (r == 0 || r == 6)) ||
                        (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            }
        }
    }
    setupPositionAdjustPattern() {
        const { typeNumber, modules } = this;
        const pos = Util.getPatternPosition(typeNumber);
        const { length } = pos;
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
                const row = pos[i];
                const col = pos[j];
                if (modules[row][col] != null)
                    continue;
                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        modules[row + r][col + c] =
                            r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0);
                    }
                }
            }
        }
    }
    setupTimingPattern() {
        const { moduleCount, modules } = this;
        const count = moduleCount - 8;
        for (let r = 8; r < count; r++) {
            if (modules[r][6] != null)
                continue;
            modules[r][6] = r % 2 == 0;
        }
        for (let c = 8; c < count; c++) {
            if (modules[6][c] != null)
                continue;
            modules[6][c] = c % 2 == 0;
        }
    }
    setupTypeInfo(test, maskPattern) {
        const { errorCorrectLevel, modules, moduleCount } = this;
        const data = (errorCorrectLevel << 3) | maskPattern;
        const bits = Util.getBCHTypeInfo(data);
        // vertical
        for (let i = 0; i < 15; i++) {
            const mod = !test && ((bits >> i) & 1) == 1;
            if (i < 6) {
                modules[i][8] = mod;
            }
            else if (i < 8) {
                modules[i + 1][8] = mod;
            }
            else {
                modules[moduleCount - 15 + i][8] = mod;
            }
        }
        // horizontal
        for (let i = 0; i < 15; i++) {
            const mod = !test && ((bits >> i) & 1) == 1;
            if (i < 8) {
                modules[8][moduleCount - i - 1] = mod;
            }
            else if (i < 9) {
                modules[8][15 - i] = mod;
            }
            else {
                modules[8][15 - i - 1] = mod;
            }
        }
        // fixed module
        modules[moduleCount - 8][8] = !test;
    }
    getBestMaskPattern() {
        let minLostPoint = 0;
        let pattern = 0;
        for (let i = 0; i < 8; i++) {
            this.makeImpl(true, i);
            const lostPoint = Util.getLostPoint(this);
            if (i == 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                pattern = i;
            }
        }
        return pattern;
    }
    setupTypeNumber(test) {
        const { typeNumber, modules, moduleCount } = this;
        const bits = Util.getBCHTypeNumber(typeNumber);
        for (let i = 0; i < 18; i++) {
            const mod = !test && ((bits >> i) & 1) == 1;
            modules[~~(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod;
            modules[(i % 3) + moduleCount - 8 - 3][~~(i / 3)] = mod;
        }
    }
    createData(typeNumber, errorCorrectLevel, dataList) {
        const rsBlocks = new RSBlock().getRSBlocks(typeNumber, errorCorrectLevel);
        const buffer = new BitBuffer();
        for (let i = 0; i < dataList.length; i++) {
            const data = dataList[i];
            buffer.put(data.mode, 4);
            buffer.put(data.length, Util.getLengthInBits(data.mode, typeNumber));
            data.write(buffer);
        }
        // calc num max data.
        let totalDataCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
        }
        const totalCount = totalDataCount * 8;
        if (buffer.lengthInBits > totalCount) {
            throw new Error(`code length overflow. (${buffer.lengthInBits} > ${totalCount})`);
        }
        // end code
        if (buffer.lengthInBits + 4 <= totalCount) {
            buffer.put(0, 4);
        }
        // padding
        while (buffer.lengthInBits % 8 != 0) {
            buffer.putBit(false);
        }
        // padding
        while (true) {
            if (buffer.lengthInBits >= totalCount) {
                break;
            }
            buffer.put(PAD0, 8);
            if (buffer.lengthInBits >= totalCount) {
                break;
            }
            buffer.put(PAD1, 8);
        }
        return this.createBytes(buffer, rsBlocks);
    }
    mapData(data, maskPattern) {
        const { modules, moduleCount } = this;
        const maskFunc = Util.getMaskFunction(maskPattern);
        let inc = -1;
        let row = moduleCount - 1;
        let bitIndex = 7;
        let byteIndex = 0;
        for (let col = row; col > 0; col -= 2) {
            if (col == 6)
                col -= 1;
            while (true) {
                for (let c = 0; c < 2; c++) {
                    if (modules[row][col - c] == null) {
                        let dark = false;
                        if (byteIndex < data.length) {
                            dark = ((data[byteIndex] >>> bitIndex) & 1) == 1;
                        }
                        if (maskFunc(row, col - c)) {
                            dark = !dark;
                        }
                        modules[row][col - c] = dark;
                        bitIndex--;
                        if (bitIndex == -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }
                row += inc;
                if (row < 0 || moduleCount <= row) {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }
        }
    }
    createBytes(bitBuffer, rsBlocks) {
        const dcdata = [];
        const ecdata = [];
        let offset = 0;
        let maxDcCount = 0;
        let maxEcCount = 0;
        for (let r = 0; r < rsBlocks.length; r++) {
            const dcCount = rsBlocks[r].dataCount;
            const ecCount = rsBlocks[r].totalCount - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = [];
            for (let i = 0; i < dcCount; i++) {
                dcdata[r][i] = 0xff & bitBuffer.buffer[i + offset];
            }
            offset += dcCount;
            const rsPoly = Util.getErrorCorrectPolynomial(ecCount);
            const rawPoly = new Polynomial(dcdata[r], rsPoly.length - 1);
            const modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.length - 1);
            for (let i = 0; i < ecdata[r].length; i++) {
                const modIndex = i + modPoly.length - ecdata[r].length;
                ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
            }
        }
        let totalCodeCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) {
            totalCodeCount += rsBlocks[i].totalCount;
        }
        const data = new Array(totalCodeCount);
        let index = 0;
        for (let i = 0; i < maxDcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < dcdata[r].length) {
                    data[index++] = dcdata[r][i];
                }
            }
        }
        for (let i = 0; i < maxEcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < ecdata[r].length) {
                    data[index++] = ecdata[r][i];
                }
            }
        }
        return data;
    }
    isDark(row, col) {
        const { moduleCount } = this;
        if (row < 0 || moduleCount <= row || col < 0 || moduleCount <= col) {
            throw new Error(`${row}, ${col}`);
        }
        return this.modules[row][col];
    }
    addData(data) {
        this.dataList.push(new BitByte(data));
        this.dataCache = null;
    }
    getModuleCount() {
        return this.moduleCount;
    }
    make() {
        this.makeImpl(false, this.getBestMaskPattern());
    }
}

class BitOutputStream {
    out;
    bit = 0;
    bitlen = 0;
    constructor(out) {
        this.out = out;
    }
    write(data, length) {
        if (data >>> length != 0) {
            throw new Error('length over');
        }
        while (this.bitlen + length >= 8) {
            this.out.writeByte(0xff & ((data << this.bitlen) | this.bit));
            length -= 8 - this.bitlen;
            data >>>= 8 - this.bitlen;
            this.bit = this.bitlen = 0;
        }
        this.bit = (data << this.bitlen) | this.bit;
        this.bitlen += length;
    }
    flush() {
        if (this.bitlen > 0) {
            this.out.writeByte(this.bit);
        }
    }
}

// ---------------------------------------------------------------------
// byteArrayOutputStream
// ---------------------------------------------------------------------
class ByteArrayOutputStream {
    bytes = [];
    writeByte(byte) {
        this.bytes.push(byte & 0xff);
    }
    writeBytes(bytes, offset, length) {
        const off = offset || 0;
        const len = length || bytes.length;
        for (let i = 0; i < len; i++) {
            this.writeByte(bytes[i + off]);
        }
    }
    writeShort(i) {
        this.writeByte(i);
        this.writeByte(i >>> 8);
    }
    writeString(s) {
        for (let i = 0; i < s.length; i++) {
            this.writeByte(s.charCodeAt(i));
        }
    }
    toByteArray() {
        return this.bytes;
    }
    toString() {
        return `[${this.bytes.join(',')}]`;
    }
}

// ---------------------------------------------------------------------
// LZWTable
// ---------------------------------------------------------------------
class LZWTable {
    map = {};
    mapSize = 0;
    get size() {
        return this.mapSize;
    }
    add(key) {
        if (this.contains(key)) {
            throw new Error(`dup key: ${key}`);
        }
        this.map[key] = this.mapSize;
        this.mapSize++;
    }
    indexOf(key) {
        return this.map[key] ?? -1;
    }
    contains(key) {
        return this.map[key] != undefined;
    }
}

// ---------------------------------------------------------------------
// base64EncodeOutputStream
// ---------------------------------------------------------------------
class Base64EncodeOutputStream {
    buffer = 0;
    buflen = 0;
    length = 0;
    base64 = '';
    encode(n) {
        if (n < 26) {
            return 0x41 + n;
        }
        if (n < 52) {
            return 0x61 + (n - 26);
        }
        if (n < 62) {
            return 0x30 + (n - 52);
        }
        if (n == 62) {
            return 0x2b;
        }
        if (n == 63) {
            return 0x2f;
        }
        throw new Error(`n: ${n}`);
    }
    writeEncoded(b) {
        this.base64 += String.fromCharCode(this.encode(b & 0x3f));
    }
    writeByte(n) {
        this.buffer = (this.buffer << 8) | (n & 0xff);
        this.buflen += 8;
        this.length += 1;
        while (this.buflen >= 6) {
            this.buflen -= 6;
            this.writeEncoded(this.buffer >>> this.buflen);
        }
    }
    flush() {
        const { buffer, buflen, length } = this;
        if (buflen > 0) {
            this.writeEncoded(buffer << (6 - buflen));
            this.buffer = 0;
            this.buflen = 0;
        }
        if (length % 3 != 0) {
            // padding
            const padlen = 3 - (length % 3);
            for (let i = 0; i < padlen; i++) {
                this.base64 += '=';
            }
        }
    }
    toString() {
        return this.base64;
    }
}

// ---------------------------------------------------------------------
// gifImage (B/W)
// ---------------------------------------------------------------------
class GifImage {
    width;
    height;
    data = [];
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    getLZWRaster(lzwMinCodeSize) {
        const { data } = this;
        const clearCode = 1 << lzwMinCodeSize;
        const endCode = clearCode + 1;
        let bitLength = lzwMinCodeSize + 1;
        // Setup LZWTable
        const table = new LZWTable();
        const fromCharCode = (i) => String.fromCharCode(i);
        for (let i = 0; i < clearCode; i += 1) {
            table.add(fromCharCode(i));
        }
        table.add(fromCharCode(clearCode));
        table.add(fromCharCode(endCode));
        const byteOut = new ByteArrayOutputStream();
        const bitOut = new BitOutputStream(byteOut);
        // clear code
        bitOut.write(clearCode, bitLength);
        let dataIndex = 0;
        let s = fromCharCode(data[dataIndex++]);
        while (dataIndex < data.length) {
            const c = fromCharCode(data[dataIndex++]);
            if (table.contains(s + c)) {
                s += c;
            }
            else {
                bitOut.write(table.indexOf(s), bitLength);
                if (table.size < 0xfff) {
                    if (table.size == 1 << bitLength) {
                        bitLength++;
                    }
                    table.add(s + c);
                }
                s = c;
            }
        }
        bitOut.write(table.indexOf(s), bitLength);
        // end code
        bitOut.write(endCode, bitLength);
        bitOut.flush();
        return byteOut.toByteArray();
    }
    setPixel(x, y, pixel) {
        this.data[y * this.width + x] = pixel;
    }
    write(out, blackColor = "#000000", whiteColor = "#ffffff") {
        const { width, height } = this;
        // ---------------------------------
        // GIF Signature
        out.writeString("GIF87a");
        // ---------------------------------
        // Screen Descriptor
        out.writeShort(width);
        out.writeShort(height);
        out.writeByte(0x80); // 2bit
        out.writeByte(0);
        out.writeByte(0);
        // ---------------------------------
        // Global Color Map
        const black = blackColor.split("");
        // black
        out.writeByte(parseInt(`${black[1]}${black[2]}`, 16));
        out.writeByte(parseInt(`${black[3]}${black[4]}`, 16));
        out.writeByte(parseInt(`${black[5]}${black[6]}`, 16));
        const white = whiteColor.split("");
        // white
        out.writeByte(parseInt(`${white[1]}${white[2]}`, 16));
        out.writeByte(parseInt(`${white[3]}${white[4]}`, 16));
        out.writeByte(parseInt(`${white[5]}${white[6]}`, 16));
        // ---------------------------------
        // Image Descriptor
        out.writeString(",");
        out.writeShort(0);
        out.writeShort(0);
        out.writeShort(width);
        out.writeShort(height);
        out.writeByte(0);
        // ---------------------------------
        // Local Color Map
        // ---------------------------------
        // Raster Data
        const lzwMinCodeSize = 2;
        const raster = this.getLZWRaster(lzwMinCodeSize);
        out.writeByte(lzwMinCodeSize);
        let offset = 0;
        while (raster.length - offset > 255) {
            out.writeByte(255);
            out.writeBytes(raster, offset, 255);
            offset += 255;
        }
        const byte = raster.length - offset;
        out.writeByte(byte);
        out.writeBytes(raster, offset, byte);
        out.writeByte(0);
        // ---------------------------------
        // GIF Terminator
        out.writeString(";");
    }
}
function createGifTag(width, height, getPixel, black, white) {
    const gif = new GifImage(width, height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            gif.setPixel(x, y, getPixel(x, y));
        }
    }
    const b = new ByteArrayOutputStream();
    gif.write(b, black, white);
    const base64 = new Base64EncodeOutputStream();
    const bytes = b.toByteArray();
    for (let i = 0; i < bytes.length; i++) {
        base64.writeByte(bytes[i]);
    }
    base64.flush();
    return `data:image/gif;base64,${base64}`;
}

// DEFLATE is a complex format; to read this code, you should probably check the RFC first:
// https://tools.ietf.org/html/rfc1951
// You may also wish to take a look at the guide I made about this program:
// https://gist.github.com/101arrowz/253f31eb5abc3d9275ab943003ffecad
// Some of the following code is similar to that of UZIP.js:
// https://github.com/photopea/UZIP.js
// However, the vast majority of the codebase has diverged from UZIP.js to increase performance and reduce bundle size.
// Sometimes 0 will appear where -1 would be more appropriate. This is because using a uint
// is better for memory in most engines (I *think*).

// aliases for shorter compressed code (most minifers don't do this)
var u8 = Uint8Array, u16 = Uint16Array, i32 = Int32Array;
// fixed length extra bits
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
// fixed distance extra bits
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
// code length index map
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
// get base, reverse index map from extra bits
var freb = function (eb, start) {
    var b = new u16(31);
    for (var i = 0; i < 31; ++i) {
        b[i] = start += 1 << eb[i - 1];
    }
    // numbers here are at max 18 bits
    var r = new i32(b[30]);
    for (var i = 1; i < 30; ++i) {
        for (var j = b[i]; j < b[i + 1]; ++j) {
            r[j] = ((j - b[i]) << 5) | i;
        }
    }
    return { b: b, r: r };
};
var _a = freb(fleb, 2), fl = _a.b, revfl = _a.r;
// we can ignore the fact that the other numbers are wrong; they never happen anyway
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0), revfd = _b.r;
// map of value to reverse (assuming 16 bits)
var rev = new u16(32768);
for (var i = 0; i < 32768; ++i) {
    // reverse table algorithm from SO
    var x = ((i & 0xAAAA) >> 1) | ((i & 0x5555) << 1);
    x = ((x & 0xCCCC) >> 2) | ((x & 0x3333) << 2);
    x = ((x & 0xF0F0) >> 4) | ((x & 0x0F0F) << 4);
    rev[i] = (((x & 0xFF00) >> 8) | ((x & 0x00FF) << 8)) >> 1;
}
// create huffman tree from u8 "map": index -> code length for code index
// mb (max bits) must be at most 15
// TODO: optimize/split up?
var hMap = (function (cd, mb, r) {
    var s = cd.length;
    // index
    var i = 0;
    // u16 "map": index -> # of codes with bit length = index
    var l = new u16(mb);
    // length of cd must be 288 (total # of codes)
    for (; i < s; ++i) {
        if (cd[i])
            ++l[cd[i] - 1];
    }
    // u16 "map": index -> minimum code for bit length = index
    var le = new u16(mb);
    for (i = 1; i < mb; ++i) {
        le[i] = (le[i - 1] + l[i - 1]) << 1;
    }
    var co;
    if (r) {
        // u16 "map": index -> number of actual bits, symbol for code
        co = new u16(1 << mb);
        // bits to remove for reverser
        var rvb = 15 - mb;
        for (i = 0; i < s; ++i) {
            // ignore 0 lengths
            if (cd[i]) {
                // num encoding both symbol and bits read
                var sv = (i << 4) | cd[i];
                // free bits
                var r_1 = mb - cd[i];
                // start value
                var v = le[cd[i] - 1]++ << r_1;
                // m is end value
                for (var m = v | ((1 << r_1) - 1); v <= m; ++v) {
                    // every 16 bit value starting with the code yields the same result
                    co[rev[v] >> rvb] = sv;
                }
            }
        }
    }
    else {
        co = new u16(s);
        for (i = 0; i < s; ++i) {
            if (cd[i]) {
                co[i] = rev[le[cd[i] - 1]++] >> (15 - cd[i]);
            }
        }
    }
    return co;
});
// fixed length tree
var flt = new u8(288);
for (var i = 0; i < 144; ++i)
    flt[i] = 8;
for (var i = 144; i < 256; ++i)
    flt[i] = 9;
for (var i = 256; i < 280; ++i)
    flt[i] = 7;
for (var i = 280; i < 288; ++i)
    flt[i] = 8;
// fixed distance tree
var fdt = new u8(32);
for (var i = 0; i < 32; ++i)
    fdt[i] = 5;
// fixed length map
var flm = /*#__PURE__*/ hMap(flt, 9, 0);
// fixed distance map
var fdm = /*#__PURE__*/ hMap(fdt, 5, 0);
// get end of byte
var shft = function (p) { return ((p + 7) / 8) | 0; };
// typed array slice - allows garbage collector to free original reference,
// while being more compatible than .slice
var slc = function (v, s, e) {
    if (e == null || e > v.length)
        e = v.length;
    // can't use .constructor in case user-supplied
    return new u8(v.subarray(s, e));
};
// starting at p, write the minimum number of bits that can hold v to d
var wbits = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
};
// starting at p, write the minimum number of bits (>8) that can hold v to d
var wbits16 = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
    d[o + 2] |= v >> 16;
};
// creates code lengths from a frequency table
var hTree = function (d, mb) {
    // Need extra info to make a tree
    var t = [];
    for (var i = 0; i < d.length; ++i) {
        if (d[i])
            t.push({ s: i, f: d[i] });
    }
    var s = t.length;
    var t2 = t.slice();
    if (!s)
        return { t: et, l: 0 };
    if (s == 1) {
        var v = new u8(t[0].s + 1);
        v[t[0].s] = 1;
        return { t: v, l: 1 };
    }
    t.sort(function (a, b) { return a.f - b.f; });
    // after i2 reaches last ind, will be stopped
    // freq must be greater than largest possible number of symbols
    t.push({ s: -1, f: 25001 });
    var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
    t[0] = { s: -1, f: l.f + r.f, l: l, r: r };
    // efficient algorithm from UZIP.js
    // i0 is lookbehind, i2 is lookahead - after processing two low-freq
    // symbols that combined have high freq, will start processing i2 (high-freq,
    // non-composite) symbols instead
    // see https://reddit.com/r/photopea/comments/ikekht/uzipjs_questions/
    while (i1 != s - 1) {
        l = t[t[i0].f < t[i2].f ? i0++ : i2++];
        r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
        t[i1++] = { s: -1, f: l.f + r.f, l: l, r: r };
    }
    var maxSym = t2[0].s;
    for (var i = 1; i < s; ++i) {
        if (t2[i].s > maxSym)
            maxSym = t2[i].s;
    }
    // code lengths
    var tr = new u16(maxSym + 1);
    // max bits in tree
    var mbt = ln(t[i1 - 1], tr, 0);
    if (mbt > mb) {
        // more algorithms from UZIP.js
        // TODO: find out how this code works (debt)
        //  ind    debt
        var i = 0, dt = 0;
        //    left            cost
        var lft = mbt - mb, cst = 1 << lft;
        t2.sort(function (a, b) { return tr[b.s] - tr[a.s] || a.f - b.f; });
        for (; i < s; ++i) {
            var i2_1 = t2[i].s;
            if (tr[i2_1] > mb) {
                dt += cst - (1 << (mbt - tr[i2_1]));
                tr[i2_1] = mb;
            }
            else
                break;
        }
        dt >>= lft;
        while (dt > 0) {
            var i2_2 = t2[i].s;
            if (tr[i2_2] < mb)
                dt -= 1 << (mb - tr[i2_2]++ - 1);
            else
                ++i;
        }
        for (; i >= 0 && dt; --i) {
            var i2_3 = t2[i].s;
            if (tr[i2_3] == mb) {
                --tr[i2_3];
                ++dt;
            }
        }
        mbt = mb;
    }
    return { t: new u8(tr), l: mbt };
};
// get the max length and assign length codes
var ln = function (n, l, d) {
    return n.s == -1
        ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1))
        : (l[n.s] = d);
};
// length codes generation
var lc = function (c) {
    var s = c.length;
    // Note that the semicolon was intentional
    while (s && !c[--s])
        ;
    var cl = new u16(++s);
    //  ind      num         streak
    var cli = 0, cln = c[0], cls = 1;
    var w = function (v) { cl[cli++] = v; };
    for (var i = 1; i <= s; ++i) {
        if (c[i] == cln && i != s)
            ++cls;
        else {
            if (!cln && cls > 2) {
                for (; cls > 138; cls -= 138)
                    w(32754);
                if (cls > 2) {
                    w(cls > 10 ? ((cls - 11) << 5) | 28690 : ((cls - 3) << 5) | 12305);
                    cls = 0;
                }
            }
            else if (cls > 3) {
                w(cln), --cls;
                for (; cls > 6; cls -= 6)
                    w(8304);
                if (cls > 2)
                    w(((cls - 3) << 5) | 8208), cls = 0;
            }
            while (cls--)
                w(cln);
            cls = 1;
            cln = c[i];
        }
    }
    return { c: cl.subarray(0, cli), n: s };
};
// calculate the length of output from tree, code lengths
var clen = function (cf, cl) {
    var l = 0;
    for (var i = 0; i < cl.length; ++i)
        l += cf[i] * cl[i];
    return l;
};
// writes a fixed block
// returns the new bit pos
var wfblk = function (out, pos, dat) {
    // no need to write 00 as type: TypedArray defaults to 0
    var s = dat.length;
    var o = shft(pos + 2);
    out[o] = s & 255;
    out[o + 1] = s >> 8;
    out[o + 2] = out[o] ^ 255;
    out[o + 3] = out[o + 1] ^ 255;
    for (var i = 0; i < s; ++i)
        out[o + i + 4] = dat[i];
    return (o + 4 + s) * 8;
};
// writes a block
var wblk = function (dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
    wbits(out, p++, final);
    ++lf[256];
    var _a = hTree(lf, 15), dlt = _a.t, mlb = _a.l;
    var _b = hTree(df, 15), ddt = _b.t, mdb = _b.l;
    var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
    var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
    var lcfreq = new u16(19);
    for (var i = 0; i < lclt.length; ++i)
        ++lcfreq[lclt[i] & 31];
    for (var i = 0; i < lcdt.length; ++i)
        ++lcfreq[lcdt[i] & 31];
    var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
    var nlcc = 19;
    for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
        ;
    var flen = (bl + 5) << 3;
    var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
    var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
    if (bs >= 0 && flen <= ftlen && flen <= dtlen)
        return wfblk(out, p, dat.subarray(bs, bs + bl));
    var lm, ll, dm, dl;
    wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
    if (dtlen < ftlen) {
        lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
        var llm = hMap(lct, mlcb, 0);
        wbits(out, p, nlc - 257);
        wbits(out, p + 5, ndc - 1);
        wbits(out, p + 10, nlcc - 4);
        p += 14;
        for (var i = 0; i < nlcc; ++i)
            wbits(out, p + 3 * i, lct[clim[i]]);
        p += 3 * nlcc;
        var lcts = [lclt, lcdt];
        for (var it = 0; it < 2; ++it) {
            var clct = lcts[it];
            for (var i = 0; i < clct.length; ++i) {
                var len = clct[i] & 31;
                wbits(out, p, llm[len]), p += lct[len];
                if (len > 15)
                    wbits(out, p, (clct[i] >> 5) & 127), p += clct[i] >> 12;
            }
        }
    }
    else {
        lm = flm, ll = flt, dm = fdm, dl = fdt;
    }
    for (var i = 0; i < li; ++i) {
        var sym = syms[i];
        if (sym > 255) {
            var len = (sym >> 18) & 31;
            wbits16(out, p, lm[len + 257]), p += ll[len + 257];
            if (len > 7)
                wbits(out, p, (sym >> 23) & 31), p += fleb[len];
            var dst = sym & 31;
            wbits16(out, p, dm[dst]), p += dl[dst];
            if (dst > 3)
                wbits16(out, p, (sym >> 5) & 8191), p += fdeb[dst];
        }
        else {
            wbits16(out, p, lm[sym]), p += ll[sym];
        }
    }
    wbits16(out, p, lm[256]);
    return p + ll[256];
};
// deflate options (nice << 13) | chain
var deo = /*#__PURE__*/ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
// empty
var et = /*#__PURE__*/ new u8(0);
// compresses data into a raw DEFLATE buffer
var dflt = function (dat, lvl, plvl, pre, post, st) {
    var s = st.z || dat.length;
    var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7000)) + post);
    // writing to this writes to the output buffer
    var w = o.subarray(pre, o.length - post);
    var lst = st.l;
    var pos = (st.r || 0) & 7;
    if (lvl) {
        if (pos)
            w[0] = st.r >> 3;
        var opt = deo[lvl - 1];
        var n = opt >> 13, c = opt & 8191;
        var msk_1 = (1 << plvl) - 1;
        //    prev 2-byte val map    curr 2-byte val map
        var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
        var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
        var hsh = function (i) { return (dat[i] ^ (dat[i + 1] << bs1_1) ^ (dat[i + 2] << bs2_1)) & msk_1; };
        // 24576 is an arbitrary number of maximum symbols per block
        // 424 buffer for last block
        var syms = new i32(25000);
        // length/literal freq   distance freq
        var lf = new u16(288), df = new u16(32);
        //  l/lcnt  exbits  index          l/lind  waitdx          blkpos
        var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
        for (; i + 2 < s; ++i) {
            // hash value
            var hv = hsh(i);
            // index mod 32768    previous index mod
            var imod = i & 32767, pimod = head[hv];
            prev[imod] = pimod;
            head[hv] = imod;
            // We always should modify head and prev, but only add symbols if
            // this data is not yet processed ("wait" for wait index)
            if (wi <= i) {
                // bytes remaining
                var rem = s - i;
                if ((lc_1 > 7000 || li > 24576) && (rem > 423 || !lst)) {
                    pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
                    li = lc_1 = eb = 0, bs = i;
                    for (var j = 0; j < 286; ++j)
                        lf[j] = 0;
                    for (var j = 0; j < 30; ++j)
                        df[j] = 0;
                }
                //  len    dist   chain
                var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
                if (rem > 2 && hv == hsh(i - dif)) {
                    var maxn = Math.min(n, rem) - 1;
                    var maxd = Math.min(32767, i);
                    // max possible length
                    // not capped at dif because decompressors implement "rolling" index population
                    var ml = Math.min(258, rem);
                    while (dif <= maxd && --ch_1 && imod != pimod) {
                        if (dat[i + l] == dat[i + l - dif]) {
                            var nl = 0;
                            for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                                ;
                            if (nl > l) {
                                l = nl, d = dif;
                                // break out early when we reach "nice" (we are satisfied enough)
                                if (nl > maxn)
                                    break;
                                // now, find the rarest 2-byte sequence within this
                                // length of literals and search for that instead.
                                // Much faster than just using the start
                                var mmd = Math.min(dif, nl - 2);
                                var md = 0;
                                for (var j = 0; j < mmd; ++j) {
                                    var ti = i - dif + j & 32767;
                                    var pti = prev[ti];
                                    var cd = ti - pti & 32767;
                                    if (cd > md)
                                        md = cd, pimod = ti;
                                }
                            }
                        }
                        // check the previous match
                        imod = pimod, pimod = prev[imod];
                        dif += imod - pimod & 32767;
                    }
                }
                // d will be nonzero only when a match was found
                if (d) {
                    // store both dist and len data in one int32
                    // Make sure this is recognized as a len/dist with 28th bit (2^28)
                    syms[li++] = 268435456 | (revfl[l] << 18) | revfd[d];
                    var lin = revfl[l] & 31, din = revfd[d] & 31;
                    eb += fleb[lin] + fdeb[din];
                    ++lf[257 + lin];
                    ++df[din];
                    wi = i + l;
                    ++lc_1;
                }
                else {
                    syms[li++] = dat[i];
                    ++lf[dat[i]];
                }
            }
        }
        for (i = Math.max(i, wi); i < s; ++i) {
            syms[li++] = dat[i];
            ++lf[dat[i]];
        }
        pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
        if (!lst) {
            st.r = (pos & 7) | w[(pos / 8) | 0] << 3;
            // shft(pos) now 1 less if pos & 7 != 0
            pos -= 7;
            st.h = head, st.p = prev, st.i = i, st.w = wi;
        }
    }
    else {
        for (var i = st.w || 0; i < s + lst; i += 65535) {
            // end
            var e = i + 65535;
            if (e >= s) {
                // write final block
                w[(pos / 8) | 0] = lst;
                e = s;
            }
            pos = wfblk(w, pos + 1, dat.subarray(i, e));
        }
        st.i = s;
    }
    return slc(o, 0, pre + shft(pos) + post);
};
// Adler32
var adler = function () {
    var a = 1, b = 0;
    return {
        p: function (d) {
            // closures have awful performance
            var n = a, m = b;
            var l = d.length | 0;
            for (var i = 0; i != l;) {
                var e = Math.min(i + 2655, l);
                for (; i < e; ++i)
                    m += n += d[i];
                n = (n & 65535) + 15 * (n >> 16), m = (m & 65535) + 15 * (m >> 16);
            }
            a = n, b = m;
        },
        d: function () {
            a %= 65521, b %= 65521;
            return (a & 255) << 24 | (a & 0xFF00) << 8 | (b & 255) << 8 | (b >> 8);
        }
    };
};
// deflate with opts
var dopt = function (dat, opt, pre, post, st) {
    if (!st) {
        st = { l: 1 };
        if (opt.dictionary) {
            var dict = opt.dictionary.subarray(-32768);
            var newDat = new u8(dict.length + dat.length);
            newDat.set(dict);
            newDat.set(dat, dict.length);
            dat = newDat;
            st.w = dict.length;
        }
    }
    return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? (st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20) : (12 + opt.mem), pre, post, st);
};
// write bytes
var wbytes = function (d, b, v) {
    for (; v; ++b)
        d[b] = v, v >>>= 8;
};
// zlib header
var zlh = function (c, o) {
    var lv = o.level, fl = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
    c[0] = 120, c[1] = (fl << 6) | (o.dictionary && 32);
    c[1] |= 31 - ((c[0] << 8) | c[1]) % 31;
    if (o.dictionary) {
        var h = adler();
        h.p(o.dictionary);
        wbytes(c, 2, h.d());
    }
};
/**
 * Compress data with Zlib
 * @param data The data to compress
 * @param opts The compression options
 * @returns The zlib-compressed version of the data
 */
function zlibSync(data, opts) {
    if (!opts)
        opts = {};
    var a = adler();
    a.p(data);
    var d = dopt(data, opts, opts.dictionary ? 6 : 2, 4);
    return zlh(d, opts), wbytes(d, d.length - 4, a.d()), d;
}
// text decoder
var td = typeof TextDecoder != 'undefined' && /*#__PURE__*/ new TextDecoder();
// text decoder stream
var tds = 0;
try {
    td.decode(et, { stream: true });
    tds = 1;
}
catch (e) { }

var crc32 = {};

/*! crc32.js (C) 2014-present SheetJS -- http://sheetjs.com */

var hasRequiredCrc32;

function requireCrc32 () {
	if (hasRequiredCrc32) return crc32;
	hasRequiredCrc32 = 1;
	(function (exports) {
		(function (factory) {
			/*jshint ignore:start */
			/*eslint-disable */
			if(typeof DO_NOT_EXPORT_CRC === 'undefined') {
				{
					factory(exports);
				}
			} else {
				factory({});
			}
			/*eslint-enable */
			/*jshint ignore:end */
		}(function(CRC32) {
		CRC32.version = '1.2.2';
		/*global Int32Array */
		function signed_crc_table() {
			var c = 0, table = new Array(256);

			for(var n =0; n != 256; ++n){
				c = n;
				c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
				c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
				c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
				c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
				c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
				c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
				c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
				c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
				table[n] = c;
			}

			return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
		}

		var T0 = signed_crc_table();
		function slice_by_16_tables(T) {
			var c = 0, v = 0, n = 0, table = typeof Int32Array !== 'undefined' ? new Int32Array(4096) : new Array(4096) ;

			for(n = 0; n != 256; ++n) table[n] = T[n];
			for(n = 0; n != 256; ++n) {
				v = T[n];
				for(c = 256 + n; c < 4096; c += 256) v = table[c] = (v >>> 8) ^ T[v & 0xFF];
			}
			var out = [];
			for(n = 1; n != 16; ++n) out[n - 1] = typeof Int32Array !== 'undefined' ? table.subarray(n * 256, n * 256 + 256) : table.slice(n * 256, n * 256 + 256);
			return out;
		}
		var TT = slice_by_16_tables(T0);
		var T1 = TT[0],  T2 = TT[1],  T3 = TT[2],  T4 = TT[3],  T5 = TT[4];
		var T6 = TT[5],  T7 = TT[6],  T8 = TT[7],  T9 = TT[8],  Ta = TT[9];
		var Tb = TT[10], Tc = TT[11], Td = TT[12], Te = TT[13], Tf = TT[14];
		function crc32_bstr(bstr, seed) {
			var C = seed ^ -1;
			for(var i = 0, L = bstr.length; i < L;) C = (C>>>8) ^ T0[(C^bstr.charCodeAt(i++))&0xFF];
			return ~C;
		}

		function crc32_buf(B, seed) {
			var C = seed ^ -1, L = B.length - 15, i = 0;
			for(; i < L;) C =
				Tf[B[i++] ^ (C & 255)] ^
				Te[B[i++] ^ ((C >> 8) & 255)] ^
				Td[B[i++] ^ ((C >> 16) & 255)] ^
				Tc[B[i++] ^ (C >>> 24)] ^
				Tb[B[i++]] ^ Ta[B[i++]] ^ T9[B[i++]] ^ T8[B[i++]] ^
				T7[B[i++]] ^ T6[B[i++]] ^ T5[B[i++]] ^ T4[B[i++]] ^
				T3[B[i++]] ^ T2[B[i++]] ^ T1[B[i++]] ^ T0[B[i++]];
			L += 15;
			while(i < L) C = (C>>>8) ^ T0[(C^B[i++])&0xFF];
			return ~C;
		}

		function crc32_str(str, seed) {
			var C = seed ^ -1;
			for(var i = 0, L = str.length, c = 0, d = 0; i < L;) {
				c = str.charCodeAt(i++);
				if(c < 0x80) {
					C = (C>>>8) ^ T0[(C^c)&0xFF];
				} else if(c < 0x800) {
					C = (C>>>8) ^ T0[(C ^ (192|((c>>6)&31)))&0xFF];
					C = (C>>>8) ^ T0[(C ^ (128|(c&63)))&0xFF];
				} else if(c >= 0xD800 && c < 0xE000) {
					c = (c&1023)+64; d = str.charCodeAt(i++)&1023;
					C = (C>>>8) ^ T0[(C ^ (240|((c>>8)&7)))&0xFF];
					C = (C>>>8) ^ T0[(C ^ (128|((c>>2)&63)))&0xFF];
					C = (C>>>8) ^ T0[(C ^ (128|((d>>6)&15)|((c&3)<<4)))&0xFF];
					C = (C>>>8) ^ T0[(C ^ (128|(d&63)))&0xFF];
				} else {
					C = (C>>>8) ^ T0[(C ^ (224|((c>>12)&15)))&0xFF];
					C = (C>>>8) ^ T0[(C ^ (128|((c>>6)&63)))&0xFF];
					C = (C>>>8) ^ T0[(C ^ (128|(c&63)))&0xFF];
				}
			}
			return ~C;
		}
		CRC32.table = T0;
		// $FlowIgnore
		CRC32.bstr = crc32_bstr;
		// $FlowIgnore
		CRC32.buf = crc32_buf;
		// $FlowIgnore
		CRC32.str = crc32_str;
		})); 
	} (crc32));
	return crc32;
}

var crc32Exports = requireCrc32();

// import { CRC32 } from "./CRC32";
class PngImage {
    width;
    height;
    data;
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Uint32Array(width * height);
    }
    toInt8(num) {
        const arr = new ArrayBuffer(1);
        const view = new DataView(arr);
        view.setUint8(0, num);
        return arr;
    }
    toInt32(num) {
        const arr = new ArrayBuffer(4);
        const view = new DataView(arr);
        view.setUint32(0, num, false);
        return arr;
    }
    addChunk(dataLength, chunkTypeBuffer, dataBuffer = []) {
        const chunkType = new Uint8Array(chunkTypeBuffer);
        return new Uint8Array([
            // Length
            ...new Uint8Array(this.toInt32(dataLength)),
            // ChunkType
            ...chunkType,
            // ChunkData
            ...dataBuffer,
            // CRC
            ...new Uint8Array(this.toInt32(crc32Exports.buf([...chunkType, ...dataBuffer]))),
        ]);
    }
    setPixel(x, y, pixel) {
        this.data[y * this.width + x] = pixel;
    }
    write(out) {
        const { width, height } = this;
        // ---------------------------------
        // PNG Signature
        const SIGNATURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
        // ---------------------------------
        // IHDR
        const IHDR = this.addChunk(
        // length
        13, 
        // chunkType
        [0x49, 0x48, 0x44, 0x52], new Uint8Array([
            // width
            ...new Uint8Array(this.toInt32(width)),
            // height
            ...new Uint8Array(this.toInt32(height)),
            // bitDepth
            ...new Uint8Array(this.toInt8(1)),
            // colorType
            ...new Uint8Array(this.toInt8(0)),
            // compression
            ...new Uint8Array(this.toInt8(0)),
            // filter
            ...new Uint8Array(this.toInt8(0)),
            // interlace
            ...new Uint8Array(this.toInt8(0)),
        ]));
        // out.writeBytes(IHDR);
        // ---------------------------------
        // IDAT
        const data = zlibSync(new Uint8Array(this.data.buffer));
        const IDAT = this.addChunk(data.length, [0x49, 0x44, 0x41, 0x54], data);
        // out.writeBytes(IDAT);
        // ---------------------------------
        // IEND
        const IEND = this.addChunk(0, [0x49, 0x45, 0x4e, 0x44]);
        // out.writeBytes(IEND);
        out.writeBytes(new Uint8Array([...SIGNATURE, ...IHDR, ...IDAT, ...IEND]));
    }
}
function createPngTag(width, height, getPixel) {
    const png = new PngImage(width, height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            png.setPixel(x, y, getPixel(x, y));
        }
    }
    const b = new ByteArrayOutputStream();
    png.write(b);
    const base64 = new Base64EncodeOutputStream();
    const bytes = b.toByteArray();
    for (let i = 0; i < bytes.length; i++) {
        base64.writeByte(bytes[i]);
    }
    base64.flush();
    return `data:image/png;base64,${base64}`;
}

// ---------------------------------------------------------------------
// returns qrcode function.
function parseOptions(options = {}) {
    const opts = { ...options };
    const typeNumber = opts.typeNumber ?? 4;
    const errorCorrectLevel = opts.errorCorrectLevel ?? "M";
    const size = opts.size ?? 500;
    const black = opts.black ?? "#000000FF";
    const white = opts.white ?? "#FFFFFFFF";
    return { typeNumber, errorCorrectLevel, size, black, white };
}
const calcCellSizeAndMargin = (moduleCount, size) => {
    const cellSize = ~~(size / moduleCount);
    return {
        margin: ~~((size - moduleCount * cellSize) / 2),
        cellSize: cellSize || 2,
    };
};
function createQRCodeToGIF(text, options) {
    const { typeNumber, errorCorrectLevel, size, black, white } = parseOptions(options);
    let qr;
    try {
        qr = new QRCode(typeNumber, errorCorrectLevel);
        qr.addData(text);
        qr.make();
    }
    catch (e) {
        if (typeNumber >= 40) {
            throw new Error("Text too long to encode");
        }
        return arguments.callee(text, {
            size,
            errorCorrectLevel,
            typeNumber: typeNumber + 1,
            black,
            white,
        });
    }
    // calc cellsize and margin
    const moduleCount = qr.getModuleCount();
    const { margin: min, cellSize } = calcCellSizeAndMargin(moduleCount, size);
    const max = moduleCount * cellSize + min;
    return createGifTag(size, size, (x, y) => {
        if (min <= x && x < max && min <= y && y < max) {
            const c = ~~((x - min) / cellSize);
            const r = ~~((y - min) / cellSize);
            return qr.isDark(r, c) ? 0 : 1;
        }
        return 1;
    }, black, white);
}
function createQRCodeToPNG(text, options) {
    const { typeNumber, errorCorrectLevel, size, black, white } = parseOptions(options);
    let qr;
    try {
        qr = new QRCode(typeNumber, errorCorrectLevel);
        qr.addData(text);
        qr.make();
    }
    catch (e) {
        if (typeNumber >= 40) {
            throw new Error("Text too long to encode");
        }
        return arguments.callee(text, {
            size,
            errorCorrectLevel,
            typeNumber: typeNumber + 1,
            black,
            white,
        });
    }
    // calc cellsize and margin
    const moduleCount = qr.getModuleCount();
    const { margin: min, cellSize } = calcCellSizeAndMargin(moduleCount, size);
    const max = moduleCount * cellSize + min;
    const BLACK = +black.replace("#", "0x");
    const WHITE = +white.replace("#", "0x");
    return createPngTag(size, size, (x, y) => {
        if (min <= x && x < max && min <= y && y < max) {
            const c = ~~((x - min) / cellSize);
            const r = ~~((y - min) / cellSize);
            return qr.isDark(r, c) ? BLACK : WHITE;
        }
        return WHITE;
    });
}
function createQRCodeToHTML(text, options) {
    const { typeNumber, errorCorrectLevel, size, black, white } = parseOptions(options);
    let qr;
    try {
        qr = new QRCode(typeNumber, errorCorrectLevel);
        qr.addData(text);
        qr.make();
    }
    catch (e) {
        if (typeNumber >= 40) {
            throw new Error("Text too long to encode");
        }
        return arguments.callee(text, {
            size,
            errorCorrectLevel,
            typeNumber: typeNumber + 1,
            black,
            white,
        });
    }
    // calc cellsize and margin
    const moduleCount = qr.getModuleCount();
    const { margin, cellSize } = calcCellSizeAndMargin(moduleCount, size);
    const commonStyle = "border-width: 0px; border-style: none; border-collapse: collapse; padding: 0px;";
    let qrHtml = `<table style="${commonStyle} margin: ${margin}px;"><tbody>`;
    for (let r = 0; r < moduleCount; r++) {
        qrHtml += "<tr>";
        for (let c = 0; c < moduleCount; c++) {
            qrHtml += `<td style="${commonStyle} margin: 0px; width: ${cellSize}px; height: ${cellSize}px; background-color: ${qr.isDark(r, c) ? "#000000" : "#ffffff"};"/>`;
        }
        qrHtml += "</tr>";
    }
    return qrHtml + "</tbody></table>";
}

export { GifImage, MovieEntity, PngImage, QRCode, createGifTag, createPngTag, createQRCodeToGIF, createQRCodeToHTML, createQRCodeToPNG };
//# sourceMappingURL=index.js.map
