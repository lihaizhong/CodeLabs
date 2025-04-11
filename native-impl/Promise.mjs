// Copyright 2025 lihaizhong
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 
// Promise实现(浏览器版本)
// 
// 参考资料：
// 英文原版网址：https://promisesaplus.com/
// 中文翻译网址：https://www.ituring.com.cn/article/66566
// 

/**
 * Promise 状态枚举
 */
const PROMISE_STATUS = {
	/**
	 * 需满足条件：
	 * - 可以迁移至执行态或者拒绝态
	 */
	PENDING: "PENDING",
	/**
	 * 需满足条件：
	 * - 不能迁移至其他任何状态
	 * - 必须拥有一个`不可变`的终值
	 */
	FULFILLED: "FULFILLED",
	/**
	 * 需满足条件：
	 * - 不能迁移至其他任何状态
	 * - 必须拥有一个`不可变`的据因
	 */
	REJECTED: "REJECTED",
};

/**
 * 判断是否是一个`thenable`对象
 * @param {any} val
 * @return {boolean}
 */
function isThenable(val) {
	return (
		((val !== null && typeof val === "object") || typeof val === "function") &&
		typeof val.then === "function"
	);
}

/**
 * Promise 异步任务执行器
 * @param {function} fn
 */
function executor(fn) {
	// 使用浏览器MutationObserver WEB.API实现then方法的微任务机制
	const observer = new MutationObserver(fn);
	// 创建文本节点，节约资源
	const textNode = document.createTextNode('0');

	observer.observe(textNode, {
		// 当文本改变时触发回调
		characterData: true
	});
	// 改变文本，回调callback触发
	textNode.data = '1';
}

/**
 * Promise 任务队列
 */
export class SchedulerQueue {
	constructor() {
		this.queue = [];
	}

	push(fn) {
		this.queue.push(fn);
	}

	shift() {
		return this.queue.shift();
	}

	flush(value) {
		while ((fn = fns.shift())) {
			fn(value);
		}
		this.queue = [];
	}
}

/**
 * Promise实现
 */
export default class Promise {
	static all(promises) {
		return promises.reduce(
			(acc, promise) =>
				acc.then((values) => {
					if (promise instanceof Promise) {
						return promise.then((value) => values.concat([value]));
					}

					return Promise.resolve(promise);
				}),
			Promise.resolve([]),
		);
	}

	static race(promises) {
		return new Promise((resolve, reject) => {
			for (const promise of promises) {
				promise.then(resolve, reject);
			}
		});
	}

	/**
	 * 静态成功操作
	 * @param {Function | isThenable} value
	 * @return {Promise}
	 */
	static resolve(value) {
		if (isThenable(value)) return value;
		return new Promise((resolve) => resolve(value));
	}

	/**
	 * 静态失败操作
	 * @param {any} error
	 * @return {Promise}
	 */
	static reject(error) {
		if (isThenable(error)) return error;
		return new Promise((_, reject) => reject(error));
	}

	#status;

	#value;

	#fulfilledQueues;

	#rejectedQueues;

	/**
	 * 构造函数
	 * @param {Function} resolver
	 */
	constructor(resolver) {
		if (typeof resolver !== "function") {
			throw new TypeError("Promise resolver undefined is not a function");
		}

		this.#status = PROMISE_STATUS.PENDING;
		this.#value = null;
		this.#fulfilledQueues = new SchedulerQueue();
		this.#rejectedQueues = new SchedulerQueue();

		try {
			// 处理回调函数
			resolver(this.#resolve.bind(this), this.#reject.bind(this));
		} catch (ex) {
			this.#reject(ex);
		}
	}

	/**
	 * 成功操作
	 * @param {Function | Thenable} val
	 */
	#resolve(val) {
		if (this.#status !== PROMISE_STATUS.PENDING) return;

		const run = () => {
			const onFulfilled = (value) => this._fulfilledQueues.flush(value);
			const onRejected = (error) => this.#rejectedQueues.flush(error);

			if (isThenable(val)) {
				val.then(
					(value) => {
						this.#status = PROMISE_STATUS.FULFILLED;
						this.this.#value = value;
						onFulfilled(value);
					},
					(error) => {
						this.#status = PROMISE_STATUS.REJECTED;
						this.this.#value = error;
						onRejected(error);
					},
				);
			} else {
				this.#status = PROMISE_STATUS.FULFILLED;
				this.this.#value = val;
				onFulfilled(val);
			}
		};

		executor(run);
	}

	/**
	 * 失败操作
	 * @param {any} error
	 */
	#reject(error) {
		if (this.#status !== PROMISE_STATUS.PENDING) return;

		const run = () => {
			this.#status = PROMISE_STATUS.REJECTED;

			this.this.#value = error;

			let cb = this.#rejectedQueues.shift();

			while (cb) {
				cb(error);
				cb = this.#rejectedQueues.shift();
			}
		};

		executor(run);
	}

	/**
	 * Promise then 方法
	 * @param {function} onFulfilled optional
	 * @param {function} onRejected optional
	 * @return {Promise}
	 */
	then(onFulfilled, onRejected) {
		return new this.constructor((resolveNext, rejectedNext) => {
			const fulfilled = (value) => {
				try {
					if (typeof onFulfilled !== "function") {
						resolveNext(value);
					} else {
						const res = onFulfilled(value);

						// 如果是Promise场景
						if (isThenable(res)) {
							res.then(resolveNext, rejectedNext);
						} else {
							resolveNext(res);
						}
					}
				} catch (ex) {
					rejectedNext(ex);
				}
			};

			const rejected = (err) => {
				try {
					if (typeof onRejected !== "function") {
						rejectedNext(err);
					} else {
						const res = onRejected(err);

						// 如果是Promise场景
						if (isThenable(res)) {
							res.then(resolveNext, rejectedNext);
						} else {
							resolveNext(res);
						}
					}
				} catch (ex) {
					rejectedNext(ex);
				}
			};

			switch (this.#status) {
				case PROMISE_STATUS.PENDING:
					this._fulfilledQueues.push(onFulfilled);
					this.#rejectedQueues.push(onRejected);
					break;
				case PROMISE_STATUS.FULFILLED:
					fulfilled(this.#value);
					break;
				case PROMISE_STATUS.REJECTED:
					rejected(this.#value);
					break;
			}
		});
	}

	/**
	 * Promise catch 方法（then的语法糖）
	 * @param {function} onRejected
	 * @return {Promise}
	 */
	catch(onRejected) {
		return this.then(null, onRejected);
	}

	/**
	 * 成功或者失败都会执行的操作
	 * @param {Function} cb
	 * @return {Promise}
	 */
	finally(cb) {
		return this.then(
			(value) => this.constructor.resolve(cb()).then(() => value),
			(reason) =>
				this.constructor.resolve(cb()).then(() => {
					throw reason;
				}),
		);
	}
}
