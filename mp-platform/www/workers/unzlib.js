/* eslint-disable */
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
const u8 = Uint8Array; const u16 = Uint16Array; const
  i32 = Int32Array

// fixed length extra bits
const fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0])

// fixed distance extra bits
const fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0])

// code length index map
const clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15])

// get base, reverse index map from extra bits
const freb = (eb, start) => {
  const b = new u16(31)
  for (let i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1]
  }
  // numbers here are at max 18 bits
  const r = new i32(b[30])
  for (let i = 1; i < 30; ++i) {
    for (let j = b[i]; j < b[i + 1]; ++j) {
      r[j] = ((j - b[i]) << 5) | i
    }
  }
  return { b, r }
}

const { b: fl, r: revfl } = freb(fleb, 2)
// we can ignore the fact that the other numbers are wrong; they never happen anyway
fl[28] = 258, revfl[258] = 28
const { b: fd } = freb(fdeb, 0)

// map of value to reverse (assuming 16 bits)
const rev = new u16(32768)
for (let i = 0; i < 32768; ++i) {
  // reverse table algorithm from SO
  let x = ((i & 0xAAAA) >> 1) | ((i & 0x5555) << 1)
  x = ((x & 0xCCCC) >> 2) | ((x & 0x3333) << 2)
  x = ((x & 0xF0F0) >> 4) | ((x & 0x0F0F) << 4)
  rev[i] = (((x & 0xFF00) >> 8) | ((x & 0x00FF) << 8)) >> 1
}

// create huffman tree from u8 "map": index -> code length for code index
// mb (max bits) must be at most 15
// TODO: optimize/split up?
const hMap = ((cd, mb, r) => {
  const s = cd.length
  // index
  let i = 0
  // u16 "map": index -> # of codes with bit length = index
  const l = new u16(mb)
  // length of cd must be 288 (total # of codes)
  for (; i < s; ++i) {
    if (cd[i]) ++l[cd[i] - 1]
  }
  // u16 "map": index -> minimum code for bit length = index
  const le = new u16(mb)
  for (i = 1; i < mb; ++i) {
    le[i] = (le[i - 1] + l[i - 1]) << 1
  }
  let co
  if (r) {
    // u16 "map": index -> number of actual bits, symbol for code
    co = new u16(1 << mb)
    // bits to remove for reverser
    const rvb = 15 - mb
    for (i = 0; i < s; ++i) {
      // ignore 0 lengths
      if (cd[i]) {
        // num encoding both symbol and bits read
        const sv = (i << 4) | cd[i]
        // free bits
        const r = mb - cd[i]
        // start value
        let v = le[cd[i] - 1]++ << r
        // m is end value
        for (const m = v | ((1 << r) - 1); v <= m; ++v) {
          // every 16 bit value starting with the code yields the same result
          co[rev[v] >> rvb] = sv
        }
      }
    }
  } else {
    co = new u16(s)
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> (15 - cd[i])
      }
    }
  }
  return co
})

// fixed length tree
const flt = new u8(288)
for (let i = 0; i < 144; ++i) flt[i] = 8
for (let i = 144; i < 256; ++i) flt[i] = 9
for (let i = 256; i < 280; ++i) flt[i] = 7
for (let i = 280; i < 288; ++i) flt[i] = 8
// fixed distance tree
const fdt = new u8(32)
for (let i = 0; i < 32; ++i) fdt[i] = 5

// find max of array
const max = (a) => {
  let m = a[0]
  for (let i = 1; i < a.length; ++i) {
    if (a[i] > m) m = a[i]
  }
  return m
}

// read d, starting at bit p and mask with m
const bits = (d, p, m) => {
  const o = (p / 8) | 0
  return ((d[o] | (d[o + 1] << 8)) >> (p & 7)) & m
}

// read d, starting at bit p continuing for at least 16 bits
const bits16 = (d, p) => {
  const o = (p / 8) | 0
  return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) >> (p & 7))
}

// get end of byte
const shft = (p) => ((p + 7) / 8) | 0

// typed array slice - allows garbage collector to free original reference,
// while being more compatible than .slice
const slc = (v, s, e) => {
  if (s == null || s < 0) s = 0
  if (e == null || e > v.length) e = v.length
  // can't use .constructor in case user-supplied
  return new u8(v.subarray(s, e))
}

// error codes
const ec = [
  'unexpected EOF',
  'invalid block type',
  'invalid length/literal',
  'invalid distance',
  'stream finished',
  'no stream handler',, // determined by compression function
  'no callback',
  'invalid UTF-8 data',
  'extra field too long',
  'date not in range 1980-2099',
  'filename too long',
  'stream finishing',
  'invalid zip data',
  // determined by unknown compression method
]

const err = (ind, msg, nt) => {
  const e = new Error(msg || ec[ind])
  e.code = ind
  if (Error.captureStackTrace) Error.captureStackTrace(e, err)
  if (!nt) throw e
  return e
}

const flrm = /*#__PURE__*/ hMap(flt, 9, 1);
const fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);

