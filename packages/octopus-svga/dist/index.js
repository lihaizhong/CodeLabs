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
var _b = freb(fdeb, 0), fd = _b.b, revfd = _b.r;
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
var flm = /*#__PURE__*/ hMap(flt, 9, 0), flrm = /*#__PURE__*/ hMap(flt, 9, 1);
// fixed distance map
var fdm = /*#__PURE__*/ hMap(fdt, 5, 0), fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
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
// zlib start
var zls = function (d, dict) {
    if ((d[0] & 15) != 8 || (d[0] >> 4) > 7 || ((d[0] << 8 | d[1]) % 31))
        err(6, 'invalid zlib data');
    if ((d[1] >> 5 & 1) == 1)
        err(6, 'invalid zlib data: ' + (d[1] & 32 ? 'need' : 'unexpected') + ' dictionary');
    return (d[1] >> 3 & 4) + 2;
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
    td.decode(et, { stream: true });
    tds = 1;
}
catch (e) { }

const e=()=>{};const t=async(e,n=[],r=0)=>{try{return e()}catch(o){if(r>=n.length)throw o;return s=()=>t(e,n,++r),a=n[r],new Promise((e=>setTimeout((()=>e(s())),a)))}var s,a;},n=4096,r=new Uint16Array(n);function s(e,t,s){if(t<0||s>e.length)throw new RangeError("Index out of range");if(s-t<1)return "";const a=[];let o=0;const i=e=>{a.push(String.fromCharCode.apply(null,Array.from(e)));};let l=true;for(let n=t;n<s;n++)if(e[n]>127){l=false;break}if(l){for(let a=t;a<s;a+=n){const t=Math.min(a+n,s)-a;for(let n=0;n<t;n++)r[n]=e[a+n];i(r.subarray(0,t));}return a.join("")}for(let a=t;a<s;){const t=e[a++];if(t<128){r[o++]=t,o===n&&(i(r),o=0);continue}let l;if(o>0&&(i(r.subarray(0,o)),o=0),192==(224&t)&&a<s)l=(31&t)<<6|63&e[a++];else if(224==(240&t)&&a+1<s)l=(15&t)<<12|(63&e[a++])<<6|63&e[a++];else if(240==(248&t)&&a+2<s){if(l=(7&t)<<18|(63&e[a++])<<12|(63&e[a++])<<6|63&e[a++],l>65535){l-=65536,r[o++]=55296+(l>>10),r[o++]=56320+(1023&l),o>=4094&&(i(r.subarray(0,o)),o=0);continue}}else for(l=65533;a<s&&128==(192&e[a]);)a++;r[o++]=l,o>=4093&&(i(r.subarray(0,o)),o=0);}return o>0&&i(r.subarray(0,o)),a.join("")}class a{plugins=[];platformVersion="0.0.1";version="";globals={env:"unknown",br:null,dpr:1};noop=e;retry=t;constructor(e,t){this.version=t||"",this.plugins=e,this.globals.env=this.autoEnv();}init(){this.globals.br=this.useBridge(),this.globals.dpr=this.usePixelRatio();const e=this.plugins.reduce(((e,t)=>(e[t.name]=t,e)),{}),t=this.plugins.map((e=>e.name));this.usePlugins(e,t,{});}autoEnv(){if("undefined"!=typeof window)return "h5";if("undefined"!=typeof tt)return "tt";if("undefined"!=typeof my)return "alipay";if("undefined"!=typeof wx)return "weapp";throw new Error("Unsupported app")}useBridge(){switch(this.globals.env){case "h5":return globalThis;case "alipay":return my;case "tt":return tt;case "weapp":return wx}return {}}usePixelRatio(){const{env:e,br:t}=this.globals;return "h5"===e?devicePixelRatio:"getWindowInfo"in t?t.getWindowInfo().pixelRatio:"getSystemInfoSync"in t?t.getSystemInfoSync().pixelRatio:1}usePlugins(e,t,n){t.forEach((t=>{const r=e[t];if(!n[t]){if(void 0===r)throw new Error(`Plugin ${t} not found`);if(Array.isArray(r.dependencies)){for(const n of r.dependencies)if("function"!=typeof e[n]?.install)throw new Error(`Plugin ${t} depends on plugin ${n}, but ${n} is not found`);this.usePlugins(e,r.dependencies,n);}this.installPlugin(r),n[r.name]=true;}}));}switch(e){this.globals.env=e,this.init();}}var i={name:"getCanvas",install(){const{retry:e}=this,{env:t,br:n,dpr:r}=this.globals,s=[50,100,100];function a(e,n,s){if(!e)throw new Error("canvas not found.");const a=1365,o=e.getContext("2d");let i=n*r,l=s*r;return "weapp"===t&&(i>a||l>a)&&(i>l?(l=l/i*a,i=a):(i=i/l*a,l=a)),e.width=i,e.height=l,{canvas:e,context:o}}if("h5"===t){const t=e=>document.querySelector(e);return n=>e((()=>{const e=t(`canvas[canvas-id=${n.slice(1)}]`)||t(n);return a(e,e?.clientWidth,e?.clientHeight)}),s)}return (t,r)=>e((()=>new Promise(((e,s)=>{let o=n.createSelectorQuery();r&&(o=o.in(r)),o.select(t).fields({node:true,size:true},(t=>{const{node:n,width:r,height:o}=t||{};try{e(a(n,r,o));}catch(e){s(e);}})).exec();}))),s)}},l={name:"decode",install(){const{env:e,br:t}=this.globals,n=(e,t="image/png")=>`data:${t};base64,${e}`,r={toBuffer(e){const{buffer:t,byteOffset:n,byteLength:r}=e;return t.slice(n,n+r)},bytesToString(e){let t="";for(let n=0;n<e.length;n+=8192){const r=e.slice(n,n+8192);t+=String.fromCharCode.apply(null,Array.from(r));}return t}};if("h5"===e){const e=new TextDecoder("utf-8",{fatal:true});r.toDataURL=e=>n(btoa(r.bytesToString(e))),r.utf8=(t,n,r)=>e.decode(t.subarray(n,r));}else r.toDataURL=e=>n(t.arrayBufferToBase64(r.toBuffer(e))),r.utf8=s;return r}},c={name:"remote",install(){const{env:e,br:t}=this.globals,n=e=>/^(blob:)?http(s)?:\/\//.test(e);if("h5"===e)return {is:n,fetch:e=>fetch(e).then((e=>{if(e.ok)return e.arrayBuffer();throw new Error(`HTTP error, status=${e.status}, statusText=${e.statusText}`)}))};function r(e,n){return new Promise(((r,s)=>{t.request({url:e,dataType:"arraybuffer",responseType:"arraybuffer",enableCache:n,success:e=>r(e.data),fail:s});})).catch((t=>{const n=t.errMsg||t.errorMessage||t.message;if(n.includes("ERR_CACHE_WRITE_FAILURE")||n.includes("ERR_CACHE_WRITE_FAILED"))return r(e,false);throw t}))}return {is:n,fetch:e=>r(e,true)}}},u={name:"local",install(){const{env:e,br:t}=this.globals;if("h5"===e)return null;const n=t.getFileSystemManager();return {write:(e,t)=>new Promise(((r,s)=>{n.writeFile({filePath:t,data:e,success:()=>r(t),fail:s});})),read:e=>new Promise(((t,r)=>{n.readFile({filePath:e,success:e=>t(e.data),fail:r});})),remove:e=>new Promise(((t,r)=>{n.unlink({filePath:e,success:()=>t(e),fail:r});}))}}},f={name:"image",dependencies:["local","path","decode"],install(){const{local:e,decode:t}=this,{env:n}=this.globals;let r=(e,n)=>"string"==typeof e?e:t.toDataURL(e);function s(e,t){return new Promise(((n,r)=>{e.onload=()=>n(e),e.onerror=()=>r(new Error(`SVGA LOADING FAILURE: ${e.src}`)),e.src=t;}))}function a(e){e.onload=null,e.onerror=null,e.src="";}return "h5"===n?{create:e=>new Image,load:(e,n,a)=>n instanceof Uint8Array&&"createImageBitmap"in globalThis?createImageBitmap(new Blob([t.toBuffer(n)])):n instanceof ImageBitmap?Promise.resolve(n):s(e(),r(n,a)),release:a}:("weapp"===n&&(r=async(n,r)=>"string"==typeof n?n:e.write(t.toBuffer(n),r).catch((e=>(console.warn(`image write fail: ${e.errorMessage||e.errMsg||e.message}`),t.toDataURL(n))))),{create:e=>e.createImage(),load:async(e,t,n)=>{const a=await r(t,n);return s(e(),a)},release:a})}},h={name:"now",install(){const{env:e,br:t}=this.globals,n="h5"===e?performance:"tt"===e?t.performance:t.getPerformance();return "function"==typeof n?.now?n.now()-Date.now()>0?()=>n.now()/1e3:()=>n.now():()=>Date.now()}},g={name:"getOfsCanvas",install(){const{env:e}=this.globals;let t;return t="h5"===e?e=>new OffscreenCanvas(e.width,e.height):"alipay"===e?e=>my.createOffscreenCanvas(e):"tt"===e?e=>{const t=tt.createOffscreenCanvas();return t.width=e.width,t.height=e.height,t}:e=>wx.createOffscreenCanvas(e),e=>{const n=e.type||"2d",r=t({...e,type:n}),s=r.getContext(n);return {canvas:r,context:s}}}},d={name:"path",install(){const{env:e,br:t}=this.globals,n=e=>e.substring(e.lastIndexOf("/")+1);if("h5"===e)return {USER_DATA_PATH:"",filename:n,resolve:(e,t)=>`${t?`${t}__`:""}${e}`};const{USER_DATA_PATH:r}="tt"===e?tt.getEnvInfoSync().common:t.env;return {USER_DATA_PATH:r,filename:n,resolve:(e,t)=>`${r}/${t?`${t}__`:""}${e}`}}},m={name:"rAF",dependencies:["now"],install(){const{env:e}=this.globals;function t(){return e=>setTimeout(e,Math.max(0,16-Date.now()%16))}if("h5"===e){const e="requestAnimationFrame"in globalThis?requestAnimationFrame:t();return (t,n)=>e(n)}return (e,n)=>{try{return e.requestAnimationFrame(n)}catch(e){return console.warn(e.message),t()(n)}}}};

var version="0.2.0";

class EnhancedPlatform extends a {
    now;
    path;
    remote;
    local;
    decode;
    image;
    rAF;
    getCanvas;
    getOfsCanvas;
    constructor() {
        super([
            i,
            g,
            l,
            c,
            u,
            f,
            h,
            d,
            m,
        ], version);
        this.init();
    }
    installPlugin(plugin) {
        const value = plugin.install.call(this);
        Object.defineProperty(this, plugin.name, {
            get: () => value,
            enumerable: true,
            configurable: true,
        });
    }
}
const platform = new EnhancedPlatform();
// benchmark.log(
//   "PLATFORM VERSION",
//   platform.platformVersion,
//   "VERSION",
//   platform.version
// );

function readFloatLEImpl() {
    // 使用静态DataView池
    const DATA_VIEW_POOL_SIZE = 4;
    const dataViewPool = Array(DATA_VIEW_POOL_SIZE)
        .fill(0)
        .map(() => new DataView(new ArrayBuffer(8))); // 使用8字节支持double
    let currentViewIndex = 0;
    return function readFloatLE(buf, pos) {
        if (pos < 0 || pos + 4 > buf.length)
            throw new RangeError("Index out of range");
        // 轮换使用DataView池中的实例
        const view = dataViewPool[currentViewIndex];
        currentViewIndex = (currentViewIndex + 1) % DATA_VIEW_POOL_SIZE;
        // 直接设置字节，避免创建subarray
        const u8 = new Uint8Array(view.buffer);
        u8[0] = buf[pos];
        u8[1] = buf[pos + 1];
        u8[2] = buf[pos + 2];
        u8[3] = buf[pos + 3];
        return view.getFloat32(0, true);
    };
}
const readFloatLE = readFloatLEImpl();

class Reader {
    // 添加静态缓存，用于常用的空数组
    static EMPTY_UINT8ARRAY = new Uint8Array(0);
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
    indexOutOfRange(reader, writeLength) {
        return new RangeError("index out of range: " +
            reader.pos +
            " + " +
            (writeLength || 1) +
            " > " +
            reader.len);
    }
    /**
     * 将复杂逻辑分离到单独方法
     * @returns
     */
    readVarint32Slow() {
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
    getBytesRange() {
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
    skip(length) {
        if (typeof length === "number") {
            if (this.pos + length > this.len) {
                throw this.indexOutOfRange(this, length);
            }
            this.pos += length;
            return this;
        }
        // 变长整数跳过优化 - 使用位运算
        const buf = this.buf;
        let pos = this.pos;
        const len = this.len;
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
        const end = length === void 0 ? reader.len : reader.pos + length;
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
            if (properties.x !== null) {
                this.x = properties.x;
            }
            if (properties.y !== null) {
                this.y = properties.y;
            }
            if (properties.width !== null) {
                this.width = properties.width;
            }
            if (properties.height !== null) {
                this.height = properties.height;
            }
        }
    }
}

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
        let end = length === void 0 ? reader.len : reader.pos + length;
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
            if (properties.a !== null) {
                this.a = properties.a;
            }
            if (properties.b !== null) {
                this.b = properties.b;
            }
            if (properties.c !== null) {
                this.c = properties.c;
            }
            if (properties.d !== null) {
                this.d = properties.d;
            }
            if (properties.tx !== null) {
                this.tx = properties.tx;
            }
            if (properties.ty !== null) {
                this.ty = properties.ty;
            }
        }
    }
}

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
        const end = length === void 0 ? reader.len : reader.pos + length;
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
            if (properties.d !== null) {
                this.d = properties.d;
            }
        }
    }
}

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
        const end = length === void 0 ? reader.len : reader.pos + length;
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
            if (properties.x !== null) {
                this.x = properties.x;
            }
            if (properties.y !== null) {
                this.y = properties.y;
            }
            if (properties.width !== null) {
                this.width = properties.width;
            }
            if (properties.height !== null) {
                this.height = properties.height;
            }
            if (properties.cornerRadius !== null) {
                this.cornerRadius = properties.cornerRadius;
            }
        }
    }
}

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
        const end = length === void 0 ? reader.len : reader.pos + length;
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
            if (properties.x !== null) {
                this.x = properties.x;
            }
            if (properties.y !== null) {
                this.y = properties.y;
            }
            if (properties.radiusX !== null) {
                this.radiusX = properties.radiusX;
            }
            if (properties.radiusY !== null) {
                this.radiusY = properties.radiusY;
            }
        }
    }
}

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
        const end = length === void 0 ? reader.len : reader.pos + length;
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
            if (properties.r !== null) {
                this.r = properties.r;
            }
            if (properties.g !== null) {
                this.g = properties.g;
            }
            if (properties.b !== null) {
                this.b = properties.b;
            }
            if (properties.a !== null) {
                this.a = properties.a;
            }
        }
    }
}

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
        const end = length === void 0 ? reader.len : reader.pos + length;
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
            if (properties.fill !== null) {
                this.fill = properties.fill;
            }
            if (properties.lineCap !== null) {
                this.lineCap = properties.lineCap;
            }
            if (properties.lineDashI !== null) {
                this.lineDashI = properties.lineDashI;
            }
            if (properties.lineDashII !== null) {
                this.lineDashII = properties.lineDashII;
            }
            if (properties.lineDashIII !== null) {
                this.lineDashIII = properties.lineDashIII;
            }
            if (properties.lineJoin !== null) {
                this.lineJoin = properties.lineJoin;
            }
            if (properties.miterLimit !== null) {
                this.miterLimit = properties.miterLimit;
            }
            if (properties.stroke !== null) {
                this.stroke = properties.stroke;
            }
            if (properties.strokeWidth !== null) {
                this.strokeWidth = properties.strokeWidth;
            }
        }
    }
}

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
        const end = length === void 0 ? reader.len : reader.pos + length;
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
            if (this.$fieldMap[key] === 1 && value !== null) {
                return key;
            }
        }
        return "";
    }
    set args(name) {
        for (var i = 0; i < this.$oneOfFields.length; ++i) {
            const key = this.$oneOfFields[i];
            if (key !== name) {
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
            if (properties.type !== null) {
                this.type = properties.type;
            }
            if (properties.ellipse !== null) {
                this.ellipse = properties.ellipse;
            }
            if (properties.rect !== null) {
                this.rect = properties.rect;
            }
            if (properties.shape !== null) {
                this.shape = properties.shape;
            }
            if (properties.styles !== null) {
                this.styles = properties.styles;
            }
            if (properties.transform !== null) {
                this.transform = properties.transform;
            }
        }
        for (var i = 0; i < this.$oneOfFields.length; ++i) {
            this.$fieldMap[this.$oneOfFields[i]] = 1;
        }
    }
}

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
        const end = length === void 0 ? reader.len : reader.pos + length;
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
            if (properties.alpha !== null) {
                this.alpha = properties.alpha;
            }
            if (properties.clipPath !== null) {
                this.clipPath = properties.clipPath;
            }
            if (properties.layout !== null) {
                this.layout = properties.layout;
            }
            if (properties.shapes !== null) {
                this.shapes = properties.shapes;
            }
            if (properties.transform !== null) {
                this.transform = properties.transform;
            }
        }
    }
}

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
        const end = length === void 0 ? reader.len : reader.pos + length;
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
            if (properties.frames !== null) {
                this.frames = properties.frames;
            }
            if (properties.imageKey !== null) {
                this.imageKey = properties.imageKey;
            }
            if (properties.matteKey !== null) {
                this.matteKey = properties.matteKey;
            }
        }
    }
}

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
        let end = length === void 0 ? reader.len : reader.pos + length;
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
            if (properties.viewBoxWidth !== null) {
                this.viewBoxWidth = properties.viewBoxWidth;
            }
            if (properties.viewBoxHeight !== null) {
                this.viewBoxHeight = properties.viewBoxHeight;
            }
            if (properties.fps !== null) {
                this.fps = properties.fps;
            }
            if (properties.frames !== null) {
                this.frames = properties.frames;
            }
        }
    }
}

