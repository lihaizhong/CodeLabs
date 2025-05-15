export class UTF8 {
  /**
   * 读取UTF8字节作为字符串
   * @param {Uint8Array} buffer 缓存数据
   * @param {number} start 缓存数据开始位置
   * @param {number} end 缓存数据结束为止
   * @returns {string}
   */
  public read(buffer: Uint8Array, start: number, end: number): string {
    if (end - start < 1) {
      return "";
    }

    const fromCharCode = (i: number) => String.fromCharCode(i);
    let str = "";

    for (let i = start; i < end; ) {
      const t = buffer[i++];
      if (t <= 0x7f) {
        str += fromCharCode(t);
      } else if (t >= 0xc0 && t < 0xe0) {
        str += fromCharCode(((t & 0x1f) << 6) | (buffer[i++] & 0x3f));
      } else if (t >= 0xe0 && t < 0xf0) {
        str += fromCharCode(
          ((t & 0xf) << 12) | ((buffer[i++] & 0x3f) << 6) | (buffer[i++] & 0x3f)
        );
      } else if (t >= 0xf0) {
        const t2 =
          (((t & 7) << 18) |
            ((buffer[i++] & 0x3f) << 12) |
            ((buffer[i++] & 0x3f) << 6) |
            (buffer[i++] & 0x3f)) -
          0x10000;
        str += fromCharCode(0xd800 + (t2 >> 10));
        str += fromCharCode(0xdc00 + (t2 & 0x3ff));
      }
    }

    return str;
  }

  /**
   * 将字符串写入UTF8字节
   * @param {string} string 字符串数据
   * @param {Uint8Array} buffer 目标缓存数据
   * @param {number} offset 目标缓存偏移量
   * @returns {number}
   */
  public write(string: string, buffer: Uint8Array, offset: number): number {
    let start = offset;
    let c1; // character 1
    let c2; // character 2

    for (let i = 0; i < string.length; ++i) {
      c1 = string.charCodeAt(i);
      if (c1 < 128) {
        buffer[offset++] = c1;
      } else if (c1 < 2048) {
        buffer[offset++] = (c1 >> 6) | 192;
        buffer[offset++] = (c1 & 63) | 128;
      } else if (
        (c1 & 0xfc00) === 0xd800 &&
        ((c2 = string.charCodeAt(i + 1)) & 0xfc00) === 0xdc00
      ) {
        c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
        ++i;
        buffer[offset++] = (c1 >> 18) | 240;
        buffer[offset++] = ((c1 >> 12) & 63) | 128;
        buffer[offset++] = ((c1 >> 6) & 63) | 128;
        buffer[offset++] = (c1 & 63) | 128;
      } else {
        buffer[offset++] = (c1 >> 12) | 224;
        buffer[offset++] = ((c1 >> 6) & 63) | 128;
        buffer[offset++] = (c1 & 63) | 128;
      }
    }

    return offset - start;
  }

  /**
   * 计算字符串的UTF8字节长度
   * @param {string} string 字符串数据
   * @returns {number}
   */
  public length(string: string): number {
    let len = 0;
    let c = 0;

    for (let i = 0; i < string.length; ++i) {
      c = string.charCodeAt(i);

      if (c < 128) {
        len += 1;
      } else if (c < 2048) {
        len += 2;
      } else if (
        (c & 0xfc00) === 0xd800 &&
        (string.charCodeAt(i + 1) & 0xfc00) === 0xdc00
      ) {
        ++i;
        len += 4;
      } else {
        len += 3;
      }
    }

    return len;
  }
}
