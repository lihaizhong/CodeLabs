export class Poll {
  private running: boolean = false;

  private callback: Function;

  private frameId: number | null = null;

  private interval: number;

  private lastTime: number = 0;

  /**
   * 创建一个基于 requestAnimationFrame 的轮询实例
   * @param callback 每次轮询时执行的回调函数
   * @param interval 轮询间隔时间（毫秒），默认为 0ms
   */
  constructor(callback: Function, interval: number = 100) {
    this.callback = callback;
    this.interval = interval;
  }

  /**
   * 开始轮询
   */
  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    this.tick();
  }

  /**
   * 停止轮询
   */
  stop(): void {
    if (!this.running) return;
    
    this.running = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * 更改轮询间隔
   * @param newInterval 新的轮询间隔（毫秒）
   */
  setInterval(newInterval: number): void {
    this.interval = newInterval;
  }

  /**
   * 内部轮询函数
   */
  private tick(): void {
    if (!this.running) return;

    const now = performance.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= this.interval) {
      this.lastTime = now - (elapsed % this.interval);
      try {
        this.callback();
      } catch (error) {
        console.error('Poll callback error:', error);
      }
    }

    this.frameId = requestAnimationFrame(() => this.tick());
  }
}