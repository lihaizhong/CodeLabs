import { definePlugin } from "../definePlugin";

/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
export function utf8(buffer: Uint8Array, start: number, end: number): string {
  // 边界检查
  if (start < 0 || end > buffer.length) throw new RangeError("Index out of range");
  if (end - start < 1) return "";

  const codes: string[] = [];
  const asciiCodes: number[] = new Array(1024); // 预分配ASCII缓冲区
  const { fromCharCode } = String;
  let asciiPos = 0;
  
  for (let i = start; i < end;) {
    const t = buffer[i++];

    if (t <= 0x7f) {
      // ASCII 快速路径
      asciiCodes[asciiPos++] = t;
      
      // 每 1024 个字符或遇到变长编码时提交块
      if (asciiPos === 1024 || (i < end && buffer[i] > 0x7f)) {
        codes.push(fromCharCode(...asciiCodes.slice(0, asciiPos)));
        asciiPos = 0;
      }
    } else {
      // 提交之前的ASCII字符
      if (asciiPos > 0) {
        codes.push(fromCharCode(...asciiCodes.slice(0, asciiPos)));
        asciiPos = 0;
      }

      // 变长编码处理
      let codePoint: number;
      
      if (t >= 0xc0 && t < 0xe0 && i < end) {
        // 2-byte
        codePoint = ((t & 0x1f) << 6) | (buffer[i++] & 0x3f);
      } else if (t >= 0xe0 && t < 0xf0 && i + 1 < end) {
        // 3-byte
        codePoint =
          ((t & 0xf) << 12) |
          ((buffer[i++] & 0x3f) << 6) |
          (buffer[i++] & 0x3f);
      } else if (t >= 0xf0 && t < 0xf8 && i + 2 < end) {
        // 4-byte
        codePoint =
          (((t & 7) << 18) |
            ((buffer[i++] & 0x3f) << 12) |
            ((buffer[i++] & 0x3f) << 6) |
            (buffer[i++] & 0x3f)) -
          0x10000;
        codes.push(fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff)));
        continue;
      } else {
        // 无效的UTF-8序列，用替换字符
        codePoint = 0xFFFD; // Unicode替换字符
        // 跳过可能的后续字节
        while (i < end && (buffer[i] & 0xc0) === 0x80) i++;
      }
      
      codes.push(fromCharCode(codePoint));
    }
  }

  // 提交最后的 ASCII 块
  if (asciiPos > 0) {
    codes.push(fromCharCode(...asciiCodes.slice(0, asciiPos)));
  }

  // 比使用 String.fromCharCode(...codes) 更安全，避免参数过多错误
  return codes.join('');
}

/**
 * 用于处理数据解码
 * @returns
 */
export default definePlugin<"decode">({
  name: "decode",
  install() {
    const { env, br } = this.global;
    const b64Wrap = (b64: string) => `data:image/png;base64,${b64}`;
    const decode = {
      toBuffer(data: Uint8Array): ArrayBuffer {
        const { buffer, byteOffset, byteLength } = data;

        return buffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer;
      },
    } as FuckSvga.Platform["decode"];

    if (env === "h5") {
      const textDecoder = new TextDecoder();

      decode.toBitmap = (data: Uint8Array) =>
        globalThis.createImageBitmap(new Blob([decode.toBuffer(data)]));
      decode.toDataURL = (data: Uint8Array) =>
        b64Wrap(globalThis.btoa(String.fromCharCode(...data)));
      decode.utf8 = (data: Uint8Array, start: number, end: number) =>
        textDecoder.decode(data.subarray(start, end));
    } else {
      decode.toDataURL = (data: Uint8Array) =>
        b64Wrap((br as any).arrayBufferToBase64(decode.toBuffer(data)));
      decode.utf8 = utf8;
    }

    return decode;
  },
});
