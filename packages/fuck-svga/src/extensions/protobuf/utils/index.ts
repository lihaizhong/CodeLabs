// import { LongBits } from "../../archive/dts";

// export function noop() {}

// export function writeByte(val: number, buf: Uint8Array, pos: number) {
//   buf[pos] = val & 255;
// }

// export function writeBytes(val: number[], buf: Uint8Array, pos: number) {
//   // also works for plain array values
//   buf.set(val, pos);
// }

// export function writeVarint32(val: number, buf: Uint8Array, pos: number) {
//   while (val > 127) {
//     buf[pos++] = (val & 127) | 128;
//     val >>>= 7;
//   }
//   buf[pos] = val;
// }

// export function writeVarint64(val: LongBits, buf: Uint8Array, pos: number) {
//   while (val.hi) {
//     buf[pos++] = (val.lo & 127) | 128;
//     val.lo = ((val.lo >>> 7) | (val.hi << 25)) >>> 0;
//     val.hi >>>= 7;
//   }

//   while (val.lo > 127) {
//     buf[pos++] = (val.lo & 127) | 128;
//     val.lo = val.lo >>> 7;
//   }

//   buf[pos++] = val.lo;
// }

// export function writeFixed32(val: number, buf: Uint8Array, pos: number) {
//   buf[pos] = val & 255;
//   buf[pos + 1] = (val >>> 8) & 255;
//   buf[pos + 2] = (val >>> 16) & 255;
//   buf[pos + 3] = val >>> 24;
// }

/**
 * Tests if the specified value is an string.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an string
 */
export function isString(val: unknown) {
  return typeof val == "string" || val instanceof String;
}

/**
 * Tests if the specified value is an object.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an object
 */
export function isObject(val: unknown) {
  return val && typeof val == "object";
}

/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
export function isInteger(value: unknown) {
  return (
    typeof value == "number" && isFinite(value) && Math.floor(value) == value
  );
}

/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
export const emptyObject = Object.freeze({});
