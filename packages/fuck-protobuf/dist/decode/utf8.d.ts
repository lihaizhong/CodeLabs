/**
 * A minimal UTF8 implementation for number arrays.
 * @memberof util
 * @namespace
 */
declare const _default: {
    /**
     * Reads UTF8 bytes as a string.
     * @param {Uint8Array} buffer Source buffer
     * @param {number} start Source start
     * @param {number} end Source end
     * @returns {string} String read
     */
    read(buffer: Uint8Array, start: number, end: number): string;
};
export default _default;
