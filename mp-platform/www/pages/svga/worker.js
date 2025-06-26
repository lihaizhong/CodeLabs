import { benchmark } from "octopus-svga";

export class SvgaWorker {
  constructor() {
    this.worker;
    this.listeners = new Map();
  }

  open() {
    // 创建 worker
    this.worker = new Worker(
      new URL("../../workers/index.js", import.meta.url),
      { type: "module" }
    );
    // 监听 worker 消息响应。
    this.worker.onmessage = (event) => {
      const { method, data } = event.data || {};
      const handler = this.listeners.get(method);
      const { fn, options } = handler;

      fn(data);
      if (options.once) {
        this.listeners.delete(method);
      }
      benchmark.stop(`${method} 下载并解压时间`);
    };
    // 当 Worker 对象接收到一条无法被反序列化的数据时，触发该事件
    this.worker.onmessageerror = (error) => {
      console.error(error);
    };
    this.worker.onerror = (error) => {
      console.error(error);
    };
  }

  once(method, fn) {
    this.listeners.set(method, {
      fn: (data) => {
        benchmark.start(method);
        fn?.(data);
      },
      options: {
        once: true,
      },
    });
  }

  on(method, fn) {
    this.listeners.set(method, {
      fn: (data) => {
        fn?.(data);
      },
      options: {
        once: false,
      },
    });
  }

  off(method) {
    this.listeners.delete(method);
  }

  emit(method, data, transfer) {
    benchmark.start(`${method} 下载并解压时间`);
    this.worker.postMessage({ method, data }, transfer);
  }

  close() {
    this.listeners.clear();
    this.worker?.terminate();
  }
}
