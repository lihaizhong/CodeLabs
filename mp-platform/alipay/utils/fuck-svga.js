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

const definePlugin = (plugin) => plugin;

/**
 * 用于处理文件路径
 * @returns
 */
var pluginPath = definePlugin({
    name: "path",
    install() {
        const { env, br } = this.global;
        const filename = (path) => path.substring(path.lastIndexOf('/') + 1);
        if (env === "h5") {
            return {
                USER_DATA_PATH: "",
                filename,
                resolve: (_filename, _prefix) => "",
            };
        }
        const { USER_DATA_PATH } = env === "tt"
            ? tt.getEnvInfoSync().common
            : br.env;
        return {
            USER_DATA_PATH,
            filename,
            resolve: (filename, prefix) => `${USER_DATA_PATH}/${prefix ? `${prefix}.` : ""}${filename}`,
        };
    },
});

var pluginNow = definePlugin({
    name: "now",
    install() {
        const { env, br } = this.global;
        // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
        const perf = env === "h5" ? globalThis.performance : env === "tt" ? br.performance : br.getPerformance();
        if (typeof perf?.now === "function") {
            this.global.isPerf = true;
            // 数值接近，说明perf.now()获得的是高精度的时间戳
            if (perf.now() / 1000 - Date.now() < 2) {
                return () => perf.now() / 1000;
            }
            return () => perf.now();
        }
        return () => Date.now();
    },
});

/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
function utf8(buffer, start, end) {
    if (end > buffer.length)
        throw new RangeError("End exceeds buffer length");
    if (end - start < 1)
        return "";
    const codes = []; // 预分配内存空间
    let chunk = ""; // ASCII 字符块缓存
    const fromCharCode = String.fromCharCode;
    for (let i = start; i < end;) {
        const t = buffer[i++];
        if (t <= 0x7f) {
            // ASCII 快速路径
            chunk += fromCharCode(t);
            // 每 1024 个字符或遇到变长编码时提交块
            if (chunk.length >= 1024 || (i < end && buffer[i] > 0x7f)) {
                codes.push(...chunk.split("").map((c) => c.charCodeAt(0)));
                chunk = "";
            }
        }
        else {
            if (chunk.length > 0) {
                codes.push(...chunk.split("").map((c) => c.charCodeAt(0)));
                chunk = "";
            }
            // 变长编码处理
            let codePoint;
            if (t >= 0xc0 && t < 0xe0) {
                // 2-byte
                codePoint = ((t & 0x1f) << 6) | (buffer[i++] & 0x3f);
            }
            else if (t >= 0xe0 && t < 0xf0) {
                // 3-byte
                codePoint =
                    ((t & 0xf) << 12) |
                        ((buffer[i++] & 0x3f) << 6) |
                        (buffer[i++] & 0x3f);
            }
            else {
                // 4-byte
                codePoint =
                    (((t & 7) << 18) |
                        ((buffer[i++] & 0x3f) << 12) |
                        ((buffer[i++] & 0x3f) << 6) |
                        (buffer[i++] & 0x3f)) -
                        0x10000;
                codes.push(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff));
                continue;
            }
            codes.push(codePoint);
        }
    }
    if (chunk.length > 0) {
        // 提交最后的 ASCII 块
        codes.push(...chunk.split("").map((c) => c.charCodeAt(0)));
    }
    return String.fromCharCode(...codes); // 单次内存分配
}
/**
 * 用于处理数据解码
 * @returns
 */
var pluginDecode = definePlugin({
    name: "decode",
    install() {
        const { env, br } = this.global;
        const wrapper = (b64) => `data:image/png;base64,${b64}`;
        const decode = {
            toBuffer(data) {
                const { buffer, byteOffset, byteLength } = data;
                return buffer.slice(byteOffset, byteOffset + byteLength);
            },
        };
        if (env === "h5") {
            const textDecoder = new TextDecoder();
            decode.toBitmap = (data) => globalThis.createImageBitmap(new Blob([decode.toBuffer(data)]));
            decode.toDataURL = (data) => wrapper(globalThis.btoa(String.fromCharCode(...data)));
            decode.utf8 = (data, start, end) => textDecoder.decode(data.subarray(start, end));
        }
        else {
            decode.toDataURL = (data) => wrapper(br.arrayBufferToBase64(decode.toBuffer(data)));
            decode.utf8 = utf8;
        }
        return decode;
    },
});

/**
 * 用于处理远程文件读取
 * @returns
 */
var pluginDownload = definePlugin({
    name: "remote",
    install() {
        const { env, br } = this.global;
        const isRemote = (url) => /^http(s)?:\/\//.test(url);
        if (env === 'h5') {
            return {
                is: isRemote,
                read: (url) => fetch(url).then((response) => {
                    if (response.ok) {
                        return response.arrayBuffer();
                    }
                    throw new Error(`HTTP error, status=${response.status}, statusText=${response.statusText}`);
                })
            };
        }
        return {
            is: isRemote,
            read: (url) => new Promise((resolve, reject) => {
                br.request({
                    url,
                    // @ts-ignore 支付宝小程序必须有该字段
                    dataType: "arraybuffer",
                    responseType: "arraybuffer",
                    enableCache: true,
                    success: (res) => resolve(res.data),
                    fail: reject,
                });
            })
        };
    }
});

/**
 * 获取并重置Canvas
 * @param canvas
 * @param width
 * @param height
 * @param dpr
 * @returns
 */
