import { LongBits } from "../dts";
export declare function noop(): void;
export declare function writeByte(val: number, buf: Uint8Array, pos: number): void;
export declare function writeBytes(val: number[], buf: Uint8Array, pos: number): void;
export declare function writeVarint32(val: number, buf: Uint8Array, pos: number): void;
export declare function writeVarint64(val: LongBits, buf: Uint8Array, pos: number): void;
export declare function writeFixed32(val: number, buf: Uint8Array, pos: number): void;
/**
 * Tests if the specified value is an string.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an string
 */
export declare function isString(val: any): val is string | String;
/**
 * Tests if the specified value is an object.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an object
 */
export declare function isObject(val: any): any;
/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
export declare function isInteger(value: any): boolean;
/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
export declare const emptyObject: Readonly<{}>;