class MovieEntity {
    static EMPTY_OBJECT = Object.freeze({});
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
        const end = length === void 0 ? reader.len : reader.pos + length;
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
                    if (message.images === MovieEntity.EMPTY_OBJECT) {
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
    images = MovieEntity.EMPTY_OBJECT;
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
            if (properties.version !== null) {
                this.version = properties.version;
            }
            if (properties.images !== null) {
                this.images = properties.images;
            }
            if (properties.params !== null) {
                this.params = properties.params;
            }
            if (properties.sprites !== null) {
                this.sprites = properties.sprites;
            }
        }
    }
}

function parseSvga(data) {
    if (!(data instanceof Uint8Array)) {
        throw new Error("Invalid data type");
    }
    return MovieEntity.decode(data);
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
    size = {
        width: 0,
        height: 0
    };
    /**
     * svga 帧率
     */
    fps = 20;
    /**
     * 是否可以编辑svga文件
     */
    locked = false;
    /**
     * svga 帧数
     */
    frames = 0;
    /**
     * svga 二进制图片合集
     */
    images = {};
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
            if (mFrame.shapes[0]?.type === 3 && lastShapes) {
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
                    transform: void 0,
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
            if (mShape.type === 0 && shape) {
                shapes.push({
                    type: "shape" /* PlatformVideo.SHAPE_TYPE.SHAPE */,
                    path: shape,
                    styles: SS,
                    transform: ST,
                });
            }
            else if (mShape.type === 1 && rect) {
                shapes.push({
                    type: "rect" /* PlatformVideo.SHAPE_TYPE.RECT */,
                    path: rect,
                    styles: SS,
                    transform: ST,
                });
            }
            else if (mShape.type === 2 && ellipse) {
                shapes.push({
                    type: "ellipse" /* PlatformVideo.SHAPE_TYPE.ELLIPSE */,
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
    static parseVideo(data, url) {
        const header = new Uint8Array(data, 0, 4);
        const u8a = new Uint8Array(data);
        if (header.toString() === "80,75,3,4") {
            throw new Error("this parser only support version@2 of SVGA.");
        }
        const inflateData = unzlibSync(u8a);
        const movieData = parseSvga(inflateData);
        return new VideoEntity(movieData, platform.path.filename(url));
    }
    /**
     * 读取文件资源
     * @param url 文件资源地址
     * @returns
     */
    static download(url) {
        const { remote, local, globals } = platform;
        // 读取远程文件
        if (remote.is(url)) {
            return remote.fetch(url);
        }
        // 读取本地文件
        if (globals.env !== "h5") {
            return local.read(url);
        }
        return Promise.resolve(null);
    }
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    static async load(url) {
        return Parser.parseVideo((await Parser.download(url)), url);
    }
}

const { noop } = platform;
class Painter {
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
     * 画布的宽度
     */
    W;
    /**
     * 画布的高度
     */
    H;
    /**
     * 粉刷模式
     */
    model = {};
    /**
     *
     * @param mode
     *  - poster: 海报模式
     *  - animation: 动画模式
     *  - 默认为 animation
     * @param W 海报模式必须传入
     * @param H 海报模式必须传入
     */
    constructor(mode = "animation", width = 0, height = 0) {
        this.mode = mode;
        const { dpr } = platform.globals;
        this.W = width * dpr;
        this.H = height * dpr;
    }
    setModel(type) {
        const { model } = this;
        const { env } = platform.globals;
        // set type
        model.type = type;
        // set clear
        if (type === "O" &&
            // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
            env === "h5" &&
            navigator.userAgent.includes("Firefox")) {
            model.clear = "CR";
        }
        else if ((type === "O" && env === "tt") || env === "alipay") {
            model.clear = "CL";
        }
        else {
            model.clear = "RE";
        }
    }
    /**
     * 注册画笔，根据环境判断生成最优的绘制方式
     * @param selector
     * @param ofsSelector
     * @param component
     */
    async register(selector, ofsSelector, component) {
        const { model, mode } = this;
        const { getCanvas, getOfsCanvas } = platform;
        const { env } = platform.globals;
        // #region set main screen implement
        // -------- 创建主屏 ---------
        if (mode === "poster" &&
            (env !== "h5" || "OffscreenCanvas" in globalThis)) {
            const { W, H } = this;
            if (!(W > 0 && H > 0)) {
                throw new Error("Poster mode must set width and height when create Brush instance");
            }
            const { canvas, context } = getOfsCanvas({ width: W, height: H });
            this.X = canvas;
            this.XC = context;
            this.setModel("O");
        }
        else {
            const { canvas, context } = await getCanvas(selector, component);
            const { width, height } = canvas;
            // 添加主屏
            this.X = canvas;
            this.XC = context;
            if (mode === "poster") {
                canvas.width = width;
                canvas.height = height;
                this.setModel("C");
            }
            else {
                this.W = width;
                this.H = height;
            }
        }
        // #endregion set main screen implement
        // #region set secondary screen implement
        // ------- 创建副屏 ---------
        if (mode === "poster") {
            this.Y = this.X;
            this.YC = this.XC;
        }
        else {
            let ofsResult;
            if (typeof ofsSelector === "string" && ofsSelector !== "") {
                ofsResult = await getCanvas(ofsSelector, component);
                ofsResult.canvas.width = this.W;
                ofsResult.canvas.height = this.H;
                this.setModel("C");
            }
            else {
                ofsResult = getOfsCanvas({ width: this.W, height: this.H });
                this.setModel("O");
            }
            this.Y = ofsResult.canvas;
            this.YC = ofsResult.context;
        }
        // #endregion set secondary screen implement
        // #region clear main screen implement
        // ------- 生成主屏清理函数 -------
        // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布
        if (model.clear === "CL") {
            this.clearContainer = () => {
                const { W, H } = this;
                this.XC.clearRect(0, 0, W, H);
            };
        }
        else {
            this.clearContainer = () => {
                const { W, H } = this;
                this.X.width = W;
                this.X.height = H;
            };
        }
        // #endregion clear main screen implement
        if (mode === "poster") {
            this.clearSecondary = this.stick = noop;
        }
        else {
            // #region clear secondary screen implement
            // ------- 生成副屏清理函数 --------
            switch (model.clear) {
                case "CR":
                    this.clearSecondary = () => {
                        const { W, H } = this;
                        // FIXME:【支付宝小程序】频繁创建新的 OffscreenCanvas 会出现崩溃现象
                        const { canvas, context } = getOfsCanvas({ width: W, height: H });
                        this.Y = canvas;
                        this.YC = context;
                    };
                    break;
                case "CL":
                    this.clearSecondary = () => {
                        const { W, H } = this;
                        // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布，无论是Canvas还是OffscreenCanvas
                        this.YC.clearRect(0, 0, W, H);
                    };
                    break;
                default:
                    this.clearSecondary = () => {
                        const { W, H, Y } = this;
                        Y.width = W;
                        Y.height = H;
                    };
            }
            // #endregion clear secondary screen implement
        }
    }
    clearContainer = noop;
    clearSecondary = noop;
    stick() {
        const { W, H, mode } = this;
        if (mode !== "poster") {
            this.XC.drawImage(this.YC.canvas, 0, 0, W, H);
        }
    }
    /**
     * 销毁画笔
     */
    destroy() {
        this.clearContainer();
        this.clearSecondary();
        this.X = this.XC = this.Y = this.YC = null;
        this.clearContainer = this.clearSecondary = this.stick = noop;
    }
}

class Config {
    /**
     * 最后停留的目标模式，类似于 animation-fill-mode，默认值 forwards。
     */
    fillMode = "backwards" /* PLAYER_FILL_MODE.BACKWARDS */;
    /**
     * 播放模式，默认值 forwards
     */
    playMode = "forwards" /* PLAYER_PLAY_MODE.FORWARDS */;
    /**
     * 填充模式，类似于 content-mode。
     */
    contentMode = "fill" /* PLAYER_CONTENT_MODE.FILL */;
    /**
     * 开始播放的帧，默认值 0
     */
    startFrame = 0;
    /**
     * 结束播放的帧，默认值 0
     */
    endFrame = 0;
    /**
     * 循环播放的开始帧，默认值 0
     */
    loopStartFrame = 0;
    /**
     * 循环次数，默认值 0（无限循环）
     */
    loop = 0;
    /**
     * 是否开启动画容器视窗检测，默认值 false
     * 开启后利用 Intersection Observer API 检测动画容器是否处于视窗内，若处于视窗外，停止描绘渲染帧避免造成资源消耗
     */
    // public isUseIntersectionObserver = false;
    register(config) {
        if (typeof config.loop === "number" && config.loop >= 0) {
            this.loop = config.loop;
        }
        if (config.fillMode &&
            [
                "forwards" /* PLAYER_FILL_MODE.FORWARDS */,
                "backwards" /* PLAYER_FILL_MODE.BACKWARDS */,
                "none" /* PLAYER_FILL_MODE.NONE */,
            ].includes(config.fillMode)) {
            this.fillMode = config.fillMode;
        }
        if (config.playMode &&
            ["forwards" /* PLAYER_PLAY_MODE.FORWARDS */, "fallbacks" /* PLAYER_PLAY_MODE.FALLBACKS */].includes(config.playMode)) {
            this.playMode = config.playMode;
        }
        if (typeof config.startFrame === "number" && config.startFrame >= 0) {
            this.startFrame = config.startFrame;
        }
        if (typeof config.endFrame === "number" && config.endFrame >= 0) {
            this.endFrame = config.endFrame;
        }
        if (typeof config.loopStartFrame === "number" &&
            config.loopStartFrame >= 0) {
            this.loopStartFrame = config.loopStartFrame;
        }
        if (typeof config.contentMode === "string") {
            this.contentMode = config.contentMode;
        }
        // if (typeof config.isUseIntersectionObserver === 'boolean') {
        //   this.isUseIntersectionObserver = config.isUseIntersectionObserver
        // }
    }
    setItem(key, value) {
        this.register({ [key]: value });
    }
    getConfig(entity) {
        const { playMode, loopStartFrame, startFrame, endFrame, fillMode, loop } = this;
        const { fps, sprites } = entity;
        let { frames } = entity;
        const spriteCount = sprites.length;
        const start = startFrame > 0 ? startFrame : 0;
        const end = endFrame > 0 && endFrame < frames ? endFrame : frames;
        // 每帧持续的时间
        const frameDuration = 1000 / fps;
        let loopStart;
        if (start > end) {
            throw new Error("StartFrame should greater than EndFrame");
        }
        // 更新活动帧总数
        if (end < frames) {
            frames = end - start;
        }
        else if (start > 0) {
            frames -= start;
        }
        const duration = Math.floor(frames * frameDuration * 10 ** 6) / 10 ** 6;
        let currFrame = 0;
        let extFrame = 0;
        // 顺序播放/倒叙播放
        if (playMode === "forwards" /* PLAYER_PLAY_MODE.FORWARDS */) {
            // 重置为开始帧
            currFrame = Math.max(loopStartFrame, startFrame);
            if (fillMode === "forwards" /* PLAYER_FILL_MODE.FORWARDS */) {
                extFrame = 1;
            }
            loopStart =
                loopStartFrame > start ? (loopStartFrame - start) * frameDuration : 0;
        }
        else {
            // 重置为开始帧
            currFrame = Math.min(loopStartFrame, end - 1);
            if (fillMode === "backwards" /* PLAYER_FILL_MODE.BACKWARDS */) {
                extFrame = 1;
            }
            loopStart =
                loopStartFrame < end ? (end - loopStartFrame) * frameDuration : 0;
        }
        return {
            currFrame,
            startFrame: start,
            endFrame: end,
            totalFrame: frames,
            spriteCount,
            aniConfig: {
                // 单个周期的运行时长
                duration,
                // 第一个周期开始时间偏移量
                loopStart,
                // 循环次数
                loop: loop === 0 ? Infinity : loop,
                // 最后一帧不在周期内，需要单独计算
                fillValue: extFrame * frameDuration,
            },
        };
    }
}

/**
 * CurrentPoint对象池，用于减少对象创建和GC压力
 */
class PointPool {
    pool = [];
    acquire() {
        const { pool } = this;
        return pool.length > 0
            ? pool.pop()
            : { x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
    }
    release(point) {
        // 重置点的属性
        point.x = point.y = point.x1 = point.y1 = point.x2 = point.y2 = 0;
        this.pool.push(point);
    }
}

class Renderer2D {
    context;
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
    static SVG_PATH = new Set([
        "M",
        "L",
        "H",
        "V",
        "Z",
        "C",
        "S",
        "Q",
        "m",
        "l",
        "h",
        "v",
        "z",
        "c",
        "s",
        "q",
    ]);
    static SVG_LETTER_REGEXP = /[a-zA-Z]/;
    // 在Renderer2D类中添加新的解析方法
    static parseSVGPath(d) {
        const { SVG_LETTER_REGEXP } = Renderer2D;
        const result = [];
        let currentIndex = 0;
        // 状态：0 - 等待命令，1 - 读取参数
        let state = 0;
        let currentCommand = "";
        let currentArgs = "";
        while (currentIndex < d.length) {
            const char = d[currentIndex];
            switch (state) {
                case 0: // 等待命令
                    if (SVG_LETTER_REGEXP.test(char)) {
                        currentCommand = char;
                        state = 1;
                    }
                    break;
                case 1: // 读取参数
                    if (SVG_LETTER_REGEXP.test(char)) {
                        // 遇到新命令，保存当前命令和参数
                        result.push({
                            command: currentCommand,
                            args: currentArgs.trim(),
                        });
                        currentCommand = char;
                        currentArgs = "";
                    }
                    else {
                        currentArgs += char;
                    }
                    break;
            }
            currentIndex++;
        }
        // 处理最后一个命令
        if (currentCommand && state === 1) {
            result.push({
                command: currentCommand,
                args: currentArgs.trim(),
            });
        }
        return result;
    }
    static fillOrStroke(context, styles) {
        if (styles) {
            if (styles.fill) {
                context.fill();
            }
            if (styles.stroke) {
                context.stroke();
            }
        }
    }
    static resetShapeStyles(context, styles) {
        if (styles) {
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
    }
    /**
     * 计算缩放比例
     * @param contentMode
     * @param videoSize
     * @param canvasSize
     * @returns
     */
    static calculateScale(contentMode, videoSize, canvasSize) {
        const imageRatio = videoSize.width / videoSize.height;
        const viewRatio = canvasSize.width / canvasSize.height;
        const isAspectFit = contentMode === "aspect-fit" /* PLAYER_CONTENT_MODE.ASPECT_FIT */;
        const shouldUseWidth = (imageRatio >= viewRatio && isAspectFit) ||
            (imageRatio <= viewRatio && !isAspectFit);
        const createTransform = (scale, translateX, translateY) => ({
            scaleX: scale,
            scaleY: scale,
            translateX,
            translateY,
        });
        if (shouldUseWidth) {
            const scale = canvasSize.width / videoSize.width;
            return createTransform(scale, 0, (canvasSize.height - videoSize.height * scale) / 2);
        }
        const scale = canvasSize.height / videoSize.height;
        return createTransform(scale, (canvasSize.width - videoSize.width * scale) / 2, 0);
    }
    pointPool = new PointPool();
    lastResizeKey = "";
    globalTransform = void 0;
    constructor(context) {
        this.context = context;
    }
    setTransform(transform) {
        if (transform) {
            this.context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        }
    }
    drawBezier(d, transform, styles) {
        const { context, pointPool } = this;
        const currentPoint = pointPool.acquire();
        context.save();
        Renderer2D.resetShapeStyles(context, styles);
        this.setTransform(transform);
        context.beginPath();
        if (d) {
            // 使用状态机解析器替代正则表达式
            const commands = Renderer2D.parseSVGPath(d);
            for (const { command, args } of commands) {
                if (Renderer2D.SVG_PATH.has(command)) {
                    this.drawBezierElement(currentPoint, command, args.split(/[\s,]+/).filter(Boolean));
                }
            }
        }
        Renderer2D.fillOrStroke(context, styles);
        pointPool.release(currentPoint);
        context.restore();
    }
    drawBezierElement(currentPoint, method, args) {
        const { context } = this;
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
                if (currentPoint.x1 !== void 0 &&
                    currentPoint.y1 !== void 0 &&
                    currentPoint.x2 !== void 0 &&
                    currentPoint.y2 !== void 0) {
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
                if (currentPoint.x1 !== void 0 &&
                    currentPoint.y1 !== void 0 &&
                    currentPoint.x2 !== void 0 &&
                    currentPoint.y2 !== void 0) {
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
    drawEllipse(x, y, radiusX, radiusY, transform, styles) {
        const { context } = this;
        context.save();
        Renderer2D.resetShapeStyles(context, styles);
        this.setTransform(transform);
        x -= radiusX;
        y -= radiusY;
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
        Renderer2D.fillOrStroke(context, styles);
        context.restore();
    }
    drawRect(x, y, width, height, cornerRadius, transform, styles) {
        const { context } = this;
        context.save();
        Renderer2D.resetShapeStyles(context, styles);
        this.setTransform(transform);
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
        Renderer2D.fillOrStroke(context, styles);
        context.restore();
    }
    drawShape(shape) {
        const { type, path, transform, styles } = shape;
        switch (type) {
            case "shape" /* PlatformVideo.SHAPE_TYPE.SHAPE */:
                this.drawBezier(path.d, transform, styles);
                break;
            case "ellipse" /* PlatformVideo.SHAPE_TYPE.ELLIPSE */:
                this.drawEllipse(path.x ?? 0, path.y ?? 0, path.radiusX ?? 0, path.radiusY ?? 0, transform, styles);
                break;
            case "rect" /* PlatformVideo.SHAPE_TYPE.RECT */:
                this.drawRect(path.x ?? 0, path.y ?? 0, path.width ?? 0, path.height ?? 0, path.cornerRadius ?? 0, transform, styles);
                break;
        }
    }
    drawSprite(frame, bitmap, dynamicElement) {
        if (frame.alpha < 0.05)
            return;
        const { context } = this;
        const { alpha, transform, layout, shapes, maskPath } = frame;
        const { a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0 } = transform ?? {};
        context.save();
        this.setTransform(this.globalTransform);
        context.globalAlpha = alpha;
        context.transform(a, b, c, d, tx, ty);
        if (bitmap) {
            if (maskPath) {
                this.drawBezier(maskPath.d, maskPath.transform, maskPath.styles);
                context.clip();
            }
            context.drawImage(bitmap, 0, 0, layout.width, layout.height);
        }
        if (dynamicElement) {
            context.drawImage(dynamicElement, (layout.width - dynamicElement.width) / 2, (layout.height - dynamicElement.height) / 2);
        }
        for (let i = 0; i < shapes.length; i++) {
            this.drawShape(shapes[i]);
        }
        context.restore();
    }
    /**
     * 调整画布尺寸
     * @param contentMode
     * @param videoSize
     * @param canvasSize
     * @returns
     */
    resize(contentMode, videoSize, canvasSize) {
        const { width: canvasWidth, height: canvasHeight } = canvasSize;
        const { width: videoWidth, height: videoHeight } = videoSize;
        const resizeKey = `${contentMode}-${videoWidth}-${videoHeight}-${canvasWidth}-${canvasHeight}`;
        const lastTransform = this.globalTransform;
        if (this.lastResizeKey === resizeKey && lastTransform) {
            return;
        }
        let scale = {
            scaleX: 1,
            scaleY: 1,
            translateX: 0,
            translateY: 0,
        };
        if (contentMode === "fill" /* PLAYER_CONTENT_MODE.FILL */) {
            scale.scaleX = canvasWidth / videoWidth;
            scale.scaleY = canvasHeight / videoHeight;
        }
        else {
            scale = Renderer2D.calculateScale(contentMode, videoSize, canvasSize);
        }
        this.lastResizeKey = resizeKey;
        this.globalTransform = {
            a: scale.scaleX,
            b: 0.0,
            c: 0.0,
            d: scale.scaleY,
            tx: scale.translateX,
            ty: scale.translateY,
        };
    }
    render(videoEntity, materials, dynamicMaterials, currentFrame, head, tail) {
        const { sprites } = videoEntity;
        let sprite;
        let imageKey;
        let bitmap;
        let dynamicElement;
        for (let i = head; i < tail; i++) {
            sprite = sprites[i];
            imageKey = sprite.imageKey;
            bitmap = materials.get(imageKey);
            dynamicElement = dynamicMaterials.get(imageKey);
            this.drawSprite(sprite.frames[currentFrame], bitmap, dynamicElement);
        }
    }
    destroy() {
        this.globalTransform = void 0;
        this.lastResizeKey = "";
    }
}

/**
 * 动画控制器
 */
class Animator {
    /**
     * 动画是否执行
     */
    isRunning = false;
    /**
     * 动画开始时间
     */
    startTime = 0;
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
    onAnimate = platform.noop;
    /* ---- 事件钩子 ---- */
    onStart = platform.noop;
    onUpdate = platform.noop;
    onEnd = platform.noop;
    /**
     * 设置动画的必要参数
     * @param duration
     * @param loopStart
     * @param loop
     * @param fillValue
     */
    setConfig(duration, loopStart, loop, fillValue) {
        this.duration = duration;
        this.loopStart = loopStart;
        this.loopDuration = duration * loop + fillValue - loopStart;
    }
    start() {
        this.isRunning = true;
        this.startTime = platform.now();
        this.onStart();
        this.doFrame();
    }
    resume() {
        this.isRunning = true;
        this.startTime = platform.now();
        this.doFrame();
    }
    pause() {
        this.isRunning = false;
        // 设置暂停的位置
        this.loopStart = (platform.now() - this.startTime + this.loopStart) % this.duration;
    }
    stop() {
        this.isRunning = false;
        this.loopStart = 0;
    }
    doFrame() {
        if (this.isRunning) {
            this.doDeltaTime(platform.now() - this.startTime);
            if (this.isRunning) {
                this.onAnimate(() => this.doFrame());
            }
        }
    }
    doDeltaTime(DT) {
        const { duration: D, loopStart: LS, loopDuration: LD, } = this;
        // 本轮动画已消耗的时间比例（Percentage of speed time）
        let TP;
        let ended = false;
        // 运行时间 大于等于 循环持续时间
        if (DT >= LD) {
            // 动画已结束
            TP = 1.0;
            ended = true;
            this.stop();
        }
        else {
            // 本轮动画已消耗的时间比例 = 本轮动画已消耗的时间 / 动画持续时间
            TP = ((DT + LS) % D) / D;
        }
        this.onUpdate(TP);
        if (!this.isRunning && ended) {
            this.onEnd();
        }
    }
}

// CRC32 表初始化
function initCRC32Table() {
    return Uint32Array.from(Array(256), (_, i) => {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        return c >>> 0;
    });
}
class CRC32 {
    static table = initCRC32Table();
    cache = new Map();
    calculate(buff) {
        if (!buff || !(buff instanceof Uint8Array)) {
            throw new TypeError('Input must be a Uint8Array');
        }
        const { table } = CRC32;
        const { cache } = this;
        const key = platform.decode.bytesToString(buff);
        if (cache.has(key)) {
            return cache.get(key);
        }
        let crc = 0xffffffff;
        const { length } = buff;
        // 使用位运算优化
        for (let i = 0; i < length; i++) {
            crc = (crc >>> 8) ^ table[(crc ^ buff[i]) & 0xff];
        }
        const result = (crc ^ 0xffffffff) >>> 0;
        cache.set(key, result);
        return result;
    }
    clear() {
        this.cache.clear();
    }
}

class PNGEncoder {
    width;
    height;
    view;
    crc32 = new CRC32();
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.view = new DataView(new ArrayBuffer(4 * width * height));
    }
    createChunk(type, data) {
        // 长度（4字节，大端序）
        const length = new Uint8Array(4);
        new DataView(length.buffer).setUint32(0, data.length, false);
        // 块类型（4字节， ASCII）
        const chunkType = Uint8Array.from(type, c => c.charCodeAt(0));
        // 计算 CRC32 校验（类型 + 数据）
        const partialChunk = new Uint8Array(chunkType.length + data.length);
        partialChunk.set(chunkType);
        partialChunk.set(data, chunkType.length);
        const crc = new Uint8Array(4);
        new DataView(crc.buffer).setUint32(0, this.crc32.calculate(partialChunk) >>> 0, false);
        const result = new Uint8Array(length.length + partialChunk.length + crc.length);
        result.set(length);
        result.set(partialChunk, length.length);
        result.set(crc, length.length + partialChunk.length);
        return result;
    }
    createIHDRChunk() {
        const ihdrData = new Uint8Array(13);
        const view = new DataView(ihdrData.buffer);
        // 宽度
        view.setUint32(0, this.width, false);
        // 高度
        view.setUint32(4, this.height, false);
        // 位深度
        view.setUint8(8, 8);
        // 颜色类型
        view.setUint8(9, 6);
        // 压缩方法
        view.setUint8(10, 0);
        // 过滤器方法
        view.setUint8(11, 0);
        // 交错方法
        view.setUint8(12, 0);
        return this.createChunk("IHDR", ihdrData);
    }
    createIDATChunk() {
        const { width, height, view } = this;
        const rowSize = width * 4 + 1;
        const idatData = new Uint8Array(rowSize * height);
        // 将Uint32数据转换为Uint8数据
        const pixelsData = new Uint8Array(view.buffer);
        for (let y = 0; y < height; y++) {
            const startIdx = y * rowSize;
            idatData[startIdx] = 0x00; // 过滤头
            // ✅ 复制预先转换好的 RGBA 数据
            const srcStart = y * width * 4; // Uint32 => 每个元素占 4 字节
            const srcEnd = srcStart + width * 4;
            idatData.set(pixelsData.subarray(srcStart, srcEnd), startIdx + 1);
        }
        // 使用 zlib 进行压缩, 平衡压缩率有利于提升文件生成速度
        return this.createChunk("IDAT", zlibSync(idatData));
    }
    createIENDChunk() {
        return this.createChunk("IEND", new Uint8Array(0));
    }
    setPixel(x, y, pixel) {
        this.view.setUint32((y * this.width + x) * 4, pixel, false);
    }
    write(pixels) {
        const { width, height } = this;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];
                const a = pixels[index + 3];
                const pixel = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
                this.setPixel(x, y, pixel);
            }
        }
        return this;
    }
    flush() {
        // 1. 文件头（固定 8 字节）
        const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
        // 预先创建所有块
        const iHDRChunk = this.createIHDRChunk();
        const iDATChunk = this.createIDATChunk();
        const iENDChunk = this.createIENDChunk();
        // 直接计算总大小
        const totalSize = 8 + iHDRChunk.length + iDATChunk.length + iENDChunk.length;
        // 一次性分配内存
        const pngData = new Uint8Array(totalSize);
        let offset = 0;
        // 按顺序写入数据
        pngData.set(pngSignature, offset);
        offset += pngSignature.length;
        pngData.set(iHDRChunk, offset);
        offset += iHDRChunk.length;
        pngData.set(iDATChunk, offset);
        offset += iDATChunk.length;
        pngData.set(iENDChunk, offset);
        // 清空缓存
        this.crc32.clear();
        return pngData;
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
        return ((this.buffer[bufIndex] >>> (7 - (i % 8))) & 1) === 1;
    }
    put(num, length) {
        for (let i = 0; i < length; i++) {
            this.putBit(((num >>> (length - i - 1)) & 1) === 1);
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
        if (bytes.length !== data.length) {
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
        if (length === void 0) {
            throw new Error(`${length}/${shift}`);
        }
        let offset = 0;
        while (offset < length && num[offset] === 0) {
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
const genBCHDigit = (data) => data === 0 ? 0 : Math.log2(data);
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
                return (i, j) => (i + j) % 2 === 0;
            case PATTERN001:
                return (i) => i % 2 === 0;
            case PATTERN010:
                return (_i, j) => j % 3 === 0;
            case PATTERN011:
                return (i, j) => (i + j) % 3 === 0;
            case PATTERN100:
                return (i, j) => (~~(i / 2) + ~~(j / 3)) % 2 === 0;
            case PATTERN101:
                return (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0;
            case PATTERN110:
                return (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
            case PATTERN111:
                return (i, j) => (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
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
                        if (r === 0 && c === 0)
                            continue;
                        if (dark === qr.isDark(nRow, nCol)) {
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
                if (count === 0 || count === 4) {
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
        if (this.dataCache === null) {
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
                    (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                        (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
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
                            r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0);
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
            modules[r][6] = r % 2 === 0;
        }
        for (let c = 8; c < count; c++) {
            if (modules[6][c] != null)
                continue;
            modules[6][c] = c % 2 === 0;
        }
    }
    setupTypeInfo(test, maskPattern) {
        const { errorCorrectLevel, modules, moduleCount } = this;
        const data = (errorCorrectLevel << 3) | maskPattern;
        const bits = Util.getBCHTypeInfo(data);
        // vertical
        for (let i = 0; i < 15; i++) {
            const mod = !test && ((bits >> i) & 1) === 1;
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
            const mod = !test && ((bits >> i) & 1) === 1;
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
            if (i === 0 || minLostPoint > lostPoint) {
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
            const mod = !test && ((bits >> i) & 1) === 1;
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
        while (buffer.lengthInBits % 8 !== 0) {
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
            if (col === 6)
                col -= 1;
            while (true) {
                for (let c = 0; c < 2; c++) {
                    if (modules[row][col - c] == null) {
                        let dark = false;
                        if (byteIndex < data.length) {
                            dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
                        }
                        if (maskFunc(row, col - c)) {
                            dark = !dark;
                        }
                        modules[row][col - c] = dark;
                        bitIndex--;
                        if (bitIndex === -1) {
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

class ResourceManager {
    painter;
    static isBitmap(img) {
        return platform.globals.env === "h5" && img instanceof ImageBitmap;
    }
    // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
    caches = [];
    /**
     * 动态素材
     */
    dynamicMaterials = new Map();
    /**
     * 素材
     */
    materials = new Map();
    /**
     * 已清理Image对象的坐标
     */
    point = 0;
    constructor(painter) {
        this.painter = painter;
    }
    createImage() {
        let img = null;
        if (this.point > 0) {
            this.point--;
            img = this.caches.shift();
        }
        if (!img) {
            img = platform.image.create(this.painter.X);
        }
        this.caches.push(img);
        return img;
    }
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    async loadImages(images, filename, type = "normal") {
        const imageAwaits = [];
        Object.entries(images).forEach(([name, image]) => {
            const p = platform.image
                .load(() => this.createImage(), image, platform.path.resolve(filename, type === "dynamic" ? `dynamic_${name}` : name))
                .then((img) => {
                if (ResourceManager.isBitmap(img)) {
                    this.caches.push(img);
                }
                if (type === "dynamic") {
                    this.dynamicMaterials.set(name, img);
                }
                else {
                    this.materials.set(name, img);
                }
            });
            imageAwaits.push(p);
        });
        await Promise.all(imageAwaits);
    }
    release() {
        const { env } = platform.globals;
        // FIXME: 小程序 image 对象需要手动释放内存，否则可能导致小程序崩溃
        for (const img of this.caches) {
            if (ResourceManager.isBitmap(img)) {
                img.close();
            }
            else if (img.src !== "") {
                // 【微信】将存在本地的文件删除，防止用户空间被占满
                if (env === "weapp" &&
                    img.src.includes(platform.path.USER_DATA_PATH)) {
                    platform.local.remove(img.src);
                }
                platform.image.release(img);
            }
        }
        this.materials.clear();
        this.dynamicMaterials.clear();
        // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
        env === "alipay" || env === "h5" ? this.cleanup() : this.tidyUp();
    }
    tidyUp() {
        // 通过 Set 的去重特性，保持 caches 元素的唯一性
        this.caches = Array.from(new Set(this.caches));
        this.point = this.caches.length;
    }
    cleanup() {
        this.caches.length = 0;
        this.point = 0;
    }
}

/**
 * SVGA 播放器
 */
class Player {
    /**
     * SVGA 元数据
     * Video Entity
     */
    entity;
    /**
     * 当前配置项
     */
    config = new Config();
    /**
     * 资源管理器
     */
    resource = null;
    /**
     * 刷头实例
     */
    painter = new Painter();
    /**
     * 动画实例
     */
    animator = new Animator();
    renderer = null;
    // private isBeIntersection = true;
    // private intersectionObserver: IntersectionObserver | null = null
    /**
     * 设置配置项
     * @param options 可配置项
     * @property container 主屏，播放动画的 Canvas 元素
     * @property secondary 副屏，播放动画的 Canvas 元素
     * @property loop 循环次数，默认值 0（无限循环）
     * @property fillMode 最后停留的目标模式，类似于 animation-fill-mode，接受值 forwards 和 fallbacks，默认值 forwards。
     * @property playMode 播放模式，接受值 forwards 和 fallbacks ，默认值 forwards。
     * @property startFrame 单个循环周期内开始播放的帧数，默认值 0
     * @property endFrame 单个循环周期内结束播放的帧数，默认值 0
     * @property loopStartFrame 循环播放的开始帧，仅影响第一个周期的开始帧，默认值 0
     */
    async setConfig(options, component) {
        const config = typeof options === "string" ? { container: options } : options;
        this.config.register(config);
        // 监听容器是否处于浏览器视窗内
        // this.setIntersectionObserver()
        await this.painter.register(config.container, config.secondary, component);
        this.renderer = new Renderer2D(this.painter.YC);
        this.resource = new ResourceManager(this.painter);
        this.animator.onAnimate = platform.rAF.bind(null, this.painter.X);
    }
    /**
     * 更新配置
     * @param key
     * @param value
     */
    setItem(key, value) {
        this.config.setItem(key, value);
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
    //     if (this.intersectionObserver !== null) this.intersectionObserver.disconnect()
    //     this.config.isUseIntersectionObserver = false
    //     this.isBeIntersection = true
    //   }
    // }
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @returns Promise<void>
     */
    async mount(videoEntity) {
        if (!videoEntity)
            throw new Error("videoEntity undefined");
        const { images, filename } = videoEntity;
        this.animator.stop();
        this.painter.clearSecondary();
        this.resource.release();
        this.entity = videoEntity;
        await this.resource.loadImages(images, filename);
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
        this.startAnimation();
        this.onStart?.();
    }
    /**
     * 重新播放
     */
    resume() {
        this.animator.resume();
        this.onResume?.();
    }
    /**
     * 暂停播放
     */
    pause() {
        this.animator.pause();
        this.onPause?.();
    }
    /**
     * 停止播放
     */
    stop() {
        this.animator.stop();
        this.painter.clearContainer();
        this.painter.clearSecondary();
        this.onStop?.();
    }
    /**
     * 销毁实例
     */
    destroy() {
        this.animator.stop();
        this.painter.destroy();
        this.renderer?.destroy();
        this.resource?.release();
        this.resource?.cleanup();
        this.entity = void 0;
    }
    /**
     * 跳转到指定帧
     * @param frame 目标帧
     * @param andPlay 是否立即播放
     */
    stepToFrame(frame, andPlay = false) {
        if (!this.entity || frame < 0 || frame >= this.entity.frames)
            return;
        this.pause();
        this.config.loopStartFrame = frame;
        if (andPlay) {
            this.start();
        }
    }
    /**
     * 跳转到指定百分比
     * @param percent 目标百分比
     * @param andPlay 是否立即播放
     */
    stepToPercentage(percent, andPlay = false) {
        if (!this.entity)
            return;
        const { frames } = this.entity;
        let frame = percent < 0 ? 0 : Math.round(percent * frames);
        if (frame >= frames) {
            frame = frames - 1;
        }
        debugger;
        this.stepToFrame(frame, andPlay);
    }
    /**
     * 开始绘制动画
     */
    startAnimation() {
        const { entity, config, animator, painter, renderer, resource } = this;
        const { W, H } = painter;
        const { fillMode, playMode, contentMode } = config;
        const { currFrame, startFrame, endFrame, totalFrame, spriteCount, aniConfig, } = config.getConfig(entity);
        const { duration, loopStart, loop, fillValue } = aniConfig;
        const isReverseMode = playMode === "fallbacks" /* PLAYER_PLAY_MODE.FALLBACKS */;
        // 当前帧
        let currentFrame = currFrame;
        // 片段绘制结束位置
        let tail = 0;
        let nextTail;
        // 上一帧
        let latestFrame;
        // 下一帧
        let nextFrame;
        // 精确帧
        let exactFrame;
        // 当前已完成的百分比
        let percent;
        // 是否还有剩余时间
        let hasRemained;
        // 更新动画基础信息
        animator.setConfig(duration, loopStart, loop, fillValue);
        renderer.resize(contentMode, entity.size, { width: W, height: H });
        // 分段渲染函数
        const MAX_DRAW_TIME_PER_FRAME = 8;
        const MAX_ACCELERATE_DRAW_TIME_PER_FRAME = 3;
        const MAX_DYNAMIC_CHUNK_SIZE = 34;
        const MIN_DYNAMIC_CHUNK_SIZE = 1;
        // 动态调整每次绘制的块大小
        let dynamicChunkSize = 4; // 初始块大小
        let startTime;
        let chunk;
        let elapsed;
        // 使用`指数退避算法`平衡渲染速度和流畅度
        const patchDraw = (before) => {
            startTime = platform.now();
            before();
            while (tail < spriteCount) {
                // 根据当前块大小计算nextTail
                chunk = Math.min(dynamicChunkSize, spriteCount - tail);
                nextTail = (tail + chunk) | 0;
                renderer.render(entity, resource.materials, resource.dynamicMaterials, currentFrame, tail, nextTail);
                tail = nextTail;
                // 动态调整块大小
                elapsed = platform.now() - startTime;
                if (elapsed < MAX_ACCELERATE_DRAW_TIME_PER_FRAME) {
                    dynamicChunkSize = Math.min(dynamicChunkSize * 2, MAX_DYNAMIC_CHUNK_SIZE); // 加快绘制
                }
                else if (elapsed > MAX_DRAW_TIME_PER_FRAME) {
                    dynamicChunkSize = Math.max(dynamicChunkSize / 2, MIN_DYNAMIC_CHUNK_SIZE); // 减慢绘制
                    break;
                }
            }
        };
        // 动画绘制过程
        animator.onUpdate = (timePercent) => {
            patchDraw(() => {
                percent = isReverseMode ? 1 - timePercent : timePercent;
                exactFrame = percent * totalFrame;
                if (isReverseMode) {
                    nextFrame =
                        (timePercent === 0 ? endFrame : Math.ceil(exactFrame)) - 1;
                    // FIXME: 倒序会有一帧的偏差，需要校准当前帧
                    percent = currentFrame / totalFrame;
                }
                else {
                    nextFrame = timePercent === 1 ? startFrame : Math.floor(exactFrame);
                }
                hasRemained = currentFrame === nextFrame;
            });
            if (hasRemained)
                return;
            painter.clearContainer();
            painter.stick();
            painter.clearSecondary();
            latestFrame = currentFrame;
            currentFrame = nextFrame;
            tail = 0;
            this.onProcess?.(~~(percent * 100) / 100, latestFrame);
        };
        animator.onStart = () => {
            entity.locked = true;
        };
        animator.onEnd = () => {
            entity.locked = false;
            // 如果不保留最后一帧渲染，则清空画布
            if (fillMode === "none" /* PLAYER_FILL_MODE.NONE */) {
                painter.clearContainer();
            }
            this.onEnd?.();
        };
        animator.start();
    }
}

function parseOptions(options) {
    const typeNumber = options.typeNumber ?? 4;
    const correctLevel = options.correctLevel ?? "H";
    const codeColor = options.codeColor ?? "#000000";
    const backgroundColor = options.backgroundColor ?? "#FFFFFF";
    return {
        code: options.code,
        size: options.size,
        typeNumber,
        correctLevel,
        codeColor,
        backgroundColor,
    };
}
const calcCellSizeAndPadding = (moduleCount, size) => {
    const cellSize = ~~(size / moduleCount);
    return {
        padding: ~~((size - moduleCount * cellSize) / 2),
        cellSize: cellSize || 2,
    };
};
function generateImageBufferFromCode(options) {
    const { code, typeNumber, correctLevel, size, codeColor, backgroundColor } = parseOptions(options);
    let qr;
    try {
        qr = new QRCode(typeNumber, correctLevel);
        qr.addData(code);
        qr.make();
    }
    catch (e) {
        if (typeNumber >= 40) {
            throw new Error("Text too long to encode");
        }
        return arguments.callee({
            code,
            size,
            correctLevel,
            typeNumber: typeNumber + 1,
            codeColor,
            backgroundColor,
        });
    }
    // calc cellsize and margin
    const moduleCount = qr.getModuleCount();
    const { padding, cellSize } = calcCellSizeAndPadding(moduleCount, size);
    const max = moduleCount * cellSize + padding;
    const CODE_COLOR = +`${codeColor.replace("#", "0x")}FF`;
    const BACKGROUND_COLOR = +`${backgroundColor.replace("#", "0x")}FF`;
    const png = new PNGEncoder(size, size);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (padding <= x && x < max && padding <= y && y < max) {
                const c = ~~((x - padding) / cellSize);
                const r = ~~((y - padding) / cellSize);
                png.setPixel(x, y, qr.isDark(r, c) ? CODE_COLOR : BACKGROUND_COLOR);
            }
            else {
                png.setPixel(x, y, BACKGROUND_COLOR);
            }
        }
    }
    return png.flush();
}
function generateImageFromCode(options) {
    const buff = generateImageBufferFromCode(options);
    return platform.decode.toDataURL(buff);
}

function getBufferFromImageData(imageData) {
    const { width, height, data } = imageData;
    return new PNGEncoder(width, height).write(data).flush();
}
function getDataURLFromImageData(imageData) {
    const buff = getBufferFromImageData(imageData);
    return platform.decode.toDataURL(buff);
}

class VideoManager {
    /**
     * 视频池的当前指针位置
     */
    point = 0;
    /**
     * 视频的最大留存数量，其他视频将放在磁盘上缓存
     */
    maxRemain = 3;
    /**
     * 留存视频的开始指针位置
     */
    remainStart = 0;
    /**
     * 留存视频的结束指针位置
     */
    remainEnd = 0;
    /**
     * 视频加载模式
     * 快速加载模式：可保证当前视频加载完成后，尽快播放；其他请求将使用Promise的方式保存在bucket中，以供后续使用
     * 完整加载模式：可保证所有视频加载完成，确保播放切换的流畅性
     */
    loadMode = "fast";
    /**
     * 视频池的所有数据
     */
    buckets = [];
    /**
     * 获取视频池大小
     */
    get length() {
        return this.buckets.length;
    }
    /**
     * 获取当前指针位置
     * @returns
     */
    get current() {
        return this.point;
    }
    /**
     * 更新留存指针位置
     */
    updateRemainPoints() {
        if (this.point < Math.ceil(this.maxRemain / 2)) {
            this.remainStart = 0;
            this.remainEnd = this.maxRemain;
        }
        else if (this.length - this.point < Math.floor(this.maxRemain / 2)) {
            this.remainStart = this.remainEnd - this.maxRemain;
            this.remainEnd = this.length;
        }
        else {
            this.remainStart = Math.floor(this.point - this.maxRemain / 2);
            this.remainEnd = this.remainStart + this.maxRemain;
        }
    }
    /**
     * 更新留存指针位置
     * @param point 最新的指针位置
     * @returns
     */
    updateBucketOperators(point) {
        const { remainStart, remainEnd } = this;
        this.point = point;
        this.updateRemainPoints();
        if (remainStart === remainEnd) {
            return [
                {
                    action: "add",
                    start: this.remainStart,
                    end: this.remainEnd,
                },
            ];
        }
        if (this.remainStart > remainEnd || this.remainEnd < remainStart) {
            return [
                {
                    action: "remove",
                    start: remainStart,
                    end: remainEnd,
                },
                {
                    action: "add",
                    start: this.remainStart,
                    end: this.remainEnd,
                },
            ];
        }
        if (this.remainStart > remainStart && this.remainEnd > remainEnd) {
            return [
                {
                    action: "remove",
                    start: remainStart,
                    end: this.remainStart,
                },
                {
                    action: "add",
                    start: remainEnd,
                    end: this.remainEnd,
                },
            ];
        }
        if (this.remainStart < remainStart && this.remainEnd < remainEnd) {
            return [
                {
                    action: "remove",
                    start: this.remainEnd,
                    end: remainEnd,
                },
                {
                    action: "add",
                    start: this.remainStart,
                    end: remainStart,
                },
            ];
        }
        return [];
    }
    /**
     * 获取当前的视频信息
     * @param point 最新的指针位置
     * @returns
     */
    async getBucket(point) {
        const { length, buckets, loadMode } = this;
        if (point < 0 || point >= length) {
            return buckets[point];
        }
        const operators = this.updateBucketOperators(point);
        if (operators.length) {
            const waitings = [];
            operators.forEach(({ action, start, end }) => {
                for (let i = start; i < end; i++) {
                    const bucket = buckets[i];
                    if (action === "remove") {
                        bucket.entity = null;
                    }
                    else if (action === "add") {
                        if (bucket.entity === null) {
                            if (bucket.promise === null) {
                                bucket.promise = Parser.load(bucket.local || bucket.origin);
                            }
                            if (loadMode === "whole" || point === i) {
                                waitings.push(bucket.promise);
                            }
                        }
                    }
                }
            });
            await Promise.all(waitings);
        }
        return this.get();
    }
    /**
     * 创建bucket
     * @param url 远程地址
     * @param inRemainRange 是否在留存范围内
     * @param needDownloadAndParse 是否需要下载并解析
     * @returns
     */
    async createBucket(url, inRemainRange = true, needDownloadAndParse = true) {
        const { globals, path, local } = platform;
        const { env } = globals;
        const bucket = {
            origin: url,
            local: "",
            entity: null,
            promise: null,
        };
        if (env === "h5" || env === "tt") {
            // 利用浏览器缓存
            bucket.local = url;
            if (inRemainRange) {
                if (needDownloadAndParse) {
                    bucket.entity = await Parser.load(url);
                }
                else {
                    bucket.promise = Parser.load(url);
                }
            }
            return bucket;
        }
        const filePath = path.resolve(path.filename(url), "full");
        const downloadAwait = Parser.download(bucket.origin);
        const parseVideoAwait = async (buff) => {
            if (buff) {
                try {
                    await local.write(buff, filePath);
                    bucket.local = filePath;
                }
                catch (ex) {
                    console.error(ex);
                }
                // bucket.filesize = buff.byteLength / 8;
                if (inRemainRange) {
                    return Parser.parseVideo(buff, url);
                }
            }
            return null;
        };
        if (needDownloadAndParse) {
            bucket.entity = await parseVideoAwait(await downloadAwait);
        }
        else {
            bucket.promise = downloadAwait.then(parseVideoAwait);
        }
        return bucket;
    }
    /**
     * 视频加载模式
     * @param loadMode
     */
    setLoadMode(loadMode) {
        this.loadMode = loadMode;
    }
    /**
     * 预加载视频到本地磁盘中
     * @param urls 视频远程地址
     * @param point 当前指针位置
     * @param maxRemain 最大留存数量
     */
    async prepare(urls, point, maxRemain) {
        let preloadBucket = null;
        this.point =
            typeof point === "number" && point > 0 && point < urls.length ? point : 0;
        this.maxRemain =
            typeof maxRemain === "number" && maxRemain > 0 ? maxRemain : 3;
        this.updateRemainPoints();
        if (this.loadMode === "fast") {
            preloadBucket = await this.createBucket(urls[this.point]);
        }
        this.buckets = await Promise.all(urls.map((url, index) => {
            if (preloadBucket && index === this.point) {
                return preloadBucket;
            }
            const { loadMode, remainStart, remainEnd, point: currentPoint } = this;
            return this.createBucket(url, remainStart <= index && index < remainEnd, loadMode === "whole" || index === currentPoint);
        }));
    }
    /**
     * 获取当前帧的bucket
     * @returns
     */
    async get() {
        const bucket = this.buckets[this.point];
        if (bucket.promise) {
            bucket.entity = await bucket.promise;
            bucket.promise = null;
            return bucket;
        }
        if (bucket.entity === null) {
            bucket.entity = await Parser.load(bucket.local || bucket.origin);
            return bucket;
        }
        return bucket;
    }
    /**
     * 获取指定位置的bucket
     * @param pos
     * @returns
     */
    go(pos) {
        return this.getBucket(pos);
    }
    /**
     * 清理所有的bucket
     * @returns
     */
    clear() {
        const { globals, local } = platform;
        const { env } = globals;
        const { buckets } = this;
        this.buckets = [];
        this.point = this.remainStart = this.remainEnd = 0;
        this.maxRemain = 3;
        return Promise.all(buckets.map((bucket) => {
            if (env !== "h5" && env !== "tt") {
                return local.remove(bucket.local);
            }
            return bucket.local;
        }));
    }
}

class VideoEditor {
    painter;
    resource;
    entity;
    constructor(painter, resource, entity) {
        this.painter = painter;
        this.resource = resource;
        this.entity = entity;
    }
    async set(key, value, mode = "R") {
        if (mode === "A") {
            await this.resource.loadImages({ [key]: value }, this.entity.filename, "dynamic");
        }
        else {
            this.entity.images[key] = value;
        }
    }
    /**
     * 获取自定义编辑器
     * @returns
     */
    getContext() {
        return this.painter.YC;
    }
    /**
     * 创建画布图片
     * @param key
     * @param context
     * @param options
     * @returns
     */
    async setCanvas(key, context, options) {
        if (this.entity.locked)
            return;
        const { canvas } = context;
        const width = options?.width ?? canvas.width;
        const height = options?.height ?? canvas.height;
        const imageData = context.getImageData(0, 0, width, height);
        const buff = getBufferFromImageData(imageData);
        await this.set(key, new Uint8Array(buff), options?.mode);
    }
    /**
     * 创建二进制图片
     * @param key
     * @param buff
     * @param options
     * @returns
     */
    async setImage(key, url, options) {
        if (this.entity.locked)
            return;
        if (url.startsWith("data:image")) {
            await this.set(key, url, options?.mode);
        }
        else {
            const buff = await platform.remote.fetch(url);
            await this.set(key, new Uint8Array(buff), options?.mode);
        }
    }
    /**
     * 创建二维码图片
     * @param key
     * @param code
     * @param options
     * @returns
     */
    async setQRCode(key, code, options) {
        if (this.entity.locked)
            return;
        const buff = generateImageBufferFromCode({ ...options, code });
        await this.set(key, new Uint8Array(buff), options?.mode);
    }
}

class Poster {
    /**
     * SVGA 元数据
     * Video Entity
     */
    entity;
    /**
     * 当前的帧，默认值 0
     */
    frame = 0;
    /**
     * 填充模式，类似于 content-mode。
     */
    contentMode = "fill" /* PLAYER_CONTENT_MODE.FILL */;
    /**
     * 是否配置完成
     */
    isConfigured = false;
    /**
     * 刷头实例
     */
    painter;
    resource = null;
    renderer = null;
    constructor(width, height) {
        this.painter = new Painter("poster", width, height);
    }
    async register(selector = "", component) {
        await this.painter.register(selector, "", component);
        this.renderer = new Renderer2D(this.painter.YC);
        this.resource = new ResourceManager(this.painter);
    }
    /**
     * 设置配置项
     * @param options 可配置项
     */
    async setConfig(options = {}, component) {
        const config = typeof options === "string" ? { container: options } : options;
        if (config.container === void 0) {
            config.container = "";
        }
        if (config.contentMode !== void 0) {
            this.contentMode = config.contentMode;
        }
        this.frame = typeof config.frame === "number" ? config.frame : 0;
        this.isConfigured = true;
        await this.register(config.container, component);
    }
    /**
     * 修改内容模式
     * @param contentMode
     */
    setContentMode(contentMode) {
        this.contentMode = contentMode;
    }
    /**
     * 设置当前帧
     * @param frame
     */
    setFrame(frame) {
        this.frame = frame;
    }
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @param currFrame
     * @returns
     */
    async mount(videoEntity) {
        if (!videoEntity) {
            throw new Error("videoEntity undefined");
        }
        if (!this.isConfigured) {
            await this.register();
            this.isConfigured = true;
        }
        const { images, filename } = videoEntity;
        this.painter.clearContainer();
        this.resource.release();
        this.entity = videoEntity;
        await this.resource.loadImages(images, filename);
    }
    /**
     * 绘制海报
     */
    draw() {
        if (!this.entity)
            return;
        const { painter, renderer, resource, entity, contentMode, frame } = this;
        renderer.resize(contentMode, entity.size, painter.X);
        renderer.render(entity, resource.materials, resource.dynamicMaterials, frame, 0, entity.sprites.length);
    }
    /**
     * 获取海报元数据
     * @returns
     */
    toDataURL() {
        const { XC, W, H } = this.painter;
        return getDataURLFromImageData(XC.getImageData(0, 0, W, H));
    }
    /**
     * 销毁海报
     */
    destroy() {
        this.painter.destroy();
        this.renderer?.destroy();
        this.resource?.release();
        this.resource?.cleanup();
        this.entity = void 0;
    }
}

const badge = "【benchmark】";
// 检查环境
const env = (() => {
    if (typeof window !== "undefined") {
        return "h5";
    }
    if (typeof tt !== "undefined") {
        return "tt";
    }
    if (typeof my !== "undefined") {
        return "alipay";
    }
    if (typeof wx !== "undefined") {
        return "weapp";
    }
    return "unknown";
})();
// 检查系统
const sys = (() => {
    if (env === "alipay") {
        return my.getDeviceBaseInfo().platform;
    }
    if (env === "tt") {
        return tt.getDeviceInfoSync().platform;
    }
    if (env === "weapp") {
        // @ts-ignore
        return wx.getDeviceInfo().platform;
    }
    return "unknown";
})().toLocaleLowerCase();
// 检查时间工具
const now = (() => {
    if (env === "h5") {
        return () => performance.now() / 1000;
    }
    if (env === "weapp") {
        // @ts-ignore
        return () => wx.getPerformance().now() / 1000;
    }
    if (env === "alipay") {
        return () => my.getPerformance().now() / 1000;
    }
    return () => Date.now();
})();
class Stopwatch {
    label = "";
    startTime = 0;
    isRealMachine = ["ios", "android", "openharmony"].includes(sys);
    start(label) {
        if (this.isRealMachine) {
            this.label = label;
            this.startTime = now();
        }
        else {
            console.time(label);
        }
    }
    stop(label) {
        if (this.isRealMachine) {
            console.log(`${this.label}: ${now() - this.startTime}`);
        }
        else {
            console.timeEnd(label);
        }
    }
}
const stopwatch = new Stopwatch();
var index = {
    label(label) {
        console.log(badge, label);
    },
    async time(label, callback) {
        stopwatch.start(label);
        const result = await callback();
        stopwatch.stop(label);
        return result;
    },
    line(size = 40) {
        console.log("-".repeat(size));
    },
    log(...message) {
        console.log(badge, ...message);
    },
};

export { Parser, Player, Poster, VideoEditor, VideoManager, index as benchmark, generateImageBufferFromCode, generateImageFromCode, getBufferFromImageData, getDataURLFromImageData, platform };
//# sourceMappingURL=index.js.map
