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
var _b = freb(fdeb, 0), fd = _b.b;
// map of value to reverse (assuming 16 bits)
var rev = new u16(32768);
for (var i$1 = 0; i$1 < 32768; ++i$1) {
    // reverse table algorithm from SO
    var x = ((i$1 & 0xAAAA) >> 1) | ((i$1 & 0x5555) << 1);
    x = ((x & 0xCCCC) >> 2) | ((x & 0x3333) << 2);
    x = ((x & 0xF0F0) >> 4) | ((x & 0x0F0F) << 4);
    rev[i$1] = (((x & 0xFF00) >> 8) | ((x & 0x00FF) << 8)) >> 1;
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
for (var i$1 = 0; i$1 < 144; ++i$1)
    flt[i$1] = 8;
for (var i$1 = 144; i$1 < 256; ++i$1)
    flt[i$1] = 9;
for (var i$1 = 256; i$1 < 280; ++i$1)
    flt[i$1] = 7;
for (var i$1 = 280; i$1 < 288; ++i$1)
    flt[i$1] = 8;
// fixed distance tree
var fdt = new u8(32);
for (var i$1 = 0; i$1 < 32; ++i$1)
    fdt[i$1] = 5;
// fixed length map
var flrm = /*#__PURE__*/ hMap(flt, 9, 1);
// fixed distance map
var fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
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
    return new u8(v.subarray(s, e));
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
        return buf || new u8(0);
    var noBuf = !buf;
    // have to estimate size
    var resize = noBuf || st.i != 2;
    // no state
    var noSt = st.i;
    // Assumes roughly 33% compression ratio average
    if (noBuf)
        buf = new u8(sl * 3);
    // ensure buffer can fit at least l elements
    var cbuf = function (l) {
        var bl = buf.length;
        // need to increase size to fit
        if (l > bl) {
            // Double or set to necessary, whichever is greater
            var nbuf = new u8(Math.max(bl * 2, l));
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
                var ldt = new u8(tl);
                // code length tree
                var clt = new u8(19);
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
                    var i = sym - 257, b = fleb[i];
                    add = bits(dat, pos, (1 << b) - 1) + fl[i];
                    pos += b;
                }
                // dist
                var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
                if (!d)
                    err(3);
                pos += d & 15;
                var dt = fd[dsym];
                if (dsym > 3) {
                    var b = fdeb[dsym];
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
var et$1 = /*#__PURE__*/ new u8(0);
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
var td = typeof TextDecoder != 'undefined' && /*#__PURE__*/ new TextDecoder();
// text decoder stream
var tds = 0;
try {
    td.decode(et$1, { stream: true });
    tds = 1;
}
catch (e) { }

function t(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var e,r;var n,s=t(function(){if(r)return e;function t(t){return "undefined"!=typeof Float32Array?function(){var e=new Float32Array([-0]),r=new Uint8Array(e.buffer),n=128===r[3];function s(t,n,s){e[0]=t,n[s]=r[0],n[s+1]=r[1],n[s+2]=r[2],n[s+3]=r[3];}function i(t,n,s){e[0]=t,n[s]=r[3],n[s+1]=r[2],n[s+2]=r[1],n[s+3]=r[0];}function o(t,n){return r[0]=t[n],r[1]=t[n+1],r[2]=t[n+2],r[3]=t[n+3],e[0]}function a(t,n){return r[3]=t[n],r[2]=t[n+1],r[1]=t[n+2],r[0]=t[n+3],e[0]}t.writeFloatLE=n?s:i,t.writeFloatBE=n?i:s,t.readFloatLE=n?o:a,t.readFloatBE=n?a:o;}():function(){function e(t,e,r,n){var s=e<0?1:0;if(s&&(e=-e),0===e)t(1/e>0?0:2147483648,r,n);else if(isNaN(e))t(2143289344,r,n);else if(e>34028234663852886e22)t((s<<31|2139095040)>>>0,r,n);else if(e<11754943508222875e-54)t((s<<31|Math.round(e/1401298464324817e-60))>>>0,r,n);else {var i=Math.floor(Math.log(e)/Math.LN2);t((s<<31|i+127<<23|8388607&Math.round(e*Math.pow(2,-i)*8388608))>>>0,r,n);}}function r(t,e,r){var n=t(e,r),s=2*(n>>31)+1,i=n>>>23&255,o=8388607&n;return 255===i?o?NaN:s*(1/0):0===i?1401298464324817e-60*s*o:s*Math.pow(2,i-150)*(o+8388608)}t.writeFloatLE=e.bind(null,n),t.writeFloatBE=e.bind(null,s),t.readFloatLE=r.bind(null,i),t.readFloatBE=r.bind(null,o);}(),"undefined"!=typeof Float64Array?function(){var e=new Float64Array([-0]),r=new Uint8Array(e.buffer),n=128===r[7];function s(t,n,s){e[0]=t,n[s]=r[0],n[s+1]=r[1],n[s+2]=r[2],n[s+3]=r[3],n[s+4]=r[4],n[s+5]=r[5],n[s+6]=r[6],n[s+7]=r[7];}function i(t,n,s){e[0]=t,n[s]=r[7],n[s+1]=r[6],n[s+2]=r[5],n[s+3]=r[4],n[s+4]=r[3],n[s+5]=r[2],n[s+6]=r[1],n[s+7]=r[0];}function o(t,n){return r[0]=t[n],r[1]=t[n+1],r[2]=t[n+2],r[3]=t[n+3],r[4]=t[n+4],r[5]=t[n+5],r[6]=t[n+6],r[7]=t[n+7],e[0]}function a(t,n){return r[7]=t[n],r[6]=t[n+1],r[5]=t[n+2],r[4]=t[n+3],r[3]=t[n+4],r[2]=t[n+5],r[1]=t[n+6],r[0]=t[n+7],e[0]}t.writeDoubleLE=n?s:i,t.writeDoubleBE=n?i:s,t.readDoubleLE=n?o:a,t.readDoubleBE=n?a:o;}():function(){function e(t,e,r,n,s,i){var o=n<0?1:0;if(o&&(n=-n),0===n)t(0,s,i+e),t(1/n>0?0:2147483648,s,i+r);else if(isNaN(n))t(0,s,i+e),t(2146959360,s,i+r);else if(n>17976931348623157e292)t(0,s,i+e),t((o<<31|2146435072)>>>0,s,i+r);else {var a;if(n<22250738585072014e-324)t((a=n/5e-324)>>>0,s,i+e),t((o<<31|a/4294967296)>>>0,s,i+r);else {var l=Math.floor(Math.log(n)/Math.LN2);1024===l&&(l=1023),t(4503599627370496*(a=n*Math.pow(2,-l))>>>0,s,i+e),t((o<<31|l+1023<<20|1048576*a&1048575)>>>0,s,i+r);}}}function r(t,e,r,n,s){var i=t(n,s+e),o=t(n,s+r),a=2*(o>>31)+1,l=o>>>20&2047,h=4294967296*(1048575&o)+i;return 2047===l?h?NaN:a*(1/0):0===l?5e-324*a*h:a*Math.pow(2,l-1075)*(h+4503599627370496)}t.writeDoubleLE=e.bind(null,n,0,4),t.writeDoubleBE=e.bind(null,s,4,0),t.readDoubleLE=r.bind(null,i,0,4),t.readDoubleBE=r.bind(null,o,4,0);}(),t}function n(t,e,r){e[r]=255&t,e[r+1]=t>>>8&255,e[r+2]=t>>>16&255,e[r+3]=t>>>24;}function s(t,e,r){e[r]=t>>>24,e[r+1]=t>>>16&255,e[r+2]=t>>>8&255,e[r+3]=255&t;}function i(t,e){return (t[e]|t[e+1]<<8|t[e+2]<<16|t[e+3]<<24)>>>0}function o(t,e){return (t[e]<<24|t[e+1]<<16|t[e+2]<<8|t[e+3])>>>0}return r=1,e=t(t)}()),i={};var o=(n||(n=1,function(){var t=i;t.length=function(t){for(var e=0,r=0,n=0;n<t.length;++n)(r=t.charCodeAt(n))<128?e+=1:r<2048?e+=2:55296==(64512&r)&&56320==(64512&t.charCodeAt(n+1))?(++n,e+=4):e+=3;return e},t.read=function(t,e,r){if(r-e<1)return "";for(var n,s=null,i=[],o=0;e<r;)(n=t[e++])<128?i[o++]=n:n>191&&n<224?i[o++]=(31&n)<<6|63&t[e++]:n>239&&n<365?(n=((7&n)<<18|(63&t[e++])<<12|(63&t[e++])<<6|63&t[e++])-65536,i[o++]=55296+(n>>10),i[o++]=56320+(1023&n)):i[o++]=(15&n)<<12|(63&t[e++])<<6|63&t[e++],o>8191&&((s||(s=[])).push(String.fromCharCode.apply(String,i)),o=0);return s?(o&&s.push(String.fromCharCode.apply(String,i.slice(0,o))),s.join("")):String.fromCharCode.apply(String,i.slice(0,o))},t.write=function(t,e,r){for(var n,s,i=r,o=0;o<t.length;++o)(n=t.charCodeAt(o))<128?e[r++]=n:n<2048?(e[r++]=n>>6|192,e[r++]=63&n|128):55296==(64512&n)&&56320==(64512&(s=t.charCodeAt(o+1)))?(n=65536+((1023&n)<<10)+(1023&s),++o,e[r++]=n>>18|240,e[r++]=n>>12&63|128,e[r++]=n>>6&63|128,e[r++]=63&n|128):(e[r++]=n>>12|224,e[r++]=n>>6&63|128,e[r++]=63&n|128);return r-i};}()),i),a=t(o);class l{static create(t){if(t instanceof l)return t;if(t instanceof Uint8Array)return new l(t);throw Error("illegal buffer")}buf;pos;len;constructor(t){this.buf=t,this.pos=0,this.len=t.length;}slice(t,e,r){return t.subarray(e,r)}indexOutOfRange(t,e){return RangeError("index out of range: "+t.pos+" + "+(e||1)+" > "+t.len)}uint32(){let t=4294967295;if(t=(127&this.buf[this.pos])>>>0,this.buf[this.pos++]<128)return t;if(t=(t|(127&this.buf[this.pos])<<7)>>>0,this.buf[this.pos++]<128)return t;if(t=(t|(127&this.buf[this.pos])<<14)>>>0,this.buf[this.pos++]<128)return t;if(t=(t|(127&this.buf[this.pos])<<21)>>>0,this.buf[this.pos++]<128)return t;if(t=(t|(15&this.buf[this.pos])<<28)>>>0,this.buf[this.pos++]<128)return t;if((this.pos+=5)>this.len)throw this.pos=this.len,this.indexOutOfRange(this,10);return t}int32(){return 0|this.uint32()}float(){if(this.pos+4>this.len)throw this.indexOutOfRange(this,4);const t=s.readFloatLE(this.buf,this.pos);return this.pos+=4,t}bytes(){const t=this.uint32(),e=this.pos,r=this.pos+t;if(r>this.len)throw this.indexOutOfRange(this,t);return this.pos+=t,e==r?new Uint8Array(0):this.slice(this.buf,e,r)}string(){const t=this.bytes();return a.read(t,0,t.length)}skip(t){if("number"==typeof t){if(this.pos+t>this.len)throw this.indexOutOfRange(this,t);this.pos+=t;}else do{if(this.pos>=this.len)throw this.indexOutOfRange(this)}while(128&this.buf[this.pos++]);return this}skipType(t){switch(t){case 0:this.skip();break;case 1:this.skip(8);break;case 2:this.skip(this.uint32());break;case 3:for(;4!=(t=7&this.uint32());)this.skipType(t);break;case 5:this.skip(4);break;default:throw Error("invalid wire type "+t+" at offset "+this.pos)}return this}}class h{static decode(t,e){t=l.create(t);const r=null==e?t.len:t.pos+e,n=new h;for(;t.pos<r;){const e=t.uint32();switch(e>>>3){case 1:n.x=t.float();break;case 2:n.y=t.float();break;case 3:n.width=t.float();break;case 4:n.height=t.float();break;default:t.skipType(7&e);}}return n}x=0;y=0;width=0;height=0;constructor(t){t&&(null!=t.x&&(this.x=t.x),null!=t.y&&(this.y=t.y),null!=t.width&&(this.width=t.width),null!=t.height&&(this.height=t.height));}}class u{static decode(t,e){t=l.create(t);let r=null==e?t.len:t.pos+e,n=new u;for(;t.pos<r;){let e=t.uint32();switch(e>>>3){case 1:n.a=t.float();break;case 2:n.b=t.float();break;case 3:n.c=t.float();break;case 4:n.d=t.float();break;case 5:n.tx=t.float();break;case 6:n.ty=t.float();break;default:t.skipType(7&e);}}return n}a=0;b=0;c=0;d=0;tx=0;ty=0;constructor(t){t&&(null!=t.a&&(this.a=t.a),null!=t.b&&(this.b=t.b),null!=t.c&&(this.c=t.c),null!=t.d&&(this.d=t.d),null!=t.tx&&(this.tx=t.tx),null!=t.ty&&(this.ty=t.ty));}}class c{static decode(t,e){t=l.create(t);const r=null==e?t.len:t.pos+e,n=new c;for(;t.pos<r;){const e=t.uint32();if(e>>>3==1)n.d=t.string();else t.skipType(7&e);}return n}d="";constructor(t){t&&null!=t.d&&(this.d=t.d);}}class f{static decode(t,e){t=l.create(t);const r=null==e?t.len:t.pos+e,n=new f;for(;t.pos<r;){const e=t.uint32();switch(e>>>3){case 1:n.x=t.float();break;case 2:n.y=t.float();break;case 3:n.width=t.float();break;case 4:n.height=t.float();break;case 5:n.cornerRadius=t.float();break;default:t.skipType(7&e);}}return n}x=0;y=0;width=0;height=0;cornerRadius=0;constructor(t){t&&(null!=t.x&&(this.x=t.x),null!=t.y&&(this.y=t.y),null!=t.width&&(this.width=t.width),null!=t.height&&(this.height=t.height),null!=t.cornerRadius&&(this.cornerRadius=t.cornerRadius));}}class d{static decode(t,e){t=l.create(t);const r=null==e?t.len:t.pos+e,n=new d;for(;t.pos<r;){const e=t.uint32();switch(e>>>3){case 1:n.x=t.float();break;case 2:n.y=t.float();break;case 3:n.radiusX=t.float();break;case 4:n.radiusY=t.float();break;default:t.skipType(7&e);}}return n}x=0;y=0;radiusX=0;radiusY=0;constructor(t){t&&(null!=t.x&&(this.x=t.x),null!=t.y&&(this.y=t.y),null!=t.radiusX&&(this.radiusX=t.radiusX),null!=t.radiusY&&(this.radiusY=t.radiusY));}}let p$1 = class p{static decode(t,e){t=l.create(t);const r=null==e?t.len:t.pos+e,n=new p;for(;t.pos<r;){const e=t.uint32();switch(e>>>3){case 1:n.r=t.float();break;case 2:n.g=t.float();break;case 3:n.b=t.float();break;case 4:n.a=t.float();break;default:t.skipType(7&e);}}return n}r=0;g=0;b=0;a=0;constructor(t){t&&(null!=t.r&&(this.r=t.r),null!=t.g&&(this.g=t.g),null!=t.b&&(this.b=t.b),null!=t.a&&(this.a=t.a));}};class w{static decode(t,e){t=l.create(t);const r=null==e?t.len:t.pos+e,n=new w;for(;t.pos<r;){const e=t.uint32();switch(e>>>3){case 1:n.fill=p$1.decode(t,t.uint32());break;case 2:n.stroke=p$1.decode(t,t.uint32());break;case 3:n.strokeWidth=t.float();break;case 4:n.lineCap=t.int32();break;case 5:n.lineJoin=t.int32();break;case 6:n.miterLimit=t.float();break;case 7:n.lineDashI=t.float();break;case 8:n.lineDashII=t.float();break;case 9:n.lineDashIII=t.float();break;default:t.skipType(7&e);}}return n}fill=null;stroke=null;strokeWidth=0;lineCap=0;lineJoin=0;miterLimit=0;lineDashI=0;lineDashII=0;lineDashIII=0;constructor(t){t&&(null!=t.fill&&(this.fill=t.fill),null!=t.lineCap&&(this.lineCap=t.lineCap),null!=t.lineDashI&&(this.lineDashI=t.lineDashI),null!=t.lineDashII&&(this.lineDashII=t.lineDashII),null!=t.lineDashIII&&(this.lineDashIII=t.lineDashIII),null!=t.lineJoin&&(this.lineJoin=t.lineJoin),null!=t.miterLimit&&(this.miterLimit=t.miterLimit),null!=t.stroke&&(this.stroke=t.stroke),null!=t.strokeWidth&&(this.strokeWidth=t.strokeWidth));}}class b{static decode(t,e){t=l.create(t);const r=null==e?t.len:t.pos+e,n=new b;for(;t.pos<r;){let e=t.uint32();switch(e>>>3){case 1:n.type=t.int32();break;case 2:n.shape=c.decode(t,t.uint32());break;case 3:n.rect=f.decode(t,t.uint32());break;case 4:n.ellipse=d.decode(t,t.uint32());break;case 10:n.styles=w.decode(t,t.uint32());break;case 11:n.transform=u.decode(t,t.uint32());break;default:t.skipType(7&e);}}return n}type=0;shape=null;rect=null;ellipse=null;styles=null;transform=null;$oneOfFields=["shape","rect","ellipse"];$fieldMap={};get args(){const t=Object.keys(this);for(let e=t.length-1;e>-1;--e){const r=t[e],n=this[r];if(1==this.$fieldMap[r]&&null!=n)return r}return ""}set args(t){for(var e=0;e<this.$oneOfFields.length;++e){const r=this.$oneOfFields[e];r!=t&&delete this[r];}}constructor(t){t&&(null!=t.type&&(this.type=t.type),null!=t.ellipse&&(this.ellipse=t.ellipse),null!=t.rect&&(this.rect=t.rect),null!=t.shape&&(this.shape=t.shape),null!=t.styles&&(this.styles=t.styles),null!=t.transform&&(this.transform=t.transform));for(var e=0;e<this.$oneOfFields.length;++e)this.$fieldMap[this.$oneOfFields[e]]=1;}}class g{static decode(t,e){t=l.create(t);const r=null==e?t.len:t.pos+e,n=new g;for(;t.pos<r;){const e=t.uint32();switch(e>>>3){case 1:n.alpha=t.float();break;case 2:n.layout=h.decode(t,t.uint32());break;case 3:n.transform=u.decode(t,t.uint32());break;case 4:n.clipPath=t.string();break;case 5:n.shapes&&n.shapes.length||(n.shapes=[]),n.shapes.push(b.decode(t,t.uint32()));break;default:t.skipType(7&e);}}return n}shapes=[];alpha=0;layout=null;transform=null;clipPath="";constructor(t){t&&(null!=t.alpha&&(this.alpha=t.alpha),null!=t.clipPath&&(this.clipPath=t.clipPath),null!=t.layout&&(this.layout=t.layout),null!=t.shapes&&(this.shapes=t.shapes),null!=t.transform&&(this.transform=t.transform));}}class y{static decode(t,e){t=l.create(t);const r=null==e?t.len:t.pos+e,n=new y;for(;t.pos<r;){const e=t.uint32();switch(e>>>3){case 1:n.imageKey=t.string();break;case 2:n.frames&&n.frames.length||(n.frames=[]),n.frames.push(g.decode(t,t.uint32()));break;case 3:n.matteKey=t.string();break;default:t.skipType(7&e);}}return n}frames=[];imageKey="";matteKey="";constructor(t){t&&(null!=t.frames&&(this.frames=t.frames),null!=t.imageKey&&(this.imageKey=t.imageKey),null!=t.matteKey&&(this.matteKey=t.matteKey));}}class m{static decode(t,e){t=l.create(t);let r=null==e?t.len:t.pos+e,n=new m;for(;t.pos<r;){let e=t.uint32();switch(e>>>3){case 1:n.viewBoxWidth=t.float();break;case 2:n.viewBoxHeight=t.float();break;case 3:n.fps=t.int32();break;case 4:n.frames=t.int32();break;default:t.skipType(7&e);}}return n}viewBoxWidth=0;viewBoxHeight=0;fps=0;frames=0;constructor(t){t&&(null!=t.viewBoxWidth&&(this.viewBoxWidth=t.viewBoxWidth),null!=t.viewBoxHeight&&(this.viewBoxHeight=t.viewBoxHeight),null!=t.fps&&(this.fps=t.fps),null!=t.frames&&(this.frames=t.frames));}}const k=Object.freeze({});class T{static decode(t,e){t=l.create(t);const r=null==e?t.len:t.pos+e,n=new T;let s,i;for(;t.pos<r;){const e=t.uint32();switch(e>>>3){case 1:n.version=t.string();break;case 2:n.params=m.decode(t,t.uint32());break;case 3:{n.images==k&&(n.images={});const e=t.uint32()+t.pos;for(s="",i=[];t.pos<e;){let e=t.uint32();switch(e>>>3){case 1:s=t.string();break;case 2:i=t.bytes();break;default:t.skipType(7&e);}}n.images[s]=i;break}case 4:n.sprites&&n.sprites.length||(n.sprites=[]),n.sprites.push(y.decode(t,t.uint32()));break;default:t.skipType(7&e);}}return n}version="";params=null;images=k;sprites=[];constructor(t){t&&(null!=t.version&&(this.version=t.version),null!=t.images&&(this.images=t.images),null!=t.params&&(this.params=t.params),null!=t.sprites&&(this.sprites=t.sprites));}}const M=new Array(256),P=new Array(256);for(let t=0;t<8;t++)M[t]=1<<t;for(let t=8;t<256;t++)M[t]=M[t-4]^M[t-5]^M[t-6]^M[t-8];for(let t=0;t<255;t++)P[M[t]]=t;var j=Uint8Array,J=Uint16Array,X=Int32Array,Q=new j([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),V=new j([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),G=function(t,e){for(var r=new J(31),n=0;n<31;++n)r[n]=e+=1<<t[n-1];var s=new X(r[30]);for(n=1;n<30;++n)for(var i=r[n];i<r[n+1];++i)s[i]=i-r[n]<<5|n;return {b:r,r:s}},q=G(Q,2),tt$1=q.b,et=q.r;tt$1[28]=258,et[258]=28;for(var rt=G(V,0).r,nt=new J(32768),st=0;st<32768;++st){var it=(43690&st)>>1|(21845&st)<<1;it=(61680&(it=(52428&it)>>2|(13107&it)<<2))>>4|(3855&it)<<4,nt[st]=((65280&it)>>8|(255&it)<<8)>>1;}var ot=function(t,e,r){for(var n=t.length,s=0,i=new J(e);s<n;++s)t[s]&&++i[t[s]-1];var o,a=new J(e);for(s=1;s<e;++s)a[s]=a[s-1]+i[s-1]<<1;for(o=new J(n),s=0;s<n;++s)t[s]&&(o[s]=nt[a[t[s]-1]++]>>15-t[s]);return o},at=new j(288);for(st=0;st<144;++st)at[st]=8;for(st=144;st<256;++st)at[st]=9;for(st=256;st<280;++st)at[st]=7;for(st=280;st<288;++st)at[st]=8;var lt=new j(32);for(st=0;st<32;++st)lt[st]=5;ot(at,9);ot(lt,5);var Tt=new j(0);var At="undefined"!=typeof TextDecoder&&new TextDecoder;try{At.decode(Tt,{stream:!0});}catch(t){}

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
                debugger
                resolve(filePath);
            },
            fail() {
                debugger
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
            const movieData = T.decode(inflateData);
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
    debugger
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
    debugger
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
        genImageSource(data, filename, prefix).then((src) => {
          debugger
          img.src = src
        });
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
     * 动画结束帧
     */
    endValue = 0;
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
        this.endValue = endValue;
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
        const { duration: D, loopStart: LS, loopDuration: LD, startValue: SV, endValue: EV, fillRule: FR, } = this;
        // 本轮动画已消耗的时间比例 currentFrication
        let CF;
        // 运行时间 大于等于 循环持续时间
        if (DT >= LD) {
            // 循环已结束
            CF = FR ? 0.0 : 1.0;
            this.isRunning = false;
        }
        else {
            // 本轮动画已消耗的时间比例 = (本轮动画已消耗的时间 + 循环播放开始帧与动画开始帧之间的时间偏差) / 动画持续时间
            CF = DT <= D ? DT / D : (((DT - LS) % (D - LS)) + LS) / D;
        }
        this.onUpdate(((EV - SV) * CF + SV) << 0, CF);
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
     */
    async setConfig(options, component) {
        let config;
        if (typeof options == "string") {
            config = { container: options };
        }
        else {
            config = options;
        }
        const { startFrame, endFrame } = config;
        if (startFrame != undefined && endFrame != undefined) {
            // if (startFrame < 0) {
            //   throw new Error("StartFrame should greater then zero");
            // }
            // if (endFrame < 0) {
            //   throw new Error("EndFrame should greater then zero");
            // }
            if (startFrame > endFrame) {
                throw new Error("StartFrame should greater than EndFrame");
            }
        }
        Object.assign(this.config, {
            loop: config.loop ?? 0,
            fillMode: config.fillMode ?? "forwards" /* PLAYER_FILL_MODE.FORWARDS */,
            playMode: config.playMode ?? "forwards" /* PLAYER_PLAY_MODE.FORWARDS */,
            startFrame: startFrame ?? 0,
            endFrame: endFrame ?? 0,
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
        debugger
        return this.brush.loadImage(images, filename);
    }
    /**
     * 开始播放事件回调
     */
    onStart;
    /**
     * 重新播放事件回调
     */
    onResume;
    /**
     * 暂停播放事件回调
     */
    onPause;
    /**
     * 停止播放事件回调
     */
    onStop;
    /**
     * 播放中事件回调
     */
    onProcess;
    /**
     * 结束播放事件回调
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
        if (!this.entity)
            return;
        if (frame >= this.entity.frames || frame < 0) {
            return;
        }
        this.pause();
        this.currFrame = frame;
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
        const lastFrame = frames - 1;
        const start = startFrame > 0 ? startFrame : 0;
        const end = endFrame > 0 ? endFrame : lastFrame;
        // 如果开始动画的当前帧是最后一帧，重置为开始帧
        if (this.currFrame == lastFrame) {
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
        if (endFrame > 0 && endFrame > startFrame) {
            frames = endFrame - startFrame;
        }
        else if (endFrame <= 0 && startFrame > 0) {
            frames -= startFrame;
        }
        // 每帧持续的时间
        const frameDuration = 1000 / fps;
        // 更新动画基础信息
        this.animator.setConfig(
        // duration = frames * (1 / fps) * 1000
        frames * frameDuration, 
        // loopStart = (loopStartFrame - startFrame) * (1 / fps) * 1000
        loopStartFrame > startFrame
            ? (loopStartFrame - startFrame) * frameDuration
            : 0, loop <= 0 ? Infinity : loop, +(fillMode == "backwards" /* PLAYER_FILL_MODE.BACKWARDS */));
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
            this.onProcess?.(this.currFrame);
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
