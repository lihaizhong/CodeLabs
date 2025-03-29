export type IAsyncReadyOption = {
	only: boolean;
};

export default class AsyncReady {
	static ReadyStatus = {
		initialize: "INITIALIZE",
		pending: "PENDING",
		completed: "COMPLETED",
	};

	static callReadyFunc(callback: () => void) {
		if (typeof callback === "function") {
			return callback();
		}

		return null;
	}

	private status: string = AsyncReady.ReadyStatus.initialize;

	private callbacks: Set<() => void> = new Set();

	private options: IAsyncReadyOption;

	constructor(option: IAsyncReadyOption) {
		this.options = Object.assign({ only: false }, option);
	}

	ready(callback: any): void {
		if (this.status === AsyncReady.ReadyStatus.completed) {
			AsyncReady.callReadyFunc(callback);
		} else {
			if (this.options.only) {
				this.callbacks.clear();
				this.callbacks.add(callback);
			} else {
				this.callbacks.add(callback);
			}
		}
	}

	wait(): void {
		this.status = AsyncReady.ReadyStatus.pending;
	}

	reset(): void {
		this.status = AsyncReady.ReadyStatus.initialize;
		this.callbacks.clear();
	}

	complete(): void {
		this.status = AsyncReady.ReadyStatus.completed;
		for (const callback of this.callbacks) {
			AsyncReady.callReadyFunc(callback);
		}
		this.callbacks.clear();
	}
}
