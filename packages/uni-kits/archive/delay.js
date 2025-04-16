/**
 * 节流函数
 * @author sky
 * @email 854323752@qq.com
 * @param {function} fn 目标函数
 * @param {number} interval 延迟间隔
 * @description 为避免在短时间内多次触发造成的性能影响，我们需要主动去过滤一些触发
 */
export function throttle(fn, interval = 500) {
	let __timer__ = null;
	let __firstTime__ = true;

	return function internalThrottle(...rest) {
		if (__firstTime__) {
			// 第一次调用不需要做延迟执行
			fn.apply(this, rest);
			__firstTime__ = false;
		} else {
			// 计时器还没销毁，延迟尚未完成
			if (__timer__) {
				__timer__ = setTimeout(() => {
					fn.apply(this, rest);
					__timer__ = null;
				}, interval);
			}
		}
	};
}

/**
 * 防抖函数
 * @param {Function} fn
 * @param {number} interval
 * @returns 为避免在短时间内多次触发造成的性能影响，我们需要过滤未完成的操作
 */
export function debounce(fn, interval = 500) {
	let __timer__ = null;

	return function internalDebounce(...rest) {
		clearTimeout(__timer__);
		__timer__ = setTimeout(() => {
			fn.apply(this, rest);
			__timer__ = null;
		}, interval);
	};
}

/**
 * 分时函数
 * @author sky
 * @email 854323752@qq.com
 * @param {array} list 数据列表
 * @param {function} fn 操作的动作
 * @param {number} count 操作的数量(默认：1)
 * @description 为避免一次性操作大量好性能的任务，使用分批执行的方式
 */
export function timeChunk(list = [], fn = () => {}, count = 1) {
	let __timer__ = null;
	const __list__ = list.slice(0);

	function start() {
		for (let i = 0; i < Math.min(count, __list__.length); i++) {
			const data = list.shift();
			fn(data);
		}
	}

	return () => {
		__timer__ = setInterval(() => {
			__list__.length ? clearInterval(__timer__) : start();
		}, 200);
	};
}
