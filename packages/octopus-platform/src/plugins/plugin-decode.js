import { definePlugin } from "../definePlugin";
import { utf8 } from "../extensions/utf8";
/**
 * 用于处理数据解码
 * @returns
 */
export default definePlugin({
    name: "decode",
    install() {
        const { env, br } = this.globals;
        const b64Wrap = (b64, type = "image/png") => `data:${type};base64,${b64}`;
        const decode = {
            toBuffer(data) {
                const { buffer, byteOffset, byteLength } = data;
                if (buffer instanceof ArrayBuffer) {
                    return buffer.slice(byteOffset, byteOffset + byteLength);
                }
                const buff = new ArrayBuffer(byteLength);
                const view = new Uint8Array(buff);
                view.set(data);
                return buff;
            },
            bytesToString(data) {
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
            decode.toDataURL = (data) => b64Wrap(btoa(decode.bytesToString(data)));
            decode.utf8 = (data, start, end) => textDecoder.decode(data.subarray(start, end));
        }
        else {
            decode.toDataURL = (data) => b64Wrap(br.arrayBufferToBase64(decode.toBuffer(data)));
            decode.utf8 = utf8;
        }
        return decode;
    },
});