// expands raw DEFLATE data
const inflt = (dat, st, buf, dict) => {
  // source length       dict length
  const sl = dat.length; const
    dl = dict ? dict.length : 0
  if (!sl || st.f && !st.l) return buf || new u8(0)
  const noBuf = !buf
  // have to estimate size
  const resize = noBuf || st.i != 2
  // no state
  const noSt = st.i
  // Assumes roughly 33% compression ratio average
  if (noBuf) buf = new u8(sl * 3)
  // ensure buffer can fit at least l elements
  const cbuf = (l) => {
    const bl = buf.length
    // need to increase size to fit
    if (l > bl) {
      // Double or set to necessary, whichever is greater
      const nbuf = new u8(Math.max(bl * 2, l))
      nbuf.set(buf)
      buf = nbuf
    }
  }
  //  last chunk         bitpos           bytes
  let final = st.f || 0; let pos = st.p || 0; let bt = st.b || 0; let lm = st.l; let dm = st.d; let lbt = st.m; let
    dbt = st.n
  // total bits
  const tbts = sl * 8
  do {
    if (!lm) {
      // BFINAL - this is only 1 when last chunk is next
      final = bits(dat, pos, 1)
      // type: 0 = no compression, 1 = fixed huffman, 2 = dynamic huffman
      const type = bits(dat, pos + 1, 3)
      pos += 3
      if (!type) {
        // go to end of byte boundary
        const s = shft(pos) + 4; const l = dat[s - 4] | (dat[s - 3] << 8); const
          t = s + l
        if (t > sl) {
          if (noSt) err(0)
          break
        }
        // ensure size
        if (resize) cbuf(bt + l)
        // Copy over uncompressed data
        buf.set(dat.subarray(s, t), bt)
        // Get new bitpos, update byte count
        st.b = bt += l, st.p = pos = t * 8, st.f = final
        continue
      } else if (type == 1) lm = flrm, dm = fdrm, lbt = 9, dbt = 5
      else if (type == 2) {
        //  literal                            lengths
        const hLit = bits(dat, pos, 31) + 257; const
          hcLen = bits(dat, pos + 10, 15) + 4
        const tl = hLit + bits(dat, pos + 5, 31) + 1
        pos += 14
        // length+distance tree
        const ldt = new u8(tl)
        // code length tree
        const clt = new u8(19)
        for (let i = 0; i < hcLen; ++i) {
          // use index map to get real code
          clt[clim[i]] = bits(dat, pos + i * 3, 7)
        }
        pos += hcLen * 3
        // code lengths bits
        const clb = max(clt); const
          clbmsk = (1 << clb) - 1
        // code lengths map
        const clm = hMap(clt, clb, 1)
        for (let i = 0; i < tl;) {
          const r = clm[bits(dat, pos, clbmsk)]
          // bits read
          pos += r & 15
          // symbol
          const s = r >> 4
          // code length to copy
          if (s < 16) {
            ldt[i++] = s
          } else {
            //  copy   count
            let c = 0; let
              n = 0
            if (s == 16) n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1]
            else if (s == 17) n = 3 + bits(dat, pos, 7), pos += 3
            else if (s == 18) n = 11 + bits(dat, pos, 127), pos += 7
            while (n--) ldt[i++] = c
          }
        }
        //    length tree                 distance tree
        const lt = ldt.subarray(0, hLit); const
          dt = ldt.subarray(hLit)
        // max length bits
        lbt = max(lt)
        // max dist bits
        dbt = max(dt)
        lm = hMap(lt, lbt, 1)
        dm = hMap(dt, dbt, 1)
      } else err(1)
      if (pos > tbts) {
        if (noSt) err(0)
        break
      }
    }
    // Make sure the buffer can hold this + the largest possible addition
    // Maximum chunk size (practically, theoretically infinite) is 2^17
    if (resize) cbuf(bt + 131072)
    const lms = (1 << lbt) - 1; const
      dms = (1 << dbt) - 1
    let lpos = pos
    for (;; lpos = pos) {
      // bits read, code
      const c = lm[bits16(dat, pos) & lms]; const
        sym = c >> 4
      pos += c & 15
      if (pos > tbts) {
        if (noSt) err(0)
        break
      }
      if (!c) err(2)
      if (sym < 256) buf[bt++] = sym
      else if (sym == 256) {
        lpos = pos, lm = undefined
        break
      } else {
        let add = sym - 254
        // no extra bits needed if less
        if (sym > 264) {
          // index
          const i = sym - 257; const
            b = fleb[i]
          add = bits(dat, pos, (1 << b) - 1) + fl[i]
          pos += b
        }
        // dist
        const d = dm[bits16(dat, pos) & dms]; const
          dsym = d >> 4
        if (!d) err(3)
        pos += d & 15
        let dt = fd[dsym]
        if (dsym > 3) {
          const b = fdeb[dsym]
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b
        }
        if (pos > tbts) {
          if (noSt) err(0)
          break
        }
        if (resize) cbuf(bt + 131072)
        const end = bt + add
        if (bt < dt) {
          const shift = dl - dt; const
            dend = Math.min(dt, end)
          if (shift + bt < 0) err(3)
          for (; bt < dend; ++bt) buf[bt] = dict[shift + bt]
        }
        for (; bt < end; ++bt) buf[bt] = buf[bt - dt]
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final
    if (lm) final = 1, st.m = lbt, st.d = dm, st.n = dbt
  } while (!final)
  // don't reallocate for streams or user buffers
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt)
}

// zlib start
const zls = (d, dict) => {
  if ((d[0] & 15) != 8 || (d[0] >> 4) > 7 || ((d[0] << 8 | d[1]) % 31)) err(6, 'invalid zlib data')
  if ((d[1] >> 5 & 1) == +!dict) err(6, `invalid zlib data: ${d[1] & 32 ? 'need' : 'unexpected'} dictionary`)
  return (d[1] >> 3 & 4) + 2
}

// before you yell at me for not just using extends, my reason is that TS inheritance is hard to workerize.

/**
 * Expands Zlib data
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
function unzlibSync(data, opts = {}) {
  return inflt(data.subarray(zls(data, opts.dictionary), -4), { i: 2 }, opts && opts.out, opts && opts.dictionary)
}

export { unzlibSync }
