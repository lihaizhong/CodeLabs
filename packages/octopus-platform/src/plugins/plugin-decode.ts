import { PlatformPlugin } from "octopus-platform";
import { definePlugin } from "../definePlugin";
import { utf8 } from "../extensions/utf8";

/**
 * 用于处理数据解码
 * @returns
 */
export default definePlugin<"decode", PlatformPlugin.decode>({
  name: "decode",
  install() {
    const { env, br } = this.global;
    const b64Wrap = (b64: string) => `data:image/png;base64,${b64}`;
    const decode = {
      toBuffer(data: Uint8Array): ArrayBuffer {
        const { buffer, byteOffset, byteLength } = data;

        return buffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer;
      },
    } as PlatformPlugin.decode;

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
