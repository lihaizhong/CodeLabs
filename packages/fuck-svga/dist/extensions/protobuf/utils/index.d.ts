/**
 * Tests if the specified value is an string.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an string
 */
export declare function isString(val: unknown): val is string | String;
/**
 * Tests if the specified value is an object.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an object
 */
export declare function isObject(val: unknown): unknown;
/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
export declare function isInteger(value: unknown): boolean;
/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
export declare const emptyObject: Readonly<{}>;
