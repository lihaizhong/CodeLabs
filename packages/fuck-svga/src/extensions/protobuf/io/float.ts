const readUint = (buf: Uint8Array, pos: number) =>
  (buf[pos] |
    (buf[pos + 1] << 8) |
    (buf[pos + 2] << 16) |
    (buf[pos + 3] << 24)) >>>
  0;

export default {
  readFloatLE(buf: Uint8Array, pos: number): number {
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
