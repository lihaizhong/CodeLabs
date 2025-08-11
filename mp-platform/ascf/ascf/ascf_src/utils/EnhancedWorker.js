import { benchmark } from "./fuck-benchmark";

export class EnhancedWorker {
  constructor() {
    this.worker;
    this.listeners = new Map();
  }

  /**
   * @private
   * 创建 Worker
   */
  createWorker() {
    this.worker = has.createWorker("workers/index.js", { useExperimentalWorker: true });
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

    // 实验模式可能会出现 worker 被杀的情况，需要重新创建 worker
    this.worker.onProcessKilled(() => {
      benchmark.log("worker killed");

      this.createWorker();
    });
  }

  /**
   * 下载并启动 Worker
   * @returns 
   */
  async open() {
    return new Promise((resolve, reject) => {
      const task = has.preDownloadSubpackage({
        packageType: "workers",
        success: (res) => {
          benchmark.log("load worker success", res);
          // 创建 worker。 如果 worker 分包没下载完就调 createWorker 的话将报错
          this.createWorker();
          resolve();
        },
        fail: (res) => {
          benchmark.log("load worker fail", res);
          reject(res);
        },
      });

      task.onProgressUpdate((res) => {
        // 可通过 onProgressUpdate 接口监听下载进度
        benchmark.log(
          "【workers download progress】",
          res.progress,
          res.totalBytesWritten,
          res.totalBytesExpectedToWrite
        );
      });
    });
  }

  /**
   * 一次绑定事件
   * @param {*} method 
   * @param {*} fn 
   */
  once(method, fn) {
    this.listeners.set(method, {
      fn: (data) => fn?.(data),
      options: {
        once: true,
      },
    });
  }

  /**
   * 永久绑定事件
   * @param {*} method 
   * @param {*} fn 
   */
  on(method, fn) {
    this.listeners.set(method, {
      fn: (data) => fn?.(data),
      options: {
        once: false,
      },
    });
  }

  /**
   * 移除绑定事件
   * @param {*} method 
   */
  off(method) {
    this.listeners.delete(method);
  }

  /**
   * 触发事件
   * @param {*} method 
   * @param {*} data 
   */
  emit(method, data) {
    benchmark.start(`${method} 解压时间`);
    this.worker.postMessage({ method, data });
  }

  /**
   * 关闭 Worker
   */
  close() {
    this.listeners.clear();
    this.worker?.terminate();
  }
}