function initCanvas(canvas, width, height, dpr) {
    if (!canvas) {
        throw new Error("canvas not found.");
    }
    const context = canvas.getContext("2d");
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    // context.scale(dpr, dpr);
    return { canvas, context };
}
/**
 * 用于获取canvas
 * @returns
 */
var pluginCanvas = definePlugin({
    name: "getCanvas",
    install() {
        const { env, br, dpr } = this.global;
        if (env === "h5") {
            return (selector) => {
                return new Promise((resolve) => {
                    const canvas = document.querySelector(selector);
                    const { clientWidth, clientHeight } = canvas;
                    resolve(initCanvas(canvas, clientWidth, clientHeight, dpr));
                });
            };
        }
        return (selector, component) => {
            return new Promise((resolve) => {
                let query = br.createSelectorQuery();
                if (component) {
                    query = query.in(component);
                }
                query
                    .select(selector)
                    .fields({ node: true, size: true }, (res) => {
                    const { node, width, height } = res || {};
                    resolve(initCanvas(node, width, height, dpr));
                })
                    .exec();
            });
        };
    },
});

/**
 * 用于创建离屏canvas
 * @returns
 */
var pluginOfsCanvas = definePlugin({
    name: "getOfsCanvas",
    install() {
        const { env } = this.global;
        let createOffscreenCanvas;
        if (env === "h5") {
            createOffscreenCanvas = (options) => {
                return new OffscreenCanvas(options.width, options.height);
            };
        }
        else if (env === "alipay") {
            createOffscreenCanvas = (options) => {
                return my.createOffscreenCanvas({
                    width: options.width,
                    height: options.height,
                });
            };
        }
        else if (env === "tt") {
            createOffscreenCanvas = (options) => {
                const canvas = tt.createOffscreenCanvas();
                canvas.width = options.width;
                canvas.height = options.height;
                return canvas;
            };
        }
        else {
            createOffscreenCanvas = (options) => {
                return wx.createOffscreenCanvas({
                    ...options,
                    type: "2d",
                });
            };
        }
        return (options) => {
            const canvas = createOffscreenCanvas(options);
            const context = canvas.getContext("2d");
            return {
                canvas,
                context,
            };
        };
    },
});

/**
 * 图片加载插件
 * @package plugin-fsm 本地文件存储能力
 * @package plugin-path 路径处理能力
 * @package plugin-decode 解码能力
 */
var pluginImage = definePlugin({
    name: "image",
    install() {
        const { local, path, decode } = this;
        const { env, br } = this.global;
        /**
         * 加载图片
         * @param img
         * @param src
         * @returns
         */
        function loadImage(img, src) {
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    // 如果 data 是 URL/base64 或者 img.src 是 base64
                    if (env === "h5" ||
                        src.startsWith("data:") ||
                        typeof src === "string") {
                        resolve(img);
                    }
                    else {
                        local
                            .remove(src)
                            .then(() => resolve(img))
                            .catch(() => resolve(img));
                    }
                };
                img.onerror = () => reject(new Error(`SVGA LOADING FAILURE: ${img.src}`));
                img.src = src;
            });
        }
        if (env === "h5") {
            const createImage = (_) => new Image();
            const genImageSource = (data) => {
                if (typeof data === "string") {
                    return data;
                }
                return decode.toDataURL(data);
            };
            return {
                isImage: (data) => data instanceof Image,
                isImageBitmap: (data) => data instanceof ImageBitmap,
                create: createImage,
                load: (brush, data, _filename, _prefix) => {
                    // 由于ImageBitmap在图片渲染上有优势，故优先使用
                    if (data instanceof Uint8Array && "createImageBitmap" in globalThis) {
                        return decode.toBitmap(data);
                    }
                    if (data instanceof ImageBitmap) {
                        return Promise.resolve(data);
                    }
                    const src = genImageSource(data);
                    const img = createImage();
                    return loadImage(img, src);
                },
            };
        }
        const createImage = (brush) => brush.createImage();
        const genImageSource = async (data, filename, prefix) => {
            if (typeof data === "string") {
                return data;
            }
            // FIXME: 支付宝小程序IDE保存临时文件会失败;抖音最大用户文件大小为10M
            if (env === "tt" || (env === "alipay" && br.isIDE)) {
                return decode.toDataURL(data);
            }
            try {
                // FIXME: IOS设备Uint8Array转base64时间较长，使用图片缓存形式速度会更快
                return local.write(decode.toBuffer(data), path.resolve(filename, prefix));
            }
            catch (ex) {
                console.warn(`图片缓存失败：${ex.message}`);
                return decode.toDataURL(data);
            }
        };
        return {
            isImage: (data) => !!(data &&
                data.src !== undefined &&
                data.width !== undefined &&
                data.height !== undefined),
            isImageBitmap: (_data) => false,
            create: createImage,
            load: async (brush, data, filename, prefix) => {
                const src = await genImageSource(data, filename, prefix);
                const img = createImage(brush);
                return loadImage(img, src);
            },
        };
    },
});

/**
 * 用于处理requestAnimationFrame
 * @returns
 */
var pluginRaf = definePlugin({
    name: "rAF",
    install() {
        const { env } = this.global;
        if (env === "h5") {
            return (_, callback) => globalThis.requestAnimationFrame(callback);
        }
        return (canvas, callback) => canvas.requestAnimationFrame(callback);
    },
});

