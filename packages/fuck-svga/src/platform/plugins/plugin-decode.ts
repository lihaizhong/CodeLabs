import { definePlugin } from "../definePlugin";

// miniprogram btoa/atob polyfill
const b64c =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const b64re =
  /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

/**
 * btoa implementation
 * 将一个二进制字符串（例如，将字符串中的每一个字节都视为一个二进制数据字节）编码为 Base64 编码的 ASCII 字符串
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/btoa
 * @param data 二进制字符串
 * @returns
 */
export function mbtoa(data: string): string {
  let bitmap,
    a,
    b,
    c,
    result = "",
    rest = data.length % 3;

  for (let i = 0; i < data.length; ) {
    if (
      (a = data.charCodeAt(i++)) > 255 ||
      (b = data.charCodeAt(i++)) > 255 ||
      (c = data.charCodeAt(i++)) > 255
    ) {
      throw new TypeError(
        'Failed to execute "btoa" on "Window": The string to be encoded contains characters outside of the Latin1 range.'
      );
    }

    bitmap = (a << 16) | (b << 8) | c;
    result +=
      b64c.charAt((bitmap >> 18) & 63) +
      b64c.charAt((bitmap >> 12) & 63) +
      b64c.charAt((bitmap >> 6) & 63) +
      b64c.charAt(bitmap & 63);
  }

  return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
}

/**
 * atob implementation
 * 对经过 Base64 编码的字符串进行解码
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/atob
 * @param data base64字符串
 * @returns
 */
export function matob(data: string): string {
  let string = String(data).replace(/[\t\n\f\r ]+/g, "");
  if (!b64re.test(string)) {
    throw new TypeError(
      'Failed to execute "atob" on "Window": The string to be decoded is not correctly encoded.'
    );
  }
  string += "==".slice(2 - (string.length & 3));
  let bitmap,
    result = "",
    r1,
    r2;
  for (let i = 0; i < string.length; ) {
    bitmap =
      (b64c.indexOf(string.charAt(i++)) << 18) |
      (b64c.indexOf(string.charAt(i++)) << 12) |
      ((r1 = b64c.indexOf(string.charAt(i++))) << 6) |
      (r2 = b64c.indexOf(string.charAt(i++)));

    result +=
      r1 === 64
        ? String.fromCharCode((bitmap >> 16) & 255)
        : r2 === 64
        ? String.fromCharCode((bitmap >> 16) & 255, (bitmap >> 8) & 255)
        : String.fromCharCode(
            (bitmap >> 16) & 255,
            (bitmap >> 8) & 255,
            bitmap & 255
          );
  }

  return result;
}

/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
function utf8(buffer: Uint8Array, start: number, end: number): string {
  if (end > buffer.length) throw new RangeError("End exceeds buffer length");

  if (end - start < 1) return "";

  const codes: number[] = []; // 预分配内存空间
  let chunk = ""; // ASCII 字符块缓存
  const fromCharCode = String.fromCharCode;
  for (let i = start; i < end; ) {
    const t = buffer[i++];

    if (t <= 0x7f) {
      // ASCII 快速路径
      chunk += fromCharCode(t);
      // 每 1024 个字符或遇到变长编码时提交块
      if (chunk.length >= 1024 || (i < end && buffer[i] > 0x7f)) {
        codes.push(...chunk.split("").map((c) => c.charCodeAt(0)));
        chunk = "";
      }
    } else {
      if (chunk.length > 0) {
        codes.push(...chunk.split("").map((c) => c.charCodeAt(0)));
        chunk = "";
      }

      // 变长编码处理
      let codePoint: number;
      if (t >= 0xc0 && t < 0xe0) {
        // 2-byte
        codePoint = ((t & 0x1f) << 6) | (buffer[i++] & 0x3f);
      } else if (t >= 0xe0 && t < 0xf0) {
        // 3-byte
        codePoint =
          ((t & 0xf) << 12) |
          ((buffer[i++] & 0x3f) << 6) |
          (buffer[i++] & 0x3f);
      } else {
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
export default definePlugin<"decode">({
  name: "decode",
  install() {
    const { env, br } = this.global;
    const wrapper = (b64: string) => `data:image/png;base64,${b64}`;
    const decode = {
      toBuffer(data: Uint8Array): ArrayBuffer {
        const { buffer, byteOffset, byteLength } = data;

        return buffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer;
      },
    } as IPlatform["decode"];

    if (env === "h5") {
      const textDecoder = new TextDecoder();

      decode.toBitmap = (data: Uint8Array) =>
        globalThis.createImageBitmap(new Blob([decode.toBuffer(data)]));
      decode.toDataURL = (data: Uint8Array) =>
        wrapper(globalThis.btoa(String.fromCharCode(...data)));
      decode.utf8 = (data: Uint8Array, start: number, end: number) =>
        textDecoder.decode(data.subarray(start, end));
    } else {
      decode.toDataURL = (data: Uint8Array) =>
        wrapper((br as any).arrayBufferToBase64(decode.toBuffer(data)));
      decode.utf8 = utf8;
    }

    return decode;
  },
});
