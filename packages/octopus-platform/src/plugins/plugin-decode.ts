import { definePlugin, OctopusPlatformPlugins } from "../definePlugin";
import { utf8 } from "../extensions/utf8";

// 扩展OctopusPlatformPlugins接口
declare module "../definePlugin" {
  interface OctopusPlatformPlugins {
    decode: {
      toDataURL: (data: Uint8Array) => string;
      toBuffer: (data: Uint8Array) => ArrayBuffer;
      bytesToString: (data: Uint8Array) => string;
      utf8: (data: Uint8Array, start: number, end: number) => string;
    };
  }
}

/**
 * 用于处理数据解码
 * @returns
 */
export default definePlugin<"decode">({  
  name: "decode",
  install() {
    const { env, br } = this.globals;
    const b64Wrap = (b64: string, type: string = "image/png") =>
      `data:${type};base64,${b64}`;
    const decode = {
      toBuffer(data: Uint8Array): ArrayBuffer {
        const { buffer, byteOffset, byteLength } = data;

        if (buffer instanceof ArrayBuffer) {
          return buffer.slice(byteOffset, byteOffset + byteLength);
        }

        const buff = new ArrayBuffer(byteLength);
        const view = new Uint8Array(buff);

        view.set(data);

        return buff;
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
    } as OctopusPlatformPlugins["decode"];

    if (env === "h5") {
      const textDecoder = new TextDecoder("utf-8", { fatal: true });

      decode.toDataURL = (data: Uint8Array) =>
        b64Wrap(btoa(decode.bytesToString(data)));
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
