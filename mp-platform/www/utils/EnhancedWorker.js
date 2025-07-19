import { benchmark } from "octopus-benchmark";

export class EnhancedWorker {
  /**
   * SharedArrayBuffer max byte length
   */
  static MAX_BYTE_LENGTH = 1024 * 1024 * 50; // 50MB

  /**
   * 检查worker是否支持transferable
   * @param {Worker} worker
   */
  static checkTransferable(worker) {
    // Create a small ArrayBuffer
    const ab = new ArrayBuffer(1);

    // Post the ArrayBuffer to the worker, attempting to transfer it
    worker.postMessage(ab, [ab]);

    // Check if the ArrayBuffer was successfully transferred (its byteLength will become 0)
    if (ab.byteLength === 0) {
      console.log("Transferable objects are supported.");
      return true;
    }

    console.log("Transferable objects are NOT supported.");
    return false;
  }

  constructor() {
    this.worker;
    this.transferable = false;
    this.listeners = new Map();
  }

  open() {
    // 创建 worker
    this.worker = new Worker(new URL("../workers/index.js", import.meta.url), {
      type: "module",
    });
    // 监听 worker 消息响应。
    this.worker.onmessage = (event) => {
      const { method, data } = event.data || {};
      const handler = this.listeners.get(method);
      const { fn, options } = handler;

      fn(data);
      benchmark.stop(`${method} 下载并解压时间`);
      if (options.once) {
        this.listeners.delete(method);
      }
    };
    // 当 Worker 对象接收到一条无法被反序列化的数据时，触发该事件
    this.worker.onmessageerror = (error) => {
      console.error(error);
    };
    this.worker.onerror = (error) => {
      console.error(error);
    };

    this.transferable = EnhancedWorker.checkTransferable(this.worker);
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
    // if (this.transferable) {
    //   this.worker.postMessage({ method, data }, transfer);
    // } else
    if ("SharedArrayBuffer" in globalThis && transfer?.length > 0) {
      const buff = new SharedArrayBuffer(0, {
        maxByteLength: EnhancedWorker.MAX_BYTE_LENGTH,
      });

      this.worker.postMessage({ method, data, ref: buff });
    } else {
      this.worker.postMessage({ method, data });
    }
  }

  close() {
    this.listeners.clear();
    this.worker?.terminate();
  }
}
