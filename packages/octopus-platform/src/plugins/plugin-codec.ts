import { definePlugin } from "../definePlugin";
import { utf8 } from "../extensions/utf8";

/**
 * 用于处理数据解码
 * @returns
 */
export default definePlugin<"codec">({
  name: "codec",
  install() {
    const { env, br } = this.globals;
    const b64Wrap = (b64: string, type: string = "image/png") =>
      `data:${type};base64,${b64}`;
    const codec = {
      toBuffer(data: Uint8Array): ArrayBuffer {
        const { buffer, byteOffset, byteLength } = data;

        if (buffer instanceof ArrayBuffer) {
          return buffer.slice(byteOffset, byteOffset + byteLength);
        }

        const view = new Uint8Array(byteLength);

        view.set(data);

        return view.buffer;
      },
      bytesToString(data: Uint8Array): string {
        const chunkSize = 8192; // 安全的块大小
        let result = "";

        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);

          // 在安全的块上使用 String.fromCharCode
          result += String.fromCharCode.apply(null, Array.from(chunk));
        }

        return result;
      },
    };

    if (env === "h5") {
      const textDecoder = new TextDecoder("utf-8", { fatal: true });

      return {
        ...codec,
        toDataURL: (data: Uint8Array) =>
          b64Wrap(btoa(codec.bytesToString(data))),
        utf8: (data: Uint8Array, start: number, end: number) =>
          textDecoder.decode(data.subarray(start, end)),
      };
    }

    return {
      ...codec,
      toDataURL: (data: Uint8Array) =>
        b64Wrap((br as any).arrayBufferToBase64(codec.toBuffer(data))),
      utf8,
    };
  },
});