const stopwatch = {
    time(label) {
        console.time?.(label);
    },
    timeEnd(label) {
        console.timeEnd?.(label);
    }
};
var benchmark = {
    count: 20,
    label(label) {
        console.log(label);
    },
    async time(label, callback) {
        stopwatch.time(label);
        const result = await callback();
        stopwatch.timeEnd(label);
        return result;
    },
    line(size = 40) {
        console.log("-".repeat(size));
    },
    log(...message) {
        console.log("【benchmark】", ...message);
    },
};

/**
 * 用于处理本地文件存储
 * @returns
 */
var pluginFsm = definePlugin({
    name: "local",
    install() {
        const { noop } = this;
        const { env, fsm } = this.global;
        if (env !== "h5") {
            return {
                write: (data, filePath) => {
                    benchmark.log(`write file: ${filePath}`);
                    return new Promise((resolve, reject) => {
                        fsm.access({
                            path: filePath,
                            success() {
                                resolve(filePath);
                            },
                            fail() {
                                fsm.writeFile({
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
                },
                read: (filePath) => {
                    return new Promise((resolve, reject) => {
                        fsm.access({
                            path: filePath,
                            success() {
                                fsm.readFile({
                                    filePath,
                                    success: (res) => resolve(res.data),
                                    fail: reject,
                                });
                            },
                            fail: reject,
                        });
                    });
                },
                remove: (filePath) => {
                    return new Promise((resolve) => {
                        fsm.access({
                            path: filePath,
                            success() {
                                benchmark.log(`remove file: ${filePath}`);
                                fsm.unlink({
                                    filePath,
                                    success: () => resolve(filePath),
                                    fail(err) {
                                        benchmark.log(`remove fail: ${filePath}`, err);
                                        resolve(filePath);
                                    },
                                });
                            },
                            fail(err) {
                                benchmark.log(`access fail: ${filePath}`, err);
                                resolve(filePath);
                            },
                        });
                    });
                }
            };
        }
        return {
            write: noop,
            read: noop,
            remove: noop,
        };
    },
});

const noop$2 = () => { };
class Platform {
    plugins = [
        pluginPath,
        pluginNow,
        pluginDecode,
        pluginFsm,
        pluginDownload,
        pluginRaf,
        pluginCanvas,
        pluginOfsCanvas,
        // 带依赖的插件，需要放在最后
        pluginImage
    ];
    global = {
        env: "unknown",
        br: null,
        fsm: null,
        dpr: 1,
        isPerf: false,
        sys: "UNKNOWN",
    };
    noop = noop$2;
    now = noop$2;
    path = {};
    local = {};
    remote = {};
    decode = {};
    image = {};
    rAF = noop$2;
    getCanvas = noop$2;
    getOfsCanvas = noop$2;
    constructor() {
        this.global.env = this.autoEnv();
        this.init();
    }
    init() {
        this.global.br = this.useBridge();
        this.global.dpr = this.usePixelRatio();
        this.global.fsm = this.useFileSystemManager();
        this.global.sys = this.useSystem().toLocaleLowerCase();
        this.usePlugins();
    }
    autoEnv() {
        // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
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
        throw new Error("Unsupported app");
    }
    useBridge() {
        switch (this.global.env) {
            case "h5":
                return globalThis;
            case "alipay":
                return my;
            case "tt":
                return tt;
            case "weapp":
                return wx;
        }
        return {};
    }
    usePixelRatio() {
        const { env, br } = this.global;
        if (env === "h5") {
            return globalThis.devicePixelRatio;
        }
        if ("getWindowInfo" in br) {
            return br.getWindowInfo().pixelRatio;
        }
        if ("getSystemInfoSync" in br) {
            return br.getSystemInfoSync().pixelRatio;
        }
        return 1;
    }
    useFileSystemManager() {
        const { br } = this.global;
        if ("getFileSystemManager" in br) {
            return br.getFileSystemManager();
        }
        return null;
    }
    useSystem() {
        const { env, br } = this.global;
        if (env === "h5") {
            const UA = navigator.userAgent;
            if (/(Android)/i.test(UA)) {
                return "Android";
            }
            if (/(iPhone|iPad|iPod|iOS)/i.test(UA)) {
                return "iOS";
            }
            if (/(OpenHarmony|ArkWeb)/i.test(UA)) {
                return "OpenHarmony";
            }
        }
        else {
            if (env === "alipay") {
                return br.getDeviceBaseInfo().platform;
            }
            if (env === "tt") {
                return br.getDeviceInfoSync().platform;
            }
            if (env === "weapp") {
                return br.getDeviceInfo().platform;
            }
        }
        return "UNKNOWN";
    }
    usePlugins() {
        this.plugins.forEach((plugin) => {
            const value = plugin.install.call(this);
            if (value !== undefined) {
                Reflect.set(this, plugin.name, value);
            }
        });
    }
    switch(env) {
        this.global.env = env;
        this.init();
    }
}
const platform = new Platform();

const dv = new DataView(new ArrayBuffer(4));
var float = {
    readFloatLE(buf, pos) {
        new Uint8Array(dv.buffer).set(buf.subarray(pos, pos + 4));
        return dv.getFloat32(0, true);
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
        return platform.decode.utf8(bytes, 0, bytes.length);
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

// import { LongBits } from "../../archive/dts";
// export function noop() {}
// export function writeByte(val: number, buf: Uint8Array, pos: number) {
//   buf[pos] = val & 255;
// }
// export function writeBytes(val: number[], buf: Uint8Array, pos: number) {
//   // also works for plain array values
//   buf.set(val, pos);
// }
// export function writeVarint32(val: number, buf: Uint8Array, pos: number) {
//   while (val > 127) {
//     buf[pos++] = (val & 127) | 128;
//     val >>>= 7;
//   }
//   buf[pos] = val;
// }
// export function writeVarint64(val: LongBits, buf: Uint8Array, pos: number) {
//   while (val.hi) {
//     buf[pos++] = (val.lo & 127) | 128;
//     val.lo = ((val.lo >>> 7) | (val.hi << 25)) >>> 0;
//     val.hi >>>= 7;
//   }
//   while (val.lo > 127) {
//     buf[pos++] = (val.lo & 127) | 128;
//     val.lo = val.lo >>> 7;
//   }
//   buf[pos++] = val.lo;
// }
// export function writeFixed32(val: number, buf: Uint8Array, pos: number) {
//   buf[pos] = val & 255;
//   buf[pos + 1] = (val >>> 8) & 255;
//   buf[pos + 2] = (val >>> 16) & 255;
//   buf[pos + 3] = val >>> 24;
// }
/**
 * Tests if the specified value is an string.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an string
 */
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
            if (mShape.type === 0 && shape) {
                shapes.push({
                    type: "shape" /* SHAPE_TYPE.SHAPE */,
                    path: shape,
                    styles: SS,
                    transform: ST,
                });
            }
            else if (mShape.type === 1 && rect) {
                shapes.push({
                    type: "rect" /* SHAPE_TYPE.RECT */,
                    path: rect,
                    styles: SS,
                    transform: ST,
                });
            }
            else if (mShape.type === 2 && ellipse) {
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
    static parseVideo(data, url) {
        const header = new Uint8Array(data, 0, 4);
        const u8a = new Uint8Array(data);
        if (header.toString() === "80,75,3,4") {
            throw new Error("this parser only support version@2 of SVGA.");
        }
        let entity;
        benchmark.time("unzlibSync", () => {
            const inflateData = unzlibSync(u8a);
            const movieData = MovieEntity.decode(inflateData);
            entity = new VideoEntity(movieData, platform.path.filename(url));
        });
        return entity;
    }
    /**
     * 读取文件资源
     * @param url 文件资源地址
     * @returns
     */
    download(url) {
        const { remote, local, global } = platform;
        // 读取远程文件
        if (remote.is(url)) {
            return remote.read(url);
        }
        // 读取本地文件
        if (global.env !== "h5") {
            return local.read(url);
        }
        return Promise.resolve(null);
    }
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    async load(url) {
        const data = await this.download(url);
        benchmark.label(url);
        benchmark.line();
        return Parser.parseVideo(data, url);
    }
}

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
const VALID_METHODS = "MLHVCSQZmlhvcsqz";
function render(context, materials, videoEntity, currentFrame, head, tail, globalTransform) {
    const { sprites, replaceElements, dynamicElements } = videoEntity;
    for (let i = head; i < tail; i++) {
        const sprite = sprites[i];
        const { imageKey } = sprite;
        const bitmap = materials.get(imageKey);
        const replaceElement = replaceElements[imageKey];
        const dynamicElement = dynamicElements[imageKey];
        drawSprite(context, sprite, currentFrame, bitmap, replaceElement, dynamicElement, globalTransform);
    }
}
function drawSprite(context, sprite, currentFrame, bitmap, replaceElement, dynamicElement, globalTransform) {
    const frame = sprite.frames[currentFrame];
    if (frame.alpha < 0.05)
        return;
    context.save();
    if (globalTransform) {
        context.transform(globalTransform.a, globalTransform.b, globalTransform.c, globalTransform.d, globalTransform.tx, globalTransform.ty);
    }
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
    if (!styles)
        return;
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
            if (segment.length === 0) {
                continue;
            }
            const firstLetter = segment.substring(0, 1);
            if (VALID_METHODS.includes(firstLetter)) {
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
            if (currentPoint.x1 !== undefined &&
                currentPoint.y1 !== undefined &&
                currentPoint.x2 !== undefined &&
                currentPoint.y2 !== undefined) {
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
            if (currentPoint.x1 !== undefined &&
                currentPoint.y1 !== undefined &&
                currentPoint.x2 !== undefined &&
                currentPoint.y2 !== undefined) {
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

class ImageManager {
    // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
    images = [];
    /**
     * 图片bitmap
     */
    bitmaps = [];
    /**
     * 素材
     */
    materials = new Map();
    /**
     * 获取图片素材
     * @returns
     */
    getMaterials() {
        return this.materials;
    }
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    async loadImages(images, brush, filename) {
        const { load, isImage, isImageBitmap } = platform.image;
        const imageAwaits = [];
        const imageIns = [];
        const imageBitmapIns = [];
        Object.keys(images).forEach((key) => {
            const image = images[key];
            if (isImage(image)) {
                imageIns.push(image);
            }
            else {
                const p = load(brush, image, filename, key).then((img) => {
                    this.materials.set(key, img);
                    if (isImage(img)) {
                        imageIns.push(img);
                    }
                    else if (isImageBitmap(img)) {
                        imageBitmapIns.push(img);
                    }
                    return img;
                });
                imageAwaits.push(p);
            }
        });
        await Promise.all(imageAwaits);
        this.images = imageIns;
        this.bitmaps = imageBitmapIns;
    }
    /**
     * 创建图片标签
     * @returns
     */
    createImage(canvas) {
        return this.images.shift() || platform.image.create(canvas);
    }
    /**
     * 清理素材
     */
    clear() {
        this.materials.clear();
        for (let i = 0; i < this.images.length; i++) {
            const img = this.images[i];
            img.onload = null;
            img.onerror = null;
            img.src = "";
        }
        for (let i = 0; i < this.bitmaps.length; i++) {
            this.bitmaps[i].close();
        }
        this.bitmaps = [];
    }
}

const { noop: noop$1 } = platform;
class Brush {
    mode;
    W;
    H;
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
     * 粉刷模式
     */
    model = {};
    IM = new ImageManager();
    globalTransform;
    /**
     *
     * @param mode
     *  - poster: 海报模式
     *  - animation: 动画模式
     *  - 默认为 animation
     * @param W 海报模式必须传入
     * @param H 海报模式必须传入
     */
    constructor(mode = "animation", W = 0, H = 0) {
        this.mode = mode;
        this.W = W;
        this.H = H;
    }
    setModel(type) {
        const { model } = this;
        const { env, sys } = platform.global;
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
        // set render
        if ((type === "C" &&
            (env === "tt" || (sys === "IOS" && env === "alipay"))) ||
            (type === "O" && env === "weapp")) {
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
        const { getCanvas, getOfsCanvas } = platform;
        // #region set main screen implement
        // -------- 创建主屏 ---------
        if (mode === "poster") {
            const { W, H } = this;
            if (!(W > 0 && H > 0)) {
                throw new Error("Poster mode must set width and height when create Brush instance");
            }
            const { canvas, context } = getOfsCanvas({ width: W, height: H });
            this.X = canvas;
            this.XC = context;
        }
        else {
            const { canvas, context } = await getCanvas(selector, component);
            const { width, height } = canvas;
            // 添加主屏
            this.X = canvas;
            this.XC = context;
            this.W = width;
            this.H = height;
        }
        // #endregion set main screen implement
        // #region set secondary screen implement
        // ------- 创建副屏 ---------
        if (mode === "poster") {
            this.Y = this.X;
            this.YC = this.XC;
            this.setModel("O");
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
            this.clearSecondary = this.stick = noop$1;
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
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    loadImages(images, filename) {
        return this.IM.loadImages(images, this, filename);
    }
    /**
     * 创建图片标签
     * @returns
     */
    createImage() {
        return this.IM.createImage(this.X);
    }
    /**
     * 生成图片
     * @returns
     */
    getImageData() {
        return this.XC.getImageData(0, 0, this.W, this.H);
    }
    resize(contentMode, videoSize) {
        const { Y } = this;
        let scaleX = 1.0;
        let scaleY = 1.0;
        let translateX = 0.0;
        let translateY = 0.0;
        if (contentMode === "fill" /* PLAYER_CONTENT_MODE.FILL */) {
            scaleX = Y.width / videoSize.width;
            scaleY = Y.height / videoSize.height;
        }
        else if ([
            "aspect-fill" /* PLAYER_CONTENT_MODE.ASPECT_FILL */,
            "aspect-fit" /* PLAYER_CONTENT_MODE.ASPECT_FIT */,
        ].includes(contentMode)) {
            const imageRatio = videoSize.width / videoSize.height;
            const viewRatio = Y.width / Y.height;
            if ((imageRatio >= viewRatio &&
                contentMode === "aspect-fit" /* PLAYER_CONTENT_MODE.ASPECT_FIT */) ||
                (imageRatio <= viewRatio &&
                    contentMode === "aspect-fill" /* PLAYER_CONTENT_MODE.ASPECT_FILL */)) {
                scaleX = scaleY = Y.width / videoSize.width;
                translateY = (Y.height - videoSize.height * scaleY) / 2.0;
            }
            else if ((imageRatio < viewRatio &&
                contentMode === "aspect-fit" /* PLAYER_CONTENT_MODE.ASPECT_FIT */) ||
                (imageRatio > viewRatio &&
                    contentMode === "aspect-fill" /* PLAYER_CONTENT_MODE.ASPECT_FILL */)) {
                scaleX = scaleY = Y.height / videoSize.height;
                translateX = (Y.width - videoSize.width * scaleX) / 2.0;
            }
        }
        this.globalTransform = {
            a: scaleX,
            b: 0.0,
            c: 0.0,
            d: scaleY,
            tx: translateX,
            ty: translateY,
        };
    }
    /**
     * 注册刷新屏幕的回调函数
     * @param cb
     */
    flush(cb) {
        platform.rAF(this.X, cb);
    }
    clearContainer = noop$1;
    clearSecondary = noop$1;
    /**
     * 清理素材库
     */
    clearMaterials() {
        this.IM.clear();
    }
    /**
     * 绘制图片片段
     * @param videoEntity
     * @param currentFrame
     * @param start
     * @param end
     */
    draw(videoEntity, currentFrame, start, end) {
        render(this.YC, this.IM.getMaterials(), videoEntity, currentFrame, start, end, this.globalTransform);
    }
    stick = noop$1;
    /**
     * 销毁画笔
     */
    destroy() {
        this.clearContainer();
        this.clearSecondary();
        this.clearMaterials();
        this.X = this.XC = this.Y = this.YC = null;
        this.clearContainer = this.clearSecondary = this.stick = noop$1;
    }
}

const { now, noop } = platform;
/**
 * 动画控制器
 */
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
    /* ---- 事件钩子 ---- */
    onStart = noop;
    onUpdate = noop;
    onEnd = noop;
    constructor(brush) {
        this.brush = brush;
    }
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
        this.startTime = now();
        this.onStart();
        this.doFrame();
    }
    resume() {
        this.isRunning = true;
        this.startTime = now();
        this.doFrame();
    }
    pause() {
        this.isRunning = false;
        // 设置暂停的位置
        this.loopStart = (now() - this.startTime + this.loopStart) % this.duration;
    }
    stop() {
        this.isRunning = false;
        this.loopStart = 0;
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
        benchmark.time('update partial', () => this.onUpdate(TP));
        if (!this.isRunning && ended) {
            this.onEnd();
        }
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
            ["forwards" /* PLAYER_FILL_MODE.FORWARDS */, "backwards" /* PLAYER_FILL_MODE.BACKWARDS */].includes(config.fillMode)) {
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
        let currFrame = loopStartFrame;
        let extFrame = 0;
        // 顺序播放/倒叙播放
        if (playMode === "forwards" /* PLAYER_PLAY_MODE.FORWARDS */) {
            // 如果开始动画的当前帧是最后一帧，重置为开始帧
            if (currFrame === end - 1) {
                currFrame = start;
            }
            if (fillMode === "forwards" /* PLAYER_FILL_MODE.FORWARDS */) {
                extFrame = 1;
            }
        }
        else {
            // 如果开始动画的当前帧是最后一帧，重置为开始帧
            if (currFrame === 0) {
                currFrame = end - 1;
            }
            if (fillMode === "backwards" /* PLAYER_FILL_MODE.BACKWARDS */) {
                extFrame = 1;
            }
        }
        // 每帧持续的时间
        const frameDuration = 1000 / fps;
        return {
            currFrame,
            startFrame: start,
            endFrame: end,
            totalFrame: frames,
            spriteCount,
            aniConfig: {
                // 单个周期的运行时长
                duration: Math.floor(frames * frameDuration * 10 ** 6) / 10 ** 6,
                // 第一个周期开始时间偏移量
                loopStart: loopStartFrame > start ? (loopStartFrame - start) * frameDuration : 0,
                // 循环次数
                loop: loop === 0 ? Infinity : loop,
                // 最后一帧不在周期内，需要单独计算
                fillValue: extFrame * frameDuration,
            },
        };
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
    entity = undefined;
    /**
     * 当前配置项
     */
    config = new Config();
    /**
     * 刷头实例
     */
    brush = new Brush();
    /**
     * 动画实例
     */
    animator = null;
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
        let config;
        if (typeof options === "string") {
            config = { container: options };
        }
        else {
            config = options;
        }
        this.config.register(config);
        await this.brush.register(config.container, config.secondary, component);
        // 监听容器是否处于浏览器视窗内
        // this.setIntersectionObserver()
        this.animator = new Animator(this.brush);
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
    mount(videoEntity) {
        if (!videoEntity) {
            throw new Error("videoEntity undefined");
        }
        const { images, filename } = videoEntity;
        this.animator.stop();
        this.entity = videoEntity;
        this.brush.clearSecondary();
        this.brush.clearMaterials();
        return this.brush.loadImages(images, filename);
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
        this.brush.clearContainer();
        this.brush.clearSecondary();
        this.onStop?.();
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
            this.startAnimation();
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
        this.stepToFrame(Math.round((percent < 0 ? 0 : percent) * frames) % frames, andPlay);
    }
    /**
     * 开始绘制动画
     */
    startAnimation() {
        const { entity, config, animator, brush } = this;
        const { global, now } = platform;
        const { playMode, contentMode } = config;
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
        // 当前需要绘制的百分比
        let partialDrawPercent;
        // 是否还有剩余时间
        let hasRemained;
        // 更新动画基础信息
        animator.setConfig(duration, loopStart, loop, fillValue);
        brush.resize(contentMode, entity.size);
        // 动态调整每次绘制的块大小
        let dynamicChunkSize = 4; // 初始块大小
        // 分段渲染函数
        let patchDraw;
        if (global.isPerf) {
            const MAX_DRAW_TIME_PER_FRAME = 8;
            let startTime;
            let chunk;
            let elapsed;
            // 使用`指数退避算法`平衡渲染速度和流畅度
            patchDraw = (before) => {
                startTime = now();
                before();
                while (tail < spriteCount) {
                    // 根据当前块大小计算nextTail
                    chunk = Math.min(dynamicChunkSize, spriteCount - tail);
                    nextTail = tail + chunk;
                    brush.draw(entity, currentFrame, tail, nextTail);
                    tail = nextTail;
                    // 动态调整块大小
                    elapsed = now() - startTime;
                    if (elapsed < 3) {
                        console.log('speed up');
                        dynamicChunkSize = Math.min(dynamicChunkSize * 2, 50); // 加快绘制
                    }
                    else if (elapsed > MAX_DRAW_TIME_PER_FRAME) {
                        console.log('slow down');
                        dynamicChunkSize = Math.max(dynamicChunkSize / 2, 1); // 减慢绘制
                        break;
                    }
                }
            };
        }
        else {
            const TAIL_THRESHOLD_FACTOR = 1.15;
            const TAIL_OFFSET = 2;
            // 普通模式
            patchDraw = (before) => {
                before();
                if (tail < spriteCount) {
                    // 1.15 和 2 均为阔值，保证渲染尽快完成
                    nextTail = hasRemained
                        ? Math.min(spriteCount * partialDrawPercent * TAIL_THRESHOLD_FACTOR +
                            TAIL_OFFSET, spriteCount) | 0
                        : spriteCount;
                    if (nextTail > tail) {
                        brush.draw(entity, currentFrame, tail, nextTail);
                        tail = nextTail;
                    }
                }
            };
        }
        // 动画绘制过程
        animator.onUpdate = (timePercent) => {
            patchDraw(() => {
                percent = isReverseMode ? 1 - timePercent : timePercent;
                exactFrame = percent * totalFrame;
                if (isReverseMode) {
                    nextFrame = (timePercent === 0 ? endFrame : Math.ceil(exactFrame)) - 1;
                    partialDrawPercent = Math.abs(1 - exactFrame + currentFrame);
                    // FIXME: 倒序会有一帧的偏差，需要校准当前帧
                    percent = currentFrame / totalFrame;
                }
                else {
                    nextFrame = timePercent === 1 ? startFrame : Math.floor(exactFrame);
                    partialDrawPercent = Math.abs(exactFrame - currentFrame);
                }
                hasRemained = currentFrame === nextFrame;
            });
            if (hasRemained)
                return;
            brush.clearContainer();
            brush.stick();
            brush.clearSecondary();
            dynamicChunkSize = 4;
            latestFrame = currentFrame;
            currentFrame = nextFrame;
            tail = 0;
            this.onProcess?.(~~(percent * 100) / 100, latestFrame);
        };
        animator.onEnd = () => this.onEnd?.();
        animator.start();
    }
}

// CRC32 表
const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
    let c = i;
    let mask;
    for (let j = 0; j < 8; j++) {
        mask = -(c & 1); // 根据 LSB 生成 0xFFFFFFFF 或 0
        c = (c >>> 1) ^ (0xedb88320 & mask);
    }
    table[i] = c;
}
// 计算 CRC32
function crc32(buff) {
    const { length } = buff;
    let crc = 0xffffffff;
    for (let i = 0; i < length; i++) {
        crc = table[(crc ^ buff[i]) & 0xff] ^ (crc >>> 8);
    }
    return crc ^ 0xffffffff;
}

class PNGEncoder {
    width;
    height;
    view;
    pngData = new Uint8Array(0);
    constructor(width, height) {
        this.width = width;
        this.height = height;
        const buff = new ArrayBuffer(4 * width * height);
        this.view = new DataView(buff);
    }
    createChunk(type, data) {
        // 长度（4字节，大端序）
        const length = new Uint8Array(4);
        const lengthView = new DataView(length.buffer);
        lengthView.setUint32(0, data.length, false);
        // 块类型（4字节， ASCII）
        const chunkType = new Uint8Array([
            type.charCodeAt(0),
            type.charCodeAt(1),
            type.charCodeAt(2),
            type.charCodeAt(3),
        ]);
        const partialChunk = new Uint8Array([...chunkType, ...data]);
        // 计算 CRC32 校验（类型 + 数据）
        const crcValue = crc32(partialChunk);
        const crc = new Uint8Array(4);
        const crcView = new DataView(crc.buffer);
        crcView.setUint32(0, crcValue >>> 0, false);
        return new Uint8Array([...length, ...partialChunk, ...crc]);
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
                const pixel = ((pixels[index] << 24) |
                    (pixels[index + 1] << 16) |
                    (pixels[index + 2] << 8) |
                    pixels[index + 3]) >>> 0;
                this.setPixel(x, y, pixel);
            }
        }
    }
    flush() {
        // 1. 文件头（固定 8 字节）
        const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
        const chunks = [
            // 2. IHDR 块（包含图像的宽度、高度、位深度、颜色类型等信息）
            this.createIHDRChunk(),
            // 3. IDAT 块（包含图像数据）
            this.createIDATChunk(),
            // 4. IEND 块（文件结束标记）
            this.createIENDChunk(),
        ];
        const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        let offset = 8;
        this.pngData = new Uint8Array(offset + totalSize);
        this.pngData.set(pngSignature, 0);
        for (const chunk of chunks) {
            this.pngData.set(chunk, offset);
            offset += chunk.length;
        }
    }
    toBuffer() {
        return this.pngData;
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
    const png = new PNGEncoder(size, size);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (min <= x && x < max && min <= y && y < max) {
                const c = ~~((x - min) / cellSize);
                const r = ~~((y - min) / cellSize);
                png.setPixel(x, y, qr.isDark(r, c) ? BLACK : WHITE);
            }
            else {
                png.setPixel(x, y, WHITE);
            }
        }
    }
    png.flush();
    return platform.decode.toDataURL(png.toBuffer());
}

function getDataURLFromImageData(imageData) {
    const { width, height, data } = imageData;
    const pngEncoder = new PNGEncoder(width, height);
    pngEncoder.write(data);
    pngEncoder.flush();
    return platform.decode.toDataURL(pngEncoder.toBuffer());
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
     * SVGA解析器
     */
    parser = new Parser();
    /**
     * 获取视频池大小
     */
    get length() {
        return this.buckets.length;
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
        if (point < 0 || point >= this.length) {
            return this.buckets[this.point];
        }
        const operators = this.updateBucketOperators(point);
        if (operators.length) {
            const waitings = [];
            operators.forEach(({ action, start, end }) => {
                for (let i = start; i < end; i++) {
                    const bucket = this.buckets[i];
                    if (action === "remove") {
                        bucket.entity = null;
                    }
                    else if (action === "add") {
                        bucket.promise = this.parser.load(bucket.local || bucket.origin);
                        if (this.loadMode === "whole" || this.point === i) {
                            waitings.push(bucket.promise);
                        }
                    }
                }
            });
            await Promise.all(waitings);
        }
        return this.get();
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
        const { parser, loadMode } = this;
        const { global, path, local } = platform;
        const { env } = global;
        this.point =
            typeof point === "number" && point > 0 && point < urls.length ? point : 0;
        this.maxRemain =
            typeof maxRemain === "number" && maxRemain > 0 ? maxRemain : 3;
        this.updateRemainPoints();
        this.buckets = await Promise.all(urls.map(async (url, index) => {
            const bucket = {
                origin: url,
                local: "",
                entity: null,
                promise: null,
            };
            if (env === "h5" || env === "tt") {
                bucket.local = url;
                if (this.remainStart <= index && index < this.remainEnd) {
                    if (loadMode === "whole" || index === this.point) {
                        bucket.entity = await parser.load(url);
                    }
                    else {
                        bucket.promise = parser.load(url);
                    }
                }
                return bucket;
            }
            const filePath = path.resolve(path.filename(url), "full");
            const downloadAwait = parser.download(bucket.origin);
            const parseVideoAwait = async (buff) => {
                if (buff) {
                    await local.write(buff, filePath);
                    bucket.local = filePath;
                    if (this.remainStart <= index && index < this.remainEnd) {
                        return Parser.parseVideo(buff, url);
                    }
                }
                return null;
            };
            if (loadMode === "whole" || index === this.point) {
                bucket.entity = await parseVideoAwait(await downloadAwait);
            }
            else {
                bucket.promise = downloadAwait.then(parseVideoAwait);
            }
            return bucket;
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
            bucket.entity = await this.parser.load(bucket.local || bucket.origin);
            return bucket;
        }
        return bucket;
    }
    /**
     * 获取前一个bucket
     * @returns
     */
    prev() {
        return this.getBucket(this.point - 1);
    }
    /**
     * 获取后一个bucket
     * @returns
     */
    next() {
        return this.getBucket(this.point + 1);
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
        const { buckets } = this;
        this.buckets = [];
        this.point = this.remainStart = this.remainEnd = 0;
        this.maxRemain = 3;
        return Promise.all(buckets.map((bucket) => platform.local.remove(bucket.local)));
    }
}

class Poster {
    /**
     * SVGA 元数据
     * Video Entity
     */
    entity = undefined;
    /**
     * 当前的帧，默认值 0
     */
    frame = 0;
    /**
     * 填充模式，类似于 content-mode。
     */
    contentMode = "fill" /* PLAYER_CONTENT_MODE.FILL */;
    /**
     * 刷头实例
     */
    brush;
    constructor(width, height) {
        this.brush = new Brush("poster", width, height);
    }
    /**
     * 设置配置项
     * @param options 可配置项
     */
    setConfig(options, component) {
        let config;
        if (typeof options === "string") {
            config = { container: options };
        }
        else {
            config = options;
        }
        if (config.contentMode) {
            this.contentMode = config.contentMode;
        }
        if (typeof config.frame === 'number') {
            this.frame = config.frame;
        }
        return this.brush.register(config.container, '', component);
    }
    setContentMode(contentMode) {
        this.contentMode = contentMode;
    }
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @param currFrame
     * @returns
     */
    mount(videoEntity) {
        if (!videoEntity) {
            throw new Error("videoEntity undefined");
        }
        const { images, filename } = videoEntity;
        this.entity = videoEntity;
        this.brush.clearMaterials();
        return this.brush.loadImages(images, filename);
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
        this.entity.replaceElements[key] = await platform.image.load(this.brush, url, url);
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
        this.entity.dynamicElements[key] = await platform.image.load(this.brush, url, url);
    }
    /**
     * 绘制海报
     */
    draw() {
        if (!this.entity)
            return;
        const { brush, entity, contentMode, frame, onStart, onEnd } = this;
        onStart?.();
        brush.clearContainer();
        brush.resize(contentMode, entity.size);
        brush.draw(entity, frame, 0, entity.sprites.length);
        onEnd?.();
    }
    /**
     * 获取海报元数据
     * @returns
     */
    toDataURL() {
        return getDataURLFromImageData(this.brush.getImageData());
    }
    /**
     * 清理海报
     */
    clear() {
        this.brush.clearContainer();
        this.brush.clearMaterials();
    }
    /**
     * 销毁海报
     */
    destroy() {
        this.brush.destroy();
        this.entity = undefined;
    }
}

export { Brush, PNGEncoder, Parser, Player, Poster, QRCode, MovieEntity as SVGADecoder, VideoManager, createQRCodeToPNG, getDataURLFromImageData, platform };
//# sourceMappingURL=index.js.map
