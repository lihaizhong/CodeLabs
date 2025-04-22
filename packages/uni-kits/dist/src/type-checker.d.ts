export declare const hasOwn: (target: Record<string, any>, property: string | symbol) => boolean;
/**
 * 判断是否是某种具体类型
 * * strong
 * @param value
 * @param type
 */
export declare function checkOfStrict(value: unknown, type: any): boolean;
/**
 * 时间格式校验
 * * loose
 * @param value
 */
export declare function isDate(value: unknown): boolean;
/**
 * 是否是Null
 * * strong
 * @param value
 */
export declare function isNull(value: unknown): boolean;
/**
 * 是否是Undefined
 * * strong
 * @param value
 */
export declare function isUndefined(value: unknown): boolean;
/**
 * 判断是否是undefined、null
 * * strong
 * @param value
 */
export declare function isVoid(value: unknown): boolean;
/**
 * 基本类型校验(包含null、undefined、string、number、boolean、symbol)
 * * strong
 * @param value
 */
export declare function isPrimitive(value: unknown): boolean;
/**
 * 是否是字符串
 * * strong
 * @param value
 */
export declare function isString(value: unknown): boolean;
/**
 * 是否是有效数字
 * * strong
 * @param value
 */
export declare function isNumber(value: unknown): boolean;
/**
 * 是否是布尔类型
 * * strong
 * @param value
 */
export declare function isBoolean(value: unknown): boolean;
/**
 * 是否是函数
 * * strong
 * @param value
 */
export declare function isFunction(value: unknown): boolean;
/**
 * 是否是数组
 * * strong
 * @param value
 */
export declare function isArray(value: unknown): boolean;
/**
 * 是否是对象
 * * strong
 * @param value
 */
export declare function isObject(value: unknown): boolean;
/**
 * 是否是普通对象
 * @param value
 * @returns
 */
export declare function isPlainObject(value: unknown): boolean;
/**
 * 是否是正则表达式
 * * strong
 * @param value
 */
export declare function isRegExp(value: unknown): boolean;
/**
 * 是否是Error对象
 * * loose
 * @param value
 */
export declare function isError(value: unknown): boolean;
/**
 * 是否是原生的Promise对象
 * * loose
 * @param value
 */
export declare function isPromise(value: unknown): boolean;
/**
 * 是否为真值
 * * loose
 * @param value
 */
export declare function isTruthy(value: unknown): boolean;
/**
 * 是否为假值
 * * loose
 * @param value
 */
export declare function isFalsy(value: unknown): boolean;
export declare function isBigInt(value: unknown): boolean;
