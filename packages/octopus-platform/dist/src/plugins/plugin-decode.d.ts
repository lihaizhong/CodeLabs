import { PlatformPlugin } from "fuck-platform";
/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
export declare function utf8(buffer: Uint8Array, start: number, end: number): string;
/**
 * 用于处理数据解码
 * @returns
 */
declare const _default: PlatformPlugin<"decode", PlatformPlugin.decode>;
export default _default;
