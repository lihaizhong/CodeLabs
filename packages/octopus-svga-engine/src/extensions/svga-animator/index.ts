import { platform } from "../../platform";

/**
 * 动画控制器
 */
export class Animator {
  /**
   * 动画是否执行
   */
  private isRunning = false;
  /**
   * 动画开始时间
   */
  private startTime = 0;
  /**
   * 动画持续时间
   */
  private duration: number = 0;
  /**
   * 循环播放开始帧与动画开始帧之间的时间偏差
   */
  private loopStart: number = 0;
  /**
   * 动画暂停时的时间偏差
   */
  private pauseTime: number = 0;
  /**
   * 循环持续时间
   */
  private loopDuration: number = 0;

  public onAnimate: (callback: () => void) => number = platform.noop<number>;

  /* ---- 事件钩子 ---- */
  public onStart: () => void = platform.noop;
  public onUpdate: (timePercent: number) => void = platform.noop;
  public onEnd: () => void = platform.noop;

  /**
   * 设置动画的必要参数
   * @param duration
   * @param loopStart
   * @param loop
   * @param fillValue
   */
  public setConfig(
    duration: number,
    loopStart: number,
    loop: number,
    fillValue: number
  ) {
    this.duration = duration;
    this.loopStart = loopStart;
    this.loopDuration = duration * loop + fillValue - loopStart;
  }

  public start(): void {
    this.isRunning = true;
    this.startTime = platform.now();
    this.pauseTime = 0;
    this.onStart();
    this.doFrame();
  }

  public resume(): boolean {
    if (this.startTime === 0) {
      return false;
    }

    this.isRunning = true;
    this.doFrame();
    return true;
  }

  public pause(): boolean {
    if (this.startTime === 0) {
      return false;
    }

    this.isRunning = false;
    // 设置暂停的位置
    this.pauseTime =
      (platform.now() - this.startTime) % this.duration;
    return true;
  }

  public stop(): void {
    this.isRunning = false;
    this.startTime = 0;
  }

  private doFrame(): void {
    if (this.isRunning) {
      this.doDeltaTime(platform.now() - this.startTime);
      if (this.isRunning) {
        this.onAnimate(() => this.doFrame());
      }
    }
  }

  private doDeltaTime(deltaTime: number): void {
    const { duration, loopStart, pauseTime, loopDuration } = this;
    // 本轮动画已消耗的时间比例（Percentage of speed time）
    let percent: number;
    let ended = false;

    // 运行时间 大于等于 循环持续时间
    if (deltaTime >= loopDuration) {
      // 动画已结束
      percent = 1.0;
      ended = true;
      this.stop();
    } else {
      // 本轮动画已消耗的时间比例 = 本轮动画已消耗的时间 / 动画持续时间
      percent = ((deltaTime + loopStart + pauseTime) % duration) / duration;
    }

    this.onUpdate(percent);
    if (!this.isRunning && ended) {
      this.onEnd();
    }
  }
}
