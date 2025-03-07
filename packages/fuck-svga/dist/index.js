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
var u8$1 = Uint8Array, u16$1 = Uint16Array, i32$1 = Int32Array;
// fixed length extra bits
var fleb$1 = new u8$1([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
// fixed distance extra bits
var fdeb$1 = new u8$1([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
// code length index map
var clim = new u8$1([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
// get base, reverse index map from extra bits
var freb$1 = function (eb, start) {
    var b = new u16$1(31);
    for (var i = 0; i < 31; ++i) {
        b[i] = start += 1 << eb[i - 1];
    }
    // numbers here are at max 18 bits
    var r = new i32$1(b[30]);
    for (var i = 1; i < 30; ++i) {
        for (var j = b[i]; j < b[i + 1]; ++j) {
            r[j] = ((j - b[i]) << 5) | i;
        }
    }
    return { b: b, r: r };
};
var _a$1 = freb$1(fleb$1, 2), fl$1 = _a$1.b, revfl$1 = _a$1.r;
// we can ignore the fact that the other numbers are wrong; they never happen anyway
fl$1[28] = 258, revfl$1[258] = 28;
var _b = freb$1(fdeb$1, 0), fd = _b.b;
// map of value to reverse (assuming 16 bits)
var rev$1 = new u16$1(32768);
for (var i$1 = 0; i$1 < 32768; ++i$1) {
    // reverse table algorithm from SO
    var x$1 = ((i$1 & 0xAAAA) >> 1) | ((i$1 & 0x5555) << 1);
    x$1 = ((x$1 & 0xCCCC) >> 2) | ((x$1 & 0x3333) << 2);
    x$1 = ((x$1 & 0xF0F0) >> 4) | ((x$1 & 0x0F0F) << 4);
    rev$1[i$1] = (((x$1 & 0xFF00) >> 8) | ((x$1 & 0x00FF) << 8)) >> 1;
}
// create huffman tree from u8 "map": index -> code length for code index
// mb (max bits) must be at most 15
// TODO: optimize/split up?
var hMap = (function (cd, mb, r) {
    var s = cd.length;
    // index
    var i = 0;
    // u16 "map": index -> # of codes with bit length = index
    var l = new u16$1(mb);
    // length of cd must be 288 (total # of codes)
    for (; i < s; ++i) {
        if (cd[i])
            ++l[cd[i] - 1];
    }
    // u16 "map": index -> minimum code for bit length = index
    var le = new u16$1(mb);
    for (i = 1; i < mb; ++i) {
        le[i] = (le[i - 1] + l[i - 1]) << 1;
    }
    var co;
    if (r) {
        // u16 "map": index -> number of actual bits, symbol for code
        co = new u16$1(1 << mb);
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
                    co[rev$1[v] >> rvb] = sv;
                }
            }
        }
    }
    else {
        co = new u16$1(s);
        for (i = 0; i < s; ++i) {
            if (cd[i]) {
                co[i] = rev$1[le[cd[i] - 1]++] >> (15 - cd[i]);
            }
        }
    }
    return co;
});
// fixed length tree
var flt$1 = new u8$1(288);
for (var i$1 = 0; i$1 < 144; ++i$1)
    flt$1[i$1] = 8;
for (var i$1 = 144; i$1 < 256; ++i$1)
    flt$1[i$1] = 9;
for (var i$1 = 256; i$1 < 280; ++i$1)
    flt$1[i$1] = 7;
for (var i$1 = 280; i$1 < 288; ++i$1)
    flt$1[i$1] = 8;
// fixed distance tree
var fdt$1 = new u8$1(32);
for (var i$1 = 0; i$1 < 32; ++i$1)
    fdt$1[i$1] = 5;
// fixed length map
var flrm = /*#__PURE__*/ hMap(flt$1, 9, 1);
// fixed distance map
var fdrm = /*#__PURE__*/ hMap(fdt$1, 5, 1);
// find max of array
var max = function (a) {
    var m = a[0];
    for (var i = 1; i < a.length; ++i) {
        if (a[i] > m)
            m = a[i];
    }
    return m;
};
// read d, starting at bit p and mask with m
var bits = function (d, p, m) {
    var o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8)) >> (p & 7)) & m;
};
// read d, starting at bit p continuing for at least 16 bits
var bits16 = function (d, p) {
    var o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) >> (p & 7));
};
// get end of byte
var shft = function (p) { return ((p + 7) / 8) | 0; };
// typed array slice - allows garbage collector to free original reference,
// while being more compatible than .slice
var slc = function (v, s, e) {
    if (e == null || e > v.length)
        e = v.length;
    // can't use .constructor in case user-supplied
    return new u8$1(v.subarray(s, e));
};
// error codes
var ec = [
    'unexpected EOF',
    'invalid block type',
    'invalid length/literal',
    'invalid distance',
    'stream finished',
    'no stream handler',
    ,
    'no callback',
    'invalid UTF-8 data',
    'extra field too long',
    'date not in range 1980-2099',
    'filename too long',
    'stream finishing',
    'invalid zip data'
    // determined by unknown compression method
];
var err = function (ind, msg, nt) {
    var e = new Error(msg || ec[ind]);
    e.code = ind;
    if (Error.captureStackTrace)
        Error.captureStackTrace(e, err);
    if (!nt)
        throw e;
    return e;
};
// expands raw DEFLATE data
var inflt = function (dat, st, buf, dict) {
    // source length       dict length
    var sl = dat.length, dl = 0;
    if (!sl || st.f && !st.l)
        return buf || new u8$1(0);
    var noBuf = !buf;
    // have to estimate size
    var resize = noBuf || st.i != 2;
    // no state
    var noSt = st.i;
    // Assumes roughly 33% compression ratio average
    if (noBuf)
        buf = new u8$1(sl * 3);
    // ensure buffer can fit at least l elements
    var cbuf = function (l) {
        var bl = buf.length;
        // need to increase size to fit
        if (l > bl) {
            // Double or set to necessary, whichever is greater
            var nbuf = new u8$1(Math.max(bl * 2, l));
            nbuf.set(buf);
            buf = nbuf;
        }
    };
    //  last chunk         bitpos           bytes
    var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    // total bits
    var tbts = sl * 8;
    do {
        if (!lm) {
            // BFINAL - this is only 1 when last chunk is next
            final = bits(dat, pos, 1);
            // type: 0 = no compression, 1 = fixed huffman, 2 = dynamic huffman
            var type = bits(dat, pos + 1, 3);
            pos += 3;
            if (!type) {
                // go to end of byte boundary
                var s = shft(pos) + 4, l = dat[s - 4] | (dat[s - 3] << 8), t = s + l;
                if (t > sl) {
                    if (noSt)
                        err(0);
                    break;
                }
                // ensure size
                if (resize)
                    cbuf(bt + l);
                // Copy over uncompressed data
                buf.set(dat.subarray(s, t), bt);
                // Get new bitpos, update byte count
                st.b = bt += l, st.p = pos = t * 8, st.f = final;
                continue;
            }
            else if (type == 1)
                lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
            else if (type == 2) {
                //  literal                            lengths
                var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
                var tl = hLit + bits(dat, pos + 5, 31) + 1;
                pos += 14;
                // length+distance tree
                var ldt = new u8$1(tl);
                // code length tree
                var clt = new u8$1(19);
                for (var i = 0; i < hcLen; ++i) {
                    // use index map to get real code
                    clt[clim[i]] = bits(dat, pos + i * 3, 7);
                }
                pos += hcLen * 3;
                // code lengths bits
                var clb = max(clt), clbmsk = (1 << clb) - 1;
                // code lengths map
                var clm = hMap(clt, clb, 1);
                for (var i = 0; i < tl;) {
                    var r = clm[bits(dat, pos, clbmsk)];
                    // bits read
                    pos += r & 15;
                    // symbol
                    var s = r >> 4;
                    // code length to copy
                    if (s < 16) {
                        ldt[i++] = s;
                    }
                    else {
                        //  copy   count
                        var c = 0, n = 0;
                        if (s == 16)
                            n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
                        else if (s == 17)
                            n = 3 + bits(dat, pos, 7), pos += 3;
                        else if (s == 18)
                            n = 11 + bits(dat, pos, 127), pos += 7;
                        while (n--)
                            ldt[i++] = c;
                    }
                }
                //    length tree                 distance tree
                var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
                // max length bits
                lbt = max(lt);
                // max dist bits
                dbt = max(dt);
                lm = hMap(lt, lbt, 1);
                dm = hMap(dt, dbt, 1);
            }
            else
                err(1);
            if (pos > tbts) {
                if (noSt)
                    err(0);
                break;
            }
        }
        // Make sure the buffer can hold this + the largest possible addition
        // Maximum chunk size (practically, theoretically infinite) is 2^17
        if (resize)
            cbuf(bt + 131072);
        var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
        var lpos = pos;
        for (;; lpos = pos) {
            // bits read, code
            var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
            pos += c & 15;
            if (pos > tbts) {
                if (noSt)
                    err(0);
                break;
            }
            if (!c)
                err(2);
            if (sym < 256)
                buf[bt++] = sym;
            else if (sym == 256) {
                lpos = pos, lm = null;
                break;
            }
            else {
                var add = sym - 254;
                // no extra bits needed if less
                if (sym > 264) {
                    // index
                    var i = sym - 257, b = fleb$1[i];
                    add = bits(dat, pos, (1 << b) - 1) + fl$1[i];
                    pos += b;
                }
                // dist
                var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
                if (!d)
                    err(3);
                pos += d & 15;
                var dt = fd[dsym];
                if (dsym > 3) {
                    var b = fdeb$1[dsym];
                    dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
                }
                if (pos > tbts) {
                    if (noSt)
                        err(0);
                    break;
                }
                if (resize)
                    cbuf(bt + 131072);
                var end = bt + add;
                if (bt < dt) {
                    var shift = dl - dt, dend = Math.min(dt, end);
                    if (shift + bt < 0)
                        err(3);
                    for (; bt < dend; ++bt)
                        buf[bt] = dict[shift + bt];
                }
                for (; bt < end; ++bt)
                    buf[bt] = buf[bt - dt];
            }
        }
        st.l = lm, st.p = lpos, st.b = bt, st.f = final;
        if (lm)
            final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    // don't reallocate for streams or user buffers
    return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
// empty
var et$1 = /*#__PURE__*/ new u8$1(0);
// zlib start
var zls = function (d, dict) {
    if ((d[0] & 15) != 8 || (d[0] >> 4) > 7 || ((d[0] << 8 | d[1]) % 31))
        err(6, 'invalid zlib data');
    if ((d[1] >> 5 & 1) == 1)
        err(6, 'invalid zlib data: ' + (d[1] & 32 ? 'need' : 'unexpected') + ' dictionary');
    return (d[1] >> 3 & 4) + 2;
};
/**
 * Expands Zlib data
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
function unzlibSync(data, opts) {
    return inflt(data.subarray(zls(data), -4), { i: 2 }, opts, opts);
}
// text decoder
var td$1 = typeof TextDecoder != 'undefined' && /*#__PURE__*/ new TextDecoder();
// text decoder stream
var tds$1 = 0;
try {
    td$1.decode(et$1, { stream: true });
    tds$1 = 1;
}
catch (e) { }

const readUint = (buf, pos) => (buf[pos] |
    (buf[pos + 1] << 8) |
    (buf[pos + 2] << 16) |
    (buf[pos + 3] << 24)) >>>
    0;
var float = {
    readFloatLE(buf, pos) {
        const uint = readUint(buf, pos);
        const sign = (uint >> 31) * 2 + 1;
        const exponent = (uint >>> 23) & 255;
        const mantissa = uint & 8388607;
        return exponent === 255
            ? mantissa
                ? NaN
                : sign * Infinity
            : exponent === 0 // denormal
                ? sign * 1.401298464324817e-45 * mantissa
                : sign * 2 ** (exponent - 150) * (mantissa + 8388608);
    },
};

/* eslint-disable no-mixed-operators */
/**
 * A minimal UTF8 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var utf8 = {
    /**
     * Reads UTF8 bytes as a string.
     * @param {Uint8Array} buffer Source buffer
     * @param {number} start Source start
     * @param {number} end Source end
     * @returns {string} String read
     */
    read(buffer, start, end) {
        if (end - start < 1) {
            return '';
        }
        const fromCharCode = (i) => String.fromCharCode(i);
        let str = '';
        for (let i = start; i < end;) {
            const t = buffer[i++];
            if (t <= 0x7F) {
                str += fromCharCode(t);
            }
            else if (t >= 0xC0 && t < 0xE0) {
                str += fromCharCode((t & 0x1F) << 6 | buffer[i++] & 0x3F);
            }
            else if (t >= 0xE0 && t < 0xF0) {
                str += fromCharCode((t & 0xF) << 12 | (buffer[i++] & 0x3F) << 6 | buffer[i++] & 0x3F);
            }
            else if (t >= 0xF0) {
                const t2 = ((t & 7) << 18 | (buffer[i++] & 0x3F) << 12 | (buffer[i++] & 0x3F) << 6 | buffer[i++] & 0x3F) - 0x10000;
                str += fromCharCode(0xD800 + (t2 >> 10));
                str += fromCharCode(0xDC00 + (t2 & 0x3FF));
            }
        }
        return str;
    },
};

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
freb(fdeb, 0);
// map of value to reverse (assuming 16 bits)
var rev = new u16(32768);
for (var i = 0; i < 32768; ++i) {
    // reverse table algorithm from SO
    var x = ((i & 0xAAAA) >> 1) | ((i & 0x5555) << 1);
    x = ((x & 0xCCCC) >> 2) | ((x & 0x3333) << 2);
    x = ((x & 0xF0F0) >> 4) | ((x & 0x0F0F) << 4);
    rev[i] = (((x & 0xFF00) >> 8) | ((x & 0x00FF) << 8)) >> 1;
}
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
// empty
var et = /*#__PURE__*/ new u8(0);
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

requireCrc32();

/**
 * Supported Application
 * 目前已支持微信小程序、支付宝小程序、抖音小程序、H5
 */
const SP = {
    WECHAT: 1,
    ALIPAY: 2,
    DOUYIN: 3,
    H5: 4
};
let app;
// FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
if (typeof window != "undefined") {
    app = SP.H5;
}
else if (typeof tt != "undefined") {
    app = SP.DOUYIN;
}
else if (typeof my != "undefined") {
    app = SP.ALIPAY;
}
else if (typeof wx != "undefined") {
    app = SP.WECHAT;
}
else {
    throw new Error("Unsupported app");
}

let br = null;
if (app == SP.H5) {
    br = window;
}
else if (app == SP.ALIPAY) {
    br = my;
}
else if (app == SP.DOUYIN) {
    br = tt;
}
else if (app == SP.WECHAT) {
    br = wx;
}

// const now = () => (typeof performance != 'undefined' ? performance.now() : Date.now());
const stopwatch = {
    // a: {} as Record<string, number>,
    l: {},
    t: {},
    increment(label) {
        if (stopwatch.t[label] == undefined) {
            stopwatch.t[label] = 0;
        }
        stopwatch.t[label]++;
    },
    getCount(label) {
        return stopwatch.t[label] || 0;
    },
    time(label) {
        console.time?.(label);
    },
    timeEnd(label) {
        console.timeEnd?.(label);
    },
    clearTime(label) {
        delete stopwatch.t[label];
    },
    isLock(label) {
        return !!stopwatch.l[label];
    },
    lock(label) {
        stopwatch.l[label] = true;
    },
    unlock(label) {
        delete stopwatch.l[label];
    },
};
var benchmark = {
    count: 20,
    label(label) {
        console.log(label);
    },
    time(label, callback, beforeCallback, afterCallback) {
        stopwatch.increment(label);
        const count = stopwatch.getCount(label);
        if (stopwatch.isLock(label) || (this.count != 0 && count > this.count)) {
            callback(count);
        }
        else {
            beforeCallback?.(count);
            stopwatch.time(label);
            callback(count);
            stopwatch.timeEnd(label);
            afterCallback?.(count);
        }
    },
    clearTime(label) {
        stopwatch.clearTime(label);
    },
    lockTime(label) {
        stopwatch.lock(label);
    },
    unlockTime(label) {
        stopwatch.unlock(label);
    },
    line(size = 40) {
        console.log("-".repeat(size));
    },
    log(...message) {
        console.log("【benchmark】", ...message);
    },
};

const { USER_DATA_PATH } = app == SP.H5
    ? {}
    : app == SP.DOUYIN
        ? // @ts-ignore
            tt.getEnvInfoSync().common
        : br.env;
function genFilePath(filename, prefix) {
    return `${USER_DATA_PATH}/${prefix ? `${prefix}.` : ""}${filename}`;
}
/**
 * 写入本地文件
 * @param data 文件内容
 * @param filePath 文件路径
 * @returns
 */
function writeTmpFile(data, filePath) {
    const fs = br.getFileSystemManager();
    benchmark.log(`write file: ${filePath}`);
    return new Promise((resolve, reject) => {
        fs.access({
            path: filePath,
            success() {
                resolve(filePath);
            },
            fail() {
                fs.writeFile({
                    filePath,
                    data,
                    success() {
                        resolve(filePath);
                    },
                    fail(err) {
                        benchmark.log(`write fail: ${filePath}`, err);
                        reject(err);
                    },
                });
            },
        });
    });
}
/**
 * 移除本地文件
 * @param filePath 文件资源地址
 * @returns
 */
function removeTmpFile(filePath) {
    const fs = br.getFileSystemManager();
    return new Promise((resolve) => {
        fs.access({
            path: filePath,
            success() {
                benchmark.log(`remove file: ${filePath}`);
                fs.unlink({
                    filePath,
                    success: () => resolve(),
                    fail(err) {
                        benchmark.log(`remove fail: ${filePath}`, err);
                        resolve();
                    },
                });
            },
            fail(err) {
                benchmark.log(`access fail: ${filePath}`, err);
                resolve();
            },
        });
    });
}
/**
 * 读取本地文件
 * @param filePath 文件资源地址
 * @returns
 */
function readFile(filePath) {
    const fs = br.getFileSystemManager();
    return new Promise((resolve, reject) => {
        fs.access({
            path: filePath,
            success() {
                fs.readFile({
                    filePath,
                    success: (res) => resolve(res.data),
                    fail: reject,
                });
            },
            fail: reject,
        });
    });
}

/**
 * 读取远程文件
 * @param url 文件资源地址
 * @returns
 */
function readRemoteFile(url) {
    // H5环境
    if (app == SP.H5) {
        return fetch(url).then((response) => {
            if (response.ok) {
                return response.arrayBuffer();
            }
            else {
                throw new Error(`HTTP error, status=${response.status}, statusText=${response.statusText}`);
            }
        });
    }
    // 小程序环境
    return new Promise((resolve, reject) => {
        br.request({
            url,
            // @ts-ignore 支付宝小程序必须有该字段
            dataType: "arraybuffer",
            responseType: "arraybuffer",
            enableCache: true,
            success: (res) => resolve(res.data),
            fail: reject,
        });
    });
}
/**
 * 读取文件资源
 * @param url 文件资源地址
 * @returns
 */
function download(url) {
    // 读取远程文件
    if (/^http(s)?:\/\//.test(url)) {
        return readRemoteFile(url);
    }
    // 读取本地文件
    if (app != SP.H5) {
        return readFile(url);
    }
    return Promise.resolve(null);
}

class VideoEntity {
    /**
     * svga 版本号
     */
    version;
    /**
     * svga 文件名
     */
    filename;
    /**
     * svga 尺寸
     */
    size = { width: 0, height: 0 };
    /**
     * svga 帧率
     */
    fps = 20;
    /**
     * svga 帧数
     */
    frames = 0;
    /**
     * svga 二进制图片合集
     */
    images = {};
    /**
     * svga 替代元素
     */
    replaceElements = {};
    /**
     * svga 动态元素
     */
    dynamicElements = {};
    /**
     * svga 关键帧信息
     */
    sprites = [];
    constructor(movie, filename) {
        const { viewBoxWidth, viewBoxHeight, fps, frames } = movie.params;
        this.version = movie.version;
        this.filename = filename;
        this.size.width = viewBoxWidth;
        this.size.height = viewBoxHeight;
        this.fps = fps;
        this.frames = frames;
        this.images = movie.images || {};
        this.sprites = this.formatSprites(movie.sprites || []);
    }
    /**
     * 格式化精灵图
     * @param mSprites
     * @returns
     */
    formatSprites(mSprites) {
        return mSprites.map((mSprite) => ({
            imageKey: mSprite.imageKey,
            frames: this.formatFrames(mSprite.frames || []),
        }));
    }
    /**
     * 格式化关键帧
     * @param mFrames
     * @returns
     */
    formatFrames(mFrames) {
        let lastShapes;
        return mFrames.map((mFrame) => {
            const { layout: FL, transform: FT, alpha: FA } = mFrame;
            // 设置Layout
            const L = {
                x: (FL?.x + 0.5) | 0,
                y: (FL?.y + 0.5) | 0,
                width: (FL?.width + 0.5) | 0,
                height: (FL?.height + 0.5) | 0,
            };
            // 设置Transform
            const T = {
                a: FT?.a ?? 1.0,
                b: FT?.b ?? 0.0,
                c: FT?.c ?? 0.0,
                d: FT?.d ?? 1.0,
                tx: FT?.tx ?? 0.0,
                ty: FT?.ty ?? 0.0,
            };
            let shapes = this.formatShapes(mFrame.shapes || []);
            if (mFrame.shapes[0]?.type == 3 && lastShapes) {
                shapes = lastShapes;
            }
            else {
                lastShapes = shapes;
            }
            const llx = T.a * L.x + T.c * L.y + T.tx;
            const lrx = T.a * (L.x + L.width) + T.c * L.y + T.tx;
            const lbx = T.a * L.x + T.c * (L.y + L.height) + T.tx;
            const rbx = T.a * (L.x + L.width) + T.c * (L.y + L.height) + T.tx;
            const lly = T.b * L.x + T.d * L.y + T.ty;
            const lry = T.b * (L.x + L.width) + T.d * L.y + T.ty;
            const lby = T.b * L.x + T.d * (L.y + L.height) + T.ty;
            const rby = T.b * (L.x + L.width) + T.d * (L.y + L.height) + T.ty;
            const nx = (Math.min(lbx, rbx, llx, lrx) + 0.5) | 0;
            const ny = (Math.min(lby, rby, lly, lry) + 0.5) | 0;
            const CP = mFrame.clipPath ?? "";
            const maskPath = CP.length > 0
                ? {
                    d: CP,
                    transform: undefined,
                    styles: {
                        fill: "rgba(0, 0, 0, 0)",
                        stroke: null,
                        strokeWidth: null,
                        lineCap: null,
                        lineJoin: null,
                        miterLimit: null,
                        lineDash: null,
                    },
                }
                : null;
            return {
                alpha: FA ?? 0,
                layout: L,
                transform: T,
                clipPath: CP,
                shapes,
                nx,
                ny,
                maskPath,
            };
        });
    }
    /**
     * 格式化形状
     * @param mShapes
     * @returns
     */
    formatShapes(mShapes) {
        const shapes = [];
        for (let mShape of mShapes) {
            const mStyles = mShape.styles;
            if (mStyles == null) {
                continue;
            }
            const lineDash = [];
            const { lineDashI: LD1, lineDashII: LD2, lineDashIII: LD3 } = mStyles;
            if (LD1 > 0) {
                lineDash.push(LD1);
            }
            if (LD2 > 0) {
                if (lineDash.length < 1) {
                    lineDash.push(0);
                }
                lineDash.push(LD2);
            }
            if (LD3 > 0) {
                if (lineDash.length < 2) {
                    lineDash.push(0);
                    lineDash.push(0);
                }
                lineDash[2] = LD3;
            }
            let lineCap = null;
            switch (mStyles.lineCap) {
                case 0:
                    lineCap = "butt";
                    break;
                case 1:
                    lineCap = "round";
                    break;
                case 2:
                    lineCap = "square";
                    break;
            }
            let lineJoin = null;
            switch (mStyles.lineJoin) {
                case 2:
                    lineJoin = "bevel";
                    break;
                case 1:
                    lineJoin = "round";
                    break;
                case 0:
                    lineJoin = "miter";
                    break;
            }
            const { fill: StF, stroke: StS } = mStyles;
            let fill = null;
            if (StF) {
                fill = `rgba(${(StF.r * 255) | 0}, ${(StF.g * 255) | 0}, ${(StF.b * 255) | 0}, ${(StF.a * 1) | 0})`;
            }
            let stroke = null;
            if (StS) {
                stroke = `rgba(${(StS.r * 255) | 0}, ${(StS.g * 255) | 0}, ${(StS.b * 255) | 0}, ${(StS.a * 1) | 0})`;
            }
            const SS = {
                lineDash,
                fill,
                stroke,
                lineCap,
                lineJoin,
                strokeWidth: mStyles.strokeWidth,
                miterLimit: mStyles.miterLimit,
            };
            const { transform: ShF, shape, rect, ellipse } = mShape;
            const ST = {
                a: ShF?.a ?? 1.0,
                b: ShF?.b ?? 0.0,
                c: ShF?.c ?? 0.0,
                d: ShF?.d ?? 1.0,
                tx: ShF?.tx ?? 0.0,
                ty: ShF?.ty ?? 0.0,
            };
            if (mShape.type == 0 && shape) {
                shapes.push({
                    type: "shape" /* SHAPE_TYPE.SHAPE */,
                    path: shape,
                    styles: SS,
                    transform: ST,
                });
            }
            else if (mShape.type == 1 && rect) {
                shapes.push({
                    type: "rect" /* SHAPE_TYPE.RECT */,
                    path: rect,
                    styles: SS,
                    transform: ST,
                });
            }
            else if (mShape.type == 2 && ellipse) {
                shapes.push({
                    type: "ellipse" /* SHAPE_TYPE.ELLIPSE */,
                    path: ellipse,
                    styles: SS,
                    transform: ST,
                });
            }
        }
        return shapes;
    }
}

/**
 * SVGA 下载解析器
 */
class Parser {
    /**
     * 解析视频实体
     * @param data 视频二进制数据
     * @param url 视频地址
     * @returns
     */
    static parseVideoEntity(data, url) {
        const header = new Uint8Array(data, 0, 4);
        const u8a = new Uint8Array(data);
        if (header.toString() == "80,75,3,4") {
            throw new Error("this parser only support version@2 of SVGA.");
        }
        let entity;
        benchmark.time("unzlibSync", () => {
            const inflateData = unzlibSync(u8a);
            const movieData = MovieEntity.decode(inflateData);
            entity = new VideoEntity(movieData, url.substring(url.lastIndexOf("/") + 1));
        });
        return entity;
    }
    // static parsePlacardEntity(data: any[]) {}
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    async load(url) {
        const data = await download(url);
        benchmark.label(url);
        benchmark.line();
        return Parser.parseVideoEntity(data, url);
    }
}

/**
 * 获取当前显示设备的物理像素分辨率与CSS 像素分辨率之比
 */
let dpr = 1;
if (app == SP.H5) {
    dpr = window.devicePixelRatio;
}
else if ("getWindowInfo" in br) {
    dpr = br.getWindowInfo().pixelRatio;
}
else if ("getSystemInfoSync" in br) {
    dpr = br.getSystemInfoSync().pixelRatio;
}

/**
 * 获取Canvas及其Context
 * @param selector
 * @param component
 * @returns
 */
function getCanvas(selector, component) {
    return new Promise((resolve, reject) => {
        // 获取并重置Canvas
        const initCanvas = (canvas, width = 0, height = 0) => {
            if (!canvas) {
                reject(new Error("canvas not found."));
                return;
            }
            const ctx = canvas.getContext("2d");
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            resolve({ canvas, ctx });
        };
        if (app == SP.H5) {
            const canvas = document.querySelector(selector);
            const { width, height } = canvas.style;
            initCanvas(canvas, parseFloat(width), parseFloat(height));
        }
        else {
            let query = br.createSelectorQuery();
            if (component) {
                query = query.in(component);
            }
            query
                .select(selector)
                .fields({ node: true, size: true }, (res) => {
                const { node, width, height } = res || {};
                initCanvas(node, width, height);
            })
                .exec();
        }
    });
}
/**
 * 创建离屏Canvas
 * @param options 离屏Canvas参数
 * @returns
 */
function createOffscreenCanvas(options) {
    if (app == SP.H5) {
        return new OffscreenCanvas(options.width, options.height);
    }
    if (app == SP.ALIPAY) {
        return my.createOffscreenCanvas({
            width: options.width,
            height: options.height,
        });
    }
    if (app == SP.DOUYIN) {
        const canvas = tt.createOffscreenCanvas();
        canvas.width = options.width;
        canvas.height = options.height;
        return canvas;
    }
    return wx.createOffscreenCanvas({
        ...options,
        type: "2d",
    });
}
/**
 * 获取离屏Canvas及其Context
 * @param options
 * @returns
 */
function getOffscreenCanvas(options) {
    const canvas = createOffscreenCanvas(options);
    const ctx = canvas.getContext("2d");
    return { canvas, ctx };
}

/**
 * 将ArrayBuffer转为base64
 * @param data 二进制数据
 * @returns
 */
function toBase64(data) {
    const buf = toBuffer(data);
    let b64;
    if (app == SP.H5) {
        b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    }
    else {
        // FIXME: 如果arrayBufferToBase64被废除，可以使用mbtoa代替
        b64 = br.arrayBufferToBase64(buf);
    }
    return `data:image/png;base64,${b64}`;
}
/**
 * 生成ImageBitmap数据
 * 目前仅H5支持
 * @param data 二进制数据
 * @returns
 */
function toBitmap(data) {
    return createImageBitmap(new Blob([toBuffer(data)]));
}
/**
 * Uint8Array转换成ArrayBuffer
 * @param data
 * @returns
 */
function toBuffer(data) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

/**
 * 创建图片src元信息
 * @param data
 * @returns
 */
async function genImageSource(data, filename, prefix) {
    if (typeof data == "string") {
        return data;
    }
    // FIXME: 支付宝小程序IDE保存临时文件会失败
    if (app == SP.H5 || (app == SP.ALIPAY && br.isIDE)) {
        return toBase64(data);
    }
    try {
        // FIXME: IOS设备Uint8Array转base64时间较长，使用图片缓存形式速度会更快
        return await writeTmpFile(toBuffer(data), genFilePath(filename, prefix));
    }
    catch (ex) {
        console.warn(`图片缓存失败：${ex.message}`);
        return toBase64(data);
    }
}
/**
 * 加载图片
 * @param brush 创建图片对象
 * @param data 图片数据
 * @param filename 图片名称
 * @param prefix 文件名称前缀
 * @returns
 */
function loadImage(brush, data, filename, prefix) {
    if (app == SP.H5) {
        // 由于ImageBitmap在图片渲染上有优势，故优先使用
        if (data instanceof Uint8Array && "createImageBitmap" in window) {
            return toBitmap(data);
        }
        if (data instanceof ImageBitmap) {
            return Promise.resolve(data);
        }
    }
    return new Promise((resolve, reject) => {
        const img = brush.createImage();
        img.onload = () => {
            // 如果 data 是 URL/base64 或者 img.src 是 base64
            if (img.src.startsWith("data:") || typeof data == "string") {
                resolve(img);
            }
            else {
                removeTmpFile(img.src).then(() => resolve(img));
            }
        };
        img.onerror = () => reject(new Error(`SVGA LOADING FAILURE: ${img.src}`));
        genImageSource(data, filename, prefix).then((src) => (img.src = src));
    });
}

const noop = () => { };

let p;
switch (app) {
    case SP.H5: {
        const UA = navigator.userAgent;
        if (/(Android)/i.test(UA)) {
            p = "Android";
        }
        else if (/(iPhone|iPad|iPod|iOS)/i.test(UA)) {
            p = "iOS";
        }
        else if (/(OpenHarmony|ArkWeb)/i.test(UA)) {
            p = "OpenHarmony";
        }
        else {
            p = "UNKNOWN";
        }
        break;
    }
    case SP.ALIPAY:
        p = br.getDeviceBaseInfo().platform;
        break;
    case SP.DOUYIN:
        p = br.getDeviceInfoSync().platform;
        break;
    case SP.WECHAT:
        p = br.getDeviceInfo().platform;
        break;
    default:
        p = "UNKNOWN";
}
const platform = p.toLocaleUpperCase();

const now = () => {
    // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
    if (typeof performance != "undefined") {
        return performance.now();
    }
    return Date.now();
};

/**
 * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths
 * 绘制路径的不同指令：
 * * 直线命令
 * - M: moveTo，移动到指定点，不绘制直线。
 * - L: lineTo，从起始点绘制一条直线到指定点。
 * - H: horizontal lineTo，从起始点绘制一条水平线到指定点。
 * - V: vertical lineTo，从起始点绘制一条垂直线到指定点。
 * - Z: closePath，从起始点绘制一条直线到路径起点，形成一个闭合路径。
 * * 曲线命令
 * - C: bezierCurveTo，绘制三次贝塞尔曲线。
 * - S: smooth curveTo，绘制平滑三次贝塞尔曲线。
 * - Q: quadraticCurveTo，绘制两次贝塞尔曲线。
 * - T: smooth quadraticCurveTo，绘制平滑两次贝塞尔曲线。
 * * 弧线命令
 * - A: arcTo，从起始点绘制一条弧线到指定点。
 */
const validMethods = "MLHVCSQZmlhvcsqz";
function render(context, materials, videoEntity, currentFrame, head, tail) {
    const { sprites, replaceElements, dynamicElements } = videoEntity;
    for (let i = head; i < tail; i++) {
        const sprite = sprites[i];
        const { imageKey } = sprite;
        const bitmap = materials.get(imageKey);
        const replaceElement = replaceElements[imageKey];
        const dynamicElement = dynamicElements[imageKey];
        drawSprite(context, sprite, currentFrame, bitmap, replaceElement, dynamicElement);
    }
}
function drawSprite(context, sprite, currentFrame, bitmap, replaceElement, dynamicElement) {
    const frame = sprite.frames[currentFrame];
    if (frame.alpha < 0.05)
        return;
    context.save();
    context.globalAlpha = frame.alpha;
    context.transform(frame.transform?.a ?? 1, frame.transform?.b ?? 0, frame.transform?.c ?? 0, frame.transform?.d ?? 1, frame.transform?.tx ?? 0, frame.transform?.ty ?? 0);
    if (bitmap) {
        if (frame.maskPath) {
            drawBezier(context, frame.maskPath.d, frame.maskPath.transform, frame.maskPath.styles);
            context.clip();
        }
        context.drawImage((replaceElement || bitmap), 0, 0, frame.layout.width, frame.layout.height);
    }
    if (dynamicElement) {
        context.drawImage(dynamicElement, (frame.layout.width - dynamicElement.width) / 2, (frame.layout.height - dynamicElement.height) / 2);
    }
    for (let i = 0; i < frame.shapes.length; i++) {
        drawShape(context, frame.shapes[i]);
    }
    context.restore();
}
function drawShape(context, shape) {
    switch (shape.type) {
        case "shape" /* SHAPE_TYPE.SHAPE */:
            drawBezier(context, shape.path.d, shape.transform, shape.styles);
            break;
        case "ellipse" /* SHAPE_TYPE.ELLIPSE */:
            drawEllipse(context, shape.path.x ?? 0.0, shape.path.y ?? 0.0, shape.path.radiusX ?? 0.0, shape.path.radiusY ?? 0.0, shape.transform, shape.styles);
            break;
        case "rect" /* SHAPE_TYPE.RECT */:
            drawRect(context, shape.path.x ?? 0.0, shape.path.y ?? 0.0, shape.path.width ?? 0.0, shape.path.height ?? 0.0, shape.path.cornerRadius ?? 0.0, shape.transform, shape.styles);
            break;
    }
}
function resetShapeStyles(context, styles) {
    if (!styles) {
        return;
    }
    context.strokeStyle = styles.stroke || "transparent";
    if (styles.strokeWidth > 0) {
        context.lineWidth = styles.strokeWidth;
    }
    if (styles.miterLimit > 0) {
        context.miterLimit = styles.miterLimit;
    }
    if (styles.lineCap) {
        context.lineCap = styles.lineCap;
    }
    if (styles.lineJoin) {
        context.lineJoin = styles.lineJoin;
    }
    context.fillStyle = styles.fill || "transparent";
    if (styles.lineDash) {
        context.setLineDash(styles.lineDash);
    }
}
function drawBezier(context, d, transform, styles) {
    context.save();
    resetShapeStyles(context, styles);
    if (transform) {
        context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
    }
    const currentPoint = { x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
    context.beginPath();
    if (d) {
        const segments = d
            .replace(/([a-zA-Z])/g, "|||$1 ")
            .replace(/,/g, " ")
            .split("|||");
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            if (segment.length == 0) {
                continue;
            }
            const firstLetter = segment.substring(0, 1);
            if (validMethods.includes(firstLetter)) {
                drawBezierElement(context, currentPoint, firstLetter, segment.substring(1).trim().split(" "));
            }
        }
    }
    if (styles.fill) {
        context.fill();
    }
    if (styles.stroke) {
        context.stroke();
    }
    context.restore();
}
function drawBezierElement(context, currentPoint, method, args) {
    switch (method) {
        case "M":
            currentPoint.x = +args[0];
            currentPoint.y = +args[1];
            context.moveTo(currentPoint.x, currentPoint.y);
            break;
        case "m":
            currentPoint.x += +args[0];
            currentPoint.y += +args[1];
            context.moveTo(currentPoint.x, currentPoint.y);
            break;
        case "L":
            currentPoint.x = +args[0];
            currentPoint.y = +args[1];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "l":
            currentPoint.x += +args[0];
            currentPoint.y += +args[1];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "H":
            currentPoint.x = +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "h":
            currentPoint.x += +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "V":
            currentPoint.y = +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "v":
            currentPoint.y += +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "C":
            currentPoint.x1 = +args[0];
            currentPoint.y1 = +args[1];
            currentPoint.x2 = +args[2];
            currentPoint.y2 = +args[3];
            currentPoint.x = +args[4];
            currentPoint.y = +args[5];
            context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
            break;
        case "c":
            currentPoint.x1 = currentPoint.x + +args[0];
            currentPoint.y1 = currentPoint.y + +args[1];
            currentPoint.x2 = currentPoint.x + +args[2];
            currentPoint.y2 = currentPoint.y + +args[3];
            currentPoint.x += +args[4];
            currentPoint.y += +args[5];
            context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
            break;
        case "S":
            if (currentPoint.x1 != undefined &&
                currentPoint.y1 != undefined &&
                currentPoint.x2 != undefined &&
                currentPoint.y2 != undefined) {
                currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
                currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
                currentPoint.x2 = +args[0];
                currentPoint.y2 = +args[1];
                currentPoint.x = +args[2];
                currentPoint.y = +args[3];
                context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
            }
            else {
                currentPoint.x1 = +args[0];
                currentPoint.y1 = +args[1];
                currentPoint.x = +args[2];
                currentPoint.y = +args[3];
                context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
            }
            break;
        case "s":
            if (currentPoint.x1 != undefined &&
                currentPoint.y1 != undefined &&
                currentPoint.x2 != undefined &&
                currentPoint.y2 != undefined) {
                currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
                currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
                currentPoint.x2 = currentPoint.x + +args[0];
                currentPoint.y2 = currentPoint.y + +args[1];
                currentPoint.x += +args[2];
                currentPoint.y += +args[3];
                context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
            }
            else {
                currentPoint.x1 = currentPoint.x + +args[0];
                currentPoint.y1 = currentPoint.y + +args[1];
                currentPoint.x += +args[2];
                currentPoint.y += +args[3];
                context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
            }
            break;
        case "Q":
            currentPoint.x1 = +args[0];
            currentPoint.y1 = +args[1];
            currentPoint.x = +args[2];
            currentPoint.y = +args[3];
            context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
            break;
        case "q":
            currentPoint.x1 = currentPoint.x + +args[0];
            currentPoint.y1 = currentPoint.y + +args[1];
            currentPoint.x += +args[2];
            currentPoint.y += +args[3];
            context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
            break;
        case "Z":
        case "z":
            context.closePath();
            break;
    }
}
function drawEllipse(context, x, y, radiusX, radiusY, transform, styles) {
    context.save();
    resetShapeStyles(context, styles);
    if (transform) {
        context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
    }
    x = x - radiusX;
    y = y - radiusY;
    const w = radiusX * 2;
    const h = radiusY * 2;
    const kappa = 0.5522848;
    const ox = (w / 2) * kappa;
    const oy = (h / 2) * kappa;
    const xe = x + w;
    const ye = y + h;
    const xm = x + w / 2;
    const ym = y + h / 2;
    context.beginPath();
    context.moveTo(x, ym);
    context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    if (styles.fill) {
        context.fill();
    }
    if (styles.stroke) {
        context.stroke();
    }
    context.restore();
}
function drawRect(context, x, y, width, height, cornerRadius, transform, styles) {
    context.save();
    resetShapeStyles(context, styles);
    if (transform) {
        context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
    }
    let radius = cornerRadius;
    if (width < 2 * radius) {
        radius = width / 2;
    }
    if (height < 2 * radius) {
        radius = height / 2;
    }
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
    if (styles.fill) {
        context.fill();
    }
    if (styles.stroke) {
        context.stroke();
    }
    context.restore();
}

class Brush {
    mode;
    /**
     * 主屏的 Canvas 元素
     * Main Screen
     */
    X = null;
    /**
     * 主屏的 Context 对象
     * Main Context
     */
    XC = null;
    /**
     * 副屏的 Canvas 元素
     * Secondary Screen
     */
    Y = null;
    /**
     * 副屏的 Context 对象
     * Secondary Context
     */
    YC = null;
    /**
     * canvas宽度
     */
    W = 0;
    /**
     * canvas高度
     */
    H = 0;
    /**
     * 粉刷模式
     */
    model = {};
    /**
     * 素材
     */
    materials = new Map();
    constructor(mode = 'normal') {
        this.mode = mode;
    }
    setModel(type) {
        const { model } = this;
        // set type
        model.type = type;
        // set clear
        if (type == "O" &&
            // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
            app == SP.H5 &&
            navigator.userAgent.includes("Firefox")) {
            model.clear = "CR";
        }
        else if ((type == "O" && app == SP.DOUYIN) || app == SP.ALIPAY) {
            model.clear = "CL";
        }
        else {
            model.clear = "RE";
        }
        // set render
        if ((type == "C" &&
            (app == SP.DOUYIN || (platform == "IOS" && app == SP.ALIPAY))) ||
            (type == "O" && app == SP.WECHAT)) {
            model.render = "PU";
        }
        else {
            model.render = "DR";
        }
        benchmark.line(4);
        benchmark.log("brush type", model.type);
        benchmark.log("brush clear", model.clear);
        benchmark.log("brush render", model.render);
        benchmark.line(4);
    }
    /**
     * 注册画笔，根据环境判断生成最优的绘制方式
     * @param selector
     * @param ofsSelector
     * @param component
     */
    async register(selector, ofsSelector, component) {
        const { model, mode } = this;
        // #region set main screen implement
        // -------- 创建主屏 ---------
        const { canvas, ctx } = await getCanvas(selector, component);
        const { width, height } = canvas;
        // 添加主屏
        this.X = canvas;
        this.XC = ctx;
        this.W = width;
        this.H = height;
        // #endregion set main screen implement
        // #region set secondary screen implement
        // ------- 创建副屏 ---------
        if (mode == 'simple') {
            this.Y = this.X;
            this.YC = this.XC;
            this.setModel('C');
        }
        else {
            let ofsResult;
            if (typeof ofsSelector == "string" && ofsSelector != "") {
                ofsResult = await getCanvas(ofsSelector, component);
                ofsResult.canvas.width = width;
                ofsResult.canvas.height = height;
                this.setModel("C");
            }
            else {
                ofsResult = getOffscreenCanvas({ width, height });
                this.setModel("O");
            }
            this.Y = ofsResult.canvas;
            this.YC = ofsResult.ctx;
        }
        // #endregion set secondary screen implement
        // #region clear main screen implement
        // ------- 生成主屏清理函数 -------
        // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布
        if (model.clear == "CL") {
            this.clearFront = () => {
                const { W, H } = this;
                this.XC.clearRect(0, 0, W, H);
            };
        }
        else {
            this.clearFront = () => {
                const { W, H } = this;
                this.X.width = W;
                this.X.height = H;
            };
        }
        // #endregion clear main screen implement
        if (mode == 'simple') {
            this.clearBack = this.stick = noop;
        }
        else {
            // #region clear secondary screen implement
            // ------- 生成副屏清理函数 --------
            switch (model.clear) {
                case "CR":
                    this.clearBack = () => {
                        const { W, H } = this;
                        // FIXME:【支付宝小程序】频繁创建新的 OffscreenCanvas 会出现崩溃现象
                        const { canvas, ctx } = getOffscreenCanvas({ width: W, height: H });
                        this.Y = canvas;
                        this.YC = ctx;
                    };
                    break;
                case "CL":
                    this.clearBack = () => {
                        const { W, H } = this;
                        // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布，无论是Canvas还是OffscreenCanvas
                        this.YC.clearRect(0, 0, W, H);
                    };
                    break;
                default:
                    this.clearBack = () => {
                        const { W, H, Y } = this;
                        Y.width = W;
                        Y.height = H;
                    };
            }
            // #endregion clear secondary screen implement
            // #region stick implement
            // -------- 生成渲染函数 ---------
            switch (model.render) {
                case "DR":
                    this.stick = () => {
                        const { W, H } = this;
                        // FIXME:【微信小程序】 drawImage 无法绘制 OffscreenCanvas；【抖音小程序】 drawImage 无法绘制 Canvas
                        this.XC.drawImage(this.Y, 0, 0, W, H);
                    };
                    break;
                case "PU":
                    this.stick = () => {
                        const { W, H } = this;
                        // FIXME:【所有小程序】 imageData 获取到的数据都是 0，可以当场使用，但不要妄图缓存它
                        const imageData = this.YC.getImageData(0, 0, W, H);
                        this.XC.putImageData(imageData, 0, 0, 0, 0, W, H);
                    };
                    break;
            }
            // #endregion stick implement
        }
    }
    /**
     * 设置宽高
     * @param width 宽度
     * @param height 高度
     */
    setRect(width, height) {
        const { X, Y } = this;
        X.width = Y.width = this.W = width;
        X.height = Y.height = this.H = height;
    }
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    loadImage(images, filename) {
        let imageArr = [];
        benchmark.clearTime("load image");
        benchmark.time("load image", () => {
            this.materials.clear();
            for (let key in images) {
                const p = loadImage(this, images[key], key, filename).then((img) => {
                    this.materials.set(key, img);
                });
                imageArr.push(p);
            }
        });
        return Promise.all(imageArr);
    }
    /**
     * 创建图片标签
     * @returns
     */
    createImage() {
        if (app == SP.H5) {
            return new Image();
        }
        return this.X.createImage();
    }
    /**
     * 生成图片
     * @param type
     * @param encoderOptions
     * @returns
     */
    getImage(type = 'image/png', encoderOptions = 0.92) {
        return this.X.toDataURL(type, encoderOptions);
    }
    /**
     * 注册刷新屏幕的回调函数
     * @param cb
     */
    flush(cb) {
        (app == SP.H5 ? br : this.X).requestAnimationFrame(cb);
    }
    clearFront = noop;
    clearBack = noop;
    /**
     * 绘制图片片段
     * @param videoEntity
     * @param currentFrame
     * @param start
     * @param end
     */
    draw(videoEntity, currentFrame, start, end) {
        render(this.YC, this.materials, videoEntity, currentFrame, start, end);
    }
    stick = noop;
    /**
     * 销毁画笔
     */
    destroy() {
        this.clearFront();
        this.clearBack();
        this.materials.clear();
        this.X = this.XC = this.Y = this.YC = null;
        this.clearFront = this.clearBack = this.stick = noop;
    }
}

class Animator {
    brush;
    /**
     * 动画是否执行
     */
    isRunning = false;
    /**
     * 动画开始时间
     */
    startTime = 0;
    /**
     * 动画开始帧
     */
    startValue = 0;
    /**
     * 动画总帧数
     */
    totalValue = 0;
    /**
     * 动画持续时间
     */
    duration = 0;
    /**
     * 循环播放开始帧与动画开始帧之间的时间偏差
     */
    loopStart = 0;
    /**
     * 循环持续时间
     */
    loopDuration = 0;
    /**
     * 最后停留的目标模式，类似于**animation-fill-mode**
     * 0: 倒序播放
     * 1: 正序播放
     */
    fillRule = 0;
    /* ---- 事件钩子 ---- */
    onStart = noop;
    onUpdate = noop;
    onEnd = noop;
    constructor(brush) {
        this.brush = brush;
    }
    /**
     * 设置动画开始帧和结束帧
     * @param startValue
     * @param endValue
     */
    setRange(startValue, endValue) {
        this.startValue = startValue;
        this.totalValue = endValue - startValue;
    }
    /**
     * 设置动画的必要参数
     * @param duration
     * @param frameDuration
     * @param loopStart
     * @param loop
     * @param fillRule
     */
    setConfig(duration, loopStart, loop, fillRule) {
        this.duration = duration;
        this.loopStart = loopStart;
        this.fillRule = fillRule;
        this.loopDuration = loopStart + (duration - loopStart) * loop;
        console.log('Animator', 'duration', duration, 'loopStart', loopStart, 'fillRule', fillRule, 'loopDuration', this.loopDuration);
    }
    start() {
        this.isRunning = true;
        this.startTime = now();
        this.onStart();
        this.doFrame();
    }
    stop() {
        this.isRunning = false;
    }
    doFrame() {
        if (this.isRunning) {
            this.doDeltaTime(now() - this.startTime);
            if (this.isRunning) {
                this.brush.flush(() => this.doFrame());
            }
        }
    }
    doDeltaTime(DT) {
        const { duration: D, loopStart: LS, loopDuration: LD, startValue: SV, totalValue: TV, fillRule: FR, } = this;
        // 本轮动画已消耗的时间比例 currentFrication
        let CF;
        // 运行时间 大于等于 循环持续时间
        if (DT >= LD) {
            // 循环已结束
            CF = FR ? 0.0 : 1.0;
            this.stop();
        }
        else {
            // 本轮动画已消耗的时间比例 = (本轮动画已消耗的时间 + 循环播放开始帧与动画开始帧之间的时间偏差) / 动画持续时间
            CF = DT <= D ? DT / D : (((DT - LS) % (D - LS)) + LS) / D;
        }
        this.onUpdate((TV * CF + SV) << 0, CF);
        if (!this.isRunning) {
            this.onEnd();
        }
    }
}

/**
 * SVGA 播放器
 */
class Player {
    /**
     * 动画当前帧数
     */
    currFrame = 0;
    /**
     * SVGA 元数据
     * Video Entity
     */
    entity = undefined;
    /**
     * 当前配置项
     */
    config = Object.create({
        loop: 0,
        fillMode: "forwards" /* PLAYER_FILL_MODE.FORWARDS */,
        playMode: "forwards" /* PLAYER_PLAY_MODE.FORWARDS */,
        startFrame: 0,
        endFrame: 0,
        loopStartFrame: 0,
        // isUseIntersectionObserver: false,
    });
    brush = new Brush();
    animator = null;
    // private isBeIntersection = true;
    // private intersectionObserver: IntersectionObserver | null = null
    /**
     * 片段绘制开始位置
     */
    head = 0;
    /**
     * 片段绘制结束位置
     */
    tail = 0;
    /**
     * 设置配置项
     * @param options 可配置项
     * @property {string} container 主屏，播放动画的 Canvas 元素
     * @property {string} secondary 副屏，播放动画的 Canvas 元素
     * @property {number} loop 循环次数，默认值 0（无限循环）
     * @property {string} fillMode 最后停留的目标模式，类似于 animation-fill-mode，接受值 forwards 和 fallbacks，默认值 forwards。
     * @property {string} playMode 播放模式，接受值 forwards 和 fallbacks，默认值 forwards。
     * @property {number} startFrame 开始播放的帧数，默认值 0
     * @property {number} endFrame 结束播放的帧数，默认值 0
     * @property {number} loopStartFrame 循环播放的开始帧，默认值 0
     */
    async setConfig(options, component) {
        let config;
        if (typeof options == "string") {
            config = { container: options };
        }
        else {
            config = options;
        }
        Object.assign(this.config, {
            loop: config.loop ?? 0,
            fillMode: config.fillMode ?? "forwards" /* PLAYER_FILL_MODE.FORWARDS */,
            playMode: config.playMode ?? "forwards" /* PLAYER_PLAY_MODE.FORWARDS */,
            startFrame: config.startFrame ?? 0,
            endFrame: config.endFrame ?? 0,
            loopStartFrame: config.loopStartFrame ?? 0,
        });
        await this.brush.register(config.container, config.secondary, component);
        // this.config.isUseIntersectionObserver =
        //   config.isUseIntersectionObserver ?? false;
        // 监听容器是否处于浏览器视窗内
        // this.setIntersectionObserver()
        this.animator = new Animator(this.brush);
        this.animator.onEnd = () => this.onEnd?.(this.currFrame);
    }
    // private setIntersectionObserver (): void {
    //   if (hasIntersectionObserver && this.config.isUseIntersectionObserver) {
    //     this.intersectionObserver = new IntersectionObserver(entries => {
    //       this.isBeIntersection = !(entries[0].intersectionRatio <= 0)
    //     }, {
    //       rootMargin: '0px',
    //       threshold: [0, 0.5, 1]
    //     })
    //     this.intersectionObserver.observe(this.config.container)
    //   } else {
    //     if (this.intersectionObserver != null) this.intersectionObserver.disconnect()
    //     this.config.isUseIntersectionObserver = false
    //     this.isBeIntersection = true
    //   }
    // }
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @returns Promise<void>
     */
    mount(videoEntity) {
        if (!videoEntity) {
            throw new Error("videoEntity undefined");
        }
        this.animator.stop();
        this.currFrame = 0;
        this.entity = videoEntity;
        benchmark.clearTime("render");
        benchmark.clearTime("draw");
        benchmark.unlockTime("draw");
        const { images, filename, size } = videoEntity;
        this.brush.setRect(size.width, size.height);
        this.brush.clearBack();
        return this.brush.loadImage(images, filename);
    }
    /**
     * 开始播放事件回调
     * @param frame
     */
    onStart;
    /**
     * 重新播放事件回调
     * @param frame
     */
    onResume;
    /**
     * 暂停播放事件回调
     * @param frame
     */
    onPause;
    /**
     * 停止播放事件回调
     * @param frame
     */
    onStop;
    /**
     * 播放中事件回调
     * @param percent
     * @param frame
     * @param frames
     */
    onProcess;
    /**
     * 结束播放事件回调
     * @param frame
     */
    onEnd;
    /**
     * 开始播放
     */
    start() {
        this.brush.clearFront();
        this.startAnimation();
        this.onStart?.(this.currFrame);
    }
    /**
     * 重新播放
     */
    resume() {
        this.startAnimation();
        this.onResume?.(this.currFrame);
    }
    /**
     * 暂停播放
     */
    pause() {
        this.animator.stop();
        this.onPause?.(this.currFrame);
    }
    /**
     * 停止播放
     */
    stop() {
        this.animator.stop();
        this.currFrame = 0;
        this.brush.clearFront();
        this.onStop?.(this.currFrame);
    }
    /**
     * 清理容器画布
     */
    clear() {
        this.brush.clearFront();
    }
    /**
     * 销毁实例
     */
    destroy() {
        this.animator.stop();
        this.brush.destroy();
        this.animator = null;
        this.entity = undefined;
    }
    stepToFrame(frame, andPlay = false) {
        if (!this.entity || frame < 0 || frame >= this.entity.frames) {
            return;
        }
        this.pause();
        this.currFrame = ~~frame;
        if (andPlay) {
            this.startAnimation();
        }
    }
    stepToPercentage(percentage, andPlay = false) {
        if (!this.entity)
            return;
        const { frames } = this.entity;
        let frame = percentage * frames;
        if (frame >= frames && frame > 0) {
            frame = frames - 1;
        }
        this.stepToFrame(frame, andPlay);
    }
    /**
     * 开始绘制动画
     */
    startAnimation() {
        const { playMode, loopStartFrame, startFrame, endFrame, fillMode, loop } = this.config;
        let { frames, fps, sprites } = this.entity;
        const spriteCount = sprites.length;
        const start = startFrame > 0 ? startFrame : 0;
        const end = endFrame > 0 && endFrame < frames ? endFrame : frames;
        if (start > end) {
            throw new Error("StartFrame should greater than EndFrame");
        }
        // 如果开始动画的当前帧是最后一帧，重置为开始帧
        if (this.currFrame == frames) {
            this.currFrame = start;
        }
        // 顺序播放/倒叙播放
        if (playMode == "forwards" /* PLAYER_PLAY_MODE.FORWARDS */) {
            this.animator.setRange(start, end);
        }
        else {
            this.animator.setRange(end, start);
        }
        // 更新活动帧总数
        if (end !== frames) {
            frames = end - start;
        }
        else if (end <= 0 && start > 0) {
            frames -= start;
        }
        // 每帧持续的时间
        const frameDuration = ~~((1000 / fps) * 10 ** 6) / 10 ** 6;
        // 更新动画基础信息
        this.animator.setConfig(
        // duration = frames * (1 / fps) * 1000
        frames * frameDuration, 
        // loopStart = (loopStartFrame - start) * (1 / fps) * 1000
        loopStartFrame > start
            ? (loopStartFrame - start) * frameDuration
            : 0, loop <= 0 ? Infinity : loop, fillMode == "backwards" /* PLAYER_FILL_MODE.BACKWARDS */ ? 1 : 0);
        // 动画绘制过程
        this.animator.onUpdate = (value, spendValue) => {
            // 是否还有剩余时间
            const hasRemained = this.currFrame == value;
            // 当前帧的图片还未绘制完成
            if (this.tail != spriteCount) {
                // 1.2和3均为阔值，保证渲染尽快完成
                const tmp = hasRemained
                    ? Math.min(spriteCount * spendValue * 1.2 + 3, spriteCount) << 0
                    : spriteCount;
                if (tmp > this.tail) {
                    this.head = this.tail;
                    this.tail = tmp;
                    benchmark.time(`draw`, () => {
                        this.brush.draw(this.entity, this.currFrame, this.head, this.tail);
                    });
                }
            }
            if (hasRemained) {
                return;
            }
            this.brush.clearFront();
            benchmark.time("render", () => this.brush.stick(), null, (count) => {
                benchmark.log("render count", count);
                benchmark.line(20);
                if (count < benchmark.count) {
                    benchmark.clearTime("draw");
                }
                else {
                    benchmark.lockTime("draw");
                }
            });
            this.brush.clearBack();
            this.onProcess?.(~~((value / frames) * 100) / 100, value, frames);
            this.currFrame = value;
            this.tail = 0;
        };
        this.animator.start();
    }
}

class Poster {
    /**
     * SVGA 元数据
     * Video Entity
     */
    entity = undefined;
    currFrame = 0;
    brush = new Brush("simple");
    /**
     * 设置配置项
     * @param container canvas selector
     */
    setConfig(container, component) {
        return this.brush.register(container, '', component);
    }
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @param currFrame
     * @returns
     */
    mount(videoEntity, currFrame) {
        if (!videoEntity) {
            throw new Error("videoEntity undefined");
        }
        const { images, filename, size } = videoEntity;
        this.entity = videoEntity;
        this.currFrame = currFrame || 0;
        this.brush.setRect(size.width, size.height);
        this.brush.clearBack();
        benchmark.clearTime("render");
        return this.brush.loadImage(images, filename);
    }
    /**
     * 开始绘画事件回调
     */
    onStart;
    /**
     * 结束绘画事件回调
     */
    onEnd;
    /**
     * 替换元素
     * @param key
     * @param element
     * @returns
     */
    setReplaceElement(key, element) {
        if (!this.entity)
            return;
        this.entity.replaceElements[key] = element;
    }
    /**
     * 通过url替换元素
     * @param key
     * @param url
     * @returns
     */
    async setReplaceElementByUrl(key, url) {
        if (!this.entity)
            return;
        this.entity.replaceElements[key] = await loadImage(this.brush, url, url);
    }
    /**
     * 设置动态元素
     * @param key
     * @param element
     * @returns
     */
    setDynamicElement(key, element) {
        if (!this.entity)
            return;
        this.entity.dynamicElements[key] = element;
    }
    /**
     * 通过url设置动态元素
     * @param key
     * @param url
     * @returns
     */
    async setDynamicElementByUrl(key, url) {
        if (!this.entity)
            return;
        this.entity.dynamicElements[key] = await loadImage(this.brush, url, url);
    }
    /**
     * 绘制海报
     */
    draw() {
        benchmark.time("render", () => {
            this.brush.clearBack();
            this.brush.draw(this.entity, this.currFrame, 0, this.entity.sprites.length);
            this.brush.stick();
        });
    }
    /**
     * 清理海报
     */
    clear() {
        this.brush.clearFront();
    }
    /**
     * 销毁海报
     */
    destroy() {
        this.brush.destroy();
        this.entity = undefined;
    }
    /**
     * 获取海报元数据
     * @param type
     * @param encoderOptions
     * @returns
     */
    toDataURL(type, encoderOptions) {
        return this.brush.getImage(type, encoderOptions);
    }
}

export { Brush, Parser, Player, Poster, download, getCanvas, getOffscreenCanvas, loadImage };
//# sourceMappingURL=index.js.map
