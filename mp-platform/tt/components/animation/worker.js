import { benchmark } from "../../utils/fuck-svga";

export class SvgaWorker {
  constructor() {
    this.worker;
    this.listeners = new Map();
  }

  open() {
    // 创建 worker。 如果 worker 分包没下载完就调 createWorker 的话将报错
    this.worker = tt.createWorker("workers/index.js");

    // 监听 worker 消息响应。
    this.worker.onMessage((result) => {
      const { method, data } = result || {};
      const handler = this.listeners.get(method);
      const { fn, options } = handler;

      fn(data);
      if (options.once) {
        this.listeners.delete(method);
      }
      benchmark.stop(`${method} 解压时间`);
    });
  }

  once(method, fn) {
    this.listeners.set(method, {
      fn: (data) => fn?.(data),
      options: {
        once: true,
      },
    });
  }

  on(method, fn) {
    this.listeners.set(method, {
      fn: (data) => fn?.(data),
      options: {
        once: false,
      },
    });
  }

  off(method) {
    this.listeners.delete(method);
  }

  emit(method, data) {
    benchmark.start(`${method} 解压时间`);
    this.worker.postMessage({ method, data });
  }

  close() {
    this.listeners.clear();
    this.worker?.terminate();
  }
}
