export const hasOwn = (target: Record<string, any>, property: string | symbol) => {
	if ("hasOwn" in Object) {
		return Object.hasOwn(target, property);
	}

	return (Object as ObjectConstructor).prototype.hasOwnProperty.call(
		target,
		property,
	);
};

/**
 * 判断是否是某种具体类型
 * * strong
 * @param value
 * @param type
 */
export function checkOfStrict(value: unknown, type: any): boolean {
	if (value === null || value === undefined) {
		return value === type;
	}

	return value.constructor.toString() === type.toString();
}

/**
 * 时间格式校验
 * * loose
 * @param value
 */
export function isDate(value: unknown): boolean {
	return (
		(value instanceof Date ||
			isString(value) ||
			(isNumber(value) && (value as number) > 0)) &&
			isNaN(Date.parse((value as number | string | Date).toString())) === false
	);
}

/**
 * 是否是Null
 * * strong
 * @param value
 */
export function isNull(value: unknown): boolean {
	return value === null;
}

/**
 * 是否是Undefined
 * * strong
 * @param value
 */
export function isUndefined(value: unknown): boolean {
	return typeof value === "undefined";
}

/**
 * 判断是否是undefined、null
 * * strong
 * @param value
 */
export function isVoid(value: unknown): boolean {
	return isUndefined(value) || isNull(value);
}

/**
 * 基本类型校验(包含null、undefined、string、number、boolean、symbol)
 * * strong
 * @param value
 */
export function isPrimitive(value: unknown): boolean {
	return (
		value === null ||
		["undefined", "string", "number", "boolean", "symbol", "bigint"].includes(
			typeof value,
		)
	);
}

/**
 * 是否是字符串
 * * strong
 * @param value
 */
export function isString(value: unknown): boolean {
	return typeof value === "string";
}

/**
 * 是否是有效数字
 * * strong
 * @param value
 */
export function isNumber(value: unknown): boolean {
	return typeof value === "number" && Number.isFinite(value);
}

/**
 * 是否是布尔类型
 * * strong
 * @param value
 */
export function isBoolean(value: unknown): boolean {
	return typeof value === "boolean";
}

/**
 * 是否是函数
 * * strong
 * @param value
 */
export function isFunction(value: unknown): boolean {
	return typeof value === "function";
}

/**
 * 是否是数组
 * * strong
 * @param value
 */
export function isArray(value: unknown): boolean {
	return Array.isArray(value);
}

/**
 * 是否是对象
 * * strong
 * @param value
 */
export function isObject(value: unknown): boolean {
	return typeof value === "object" && value !== null;
}

/**
 * 是否是普通对象
 * @param value
 * @returns
 */
export function isPlainObject(value: unknown): boolean {
	return checkOfStrict(value, Object);
}

/**
 * 是否是正则表达式
 * * strong
 * @param value
 */
export function isRegExp(value: unknown): boolean {
	return checkOfStrict(value, RegExp);
}

/**
 * 是否是Error对象
 * * loose
 * @param value
 */
export function isError(value: unknown): boolean {
	return value instanceof Error;
}

/**
 * 是否是原生的Promise对象
 * * loose
 * @param value
 */
export function isPromise(value: unknown): boolean {
	return value instanceof Promise;
}

/**
 * 是否为真值
 * * loose
 * @param value
 */
export function isTruthy(value: unknown): boolean {
	return value === true || value === 1;
}

/**
 * 是否为假值
 * * loose
 * @param value
 */
export function isFalsy(value: unknown): boolean {
	return value === false || value === 0;
}

export function isBigInt(value: unknown): boolean {
  return typeof value === "bigint";
}
