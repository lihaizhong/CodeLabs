import { Preflight } from "./preflight";
export default class Reader {
    private static EMPTY_UINT8ARRAY;
    /**
     * Creates a new reader using the specified buffer.
     * @function
     * @param {Reader|Uint8Array|Buffer} buffer Buffer to read from
     * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
     * @throws {Error} If `buffer` is not a valid buffer
     */
    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    readonly buf: Uint8Array;
    /**
     * Read buffer length.
     * @type {number}
     */
    readonly len: number;
    /**
     * Read buffer position.
     * @type {number}
     */
    pos: number;
    preflight: Preflight;
    /**
     * Constructs a new reader instance using the specified buffer.
     * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
     * @constructor
     * @param {Uint8Array} buffer Buffer to read from
     */
    constructor(buffer: Uint8Array);
    private indexOutOfRange;
    /**
     * 将复杂逻辑分离到单独方法
     * @returns
     */
    private readVarint32Slow;
    end(length?: number): number;
    /**
     * Reads a varint as an unsigned 32 bit value.
     * @function
     * @returns {number} Value read
     */
    uint32(): number;
    /**
     * Reads a varint as a signed 32 bit value.
     * @returns {number} Value read
     */
    int32(): number;
    /**
     * Reads a float (32 bit) as a number.
     * @function
     * @returns {number} Value read
     */
    float(): number;
    private getBytesRange;
    /**
     * Reads a sequence of bytes preceeded by its length as a varint.
     * @returns {Uint8Array} Value read
     */
    bytes(): Uint8Array<ArrayBufferLike>;
    /**
     * Reads a string preceeded by its byte length as a varint.
     * @returns {string} Value read
     */
    string(): string;
    /**
     * Skips the specified number of bytes if specified, otherwise skips a varint.
     * @param {number} [length] Length if known, otherwise a varint is assumed
     * @returns {Reader} `this`
     */
    skip(length?: number): this;
    /**
     * Skips the next element of the specified wire type.
     * @param {number} wireType Wire type received
     * @returns {Reader} `this`
     */
    skipType(wireType: number): this;
}
