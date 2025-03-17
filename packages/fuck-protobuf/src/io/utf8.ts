/* eslint-disable no-mixed-operators */
/**
 * A minimal UTF8 implementation for number arrays.
 * @memberof util
 * @namespace
 */
export default {
  /**
   * Reads UTF8 bytes as a string.
   * @param {Uint8Array} buffer Source buffer
   * @param {number} start Source start
   * @param {number} end Source end
   * @returns {string} String read
   */
  read(buffer: Uint8Array, start: number, end: number): string {
    if (end - start < 1) {
      return ''
    }

    const fromCharCode = (i: number) => String.fromCharCode(i)

    let str = ''
    for (let i = start; i < end;) {
      const t = buffer[i++]
      if (t <= 0x7F) {
        str += fromCharCode(t)
      } else if (t >= 0xC0 && t < 0xE0) {
        str += fromCharCode((t & 0x1F) << 6 | buffer[i++] & 0x3F)
      } else if (t >= 0xE0 && t < 0xF0) {
        str += fromCharCode((t & 0xF) << 12 | (buffer[i++] & 0x3F) << 6 | buffer[i++] & 0x3F)
      } else if (t >= 0xF0) {
        const t2 = ((t & 7) << 18 | (buffer[i++] & 0x3F) << 12 | (buffer[i++] & 0x3F) << 6 | buffer[i++] & 0x3F) - 0x10000
        str += fromCharCode(0xD800 + (t2 >> 10))
        str += fromCharCode(0xDC00 + (t2 & 0x3FF))
      }
    }

    return str
  },
}
