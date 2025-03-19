import benchmark from "benchmark";
import { noop, now } from "../polyfill";
import type { Brush } from "./brush";

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
   * 循环持续时间
   */
  private loopDuration: number = 0;

  /* ---- 事件钩子 ---- */
  public onStart: () => void = noop;
  public onUpdate: (timePercent: number) => void = noop;
  public onEnd: () => void = noop;

  constructor(private readonly brush: Brush) {}

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
    this.startTime = now();
    this.onStart();
    this.doFrame();
  }

  public resume(): void {
    this.isRunning = true
    this.startTime = now()
    this.doFrame()
  }

  public pause(): void {
    this.isRunning = false
    // 设置暂停的位置
    this.loopStart = (now() - this.startTime + this.loopStart) % this.duration
  }

  public stop(): void {
    this.isRunning = false;
  }

  private doFrame(): void {
    if (this.isRunning) {
      this.doDeltaTime(now() - this.startTime);
      if (this.isRunning) {
        this.brush.flush(() => this.doFrame());
      }
    }
  }

  private doDeltaTime(DT: number): void {
    const {
      duration: D,
      loopStart: LS,
      loopDuration: LD,
    } = this;
    // 本轮动画已消耗的时间比例（Percentage of speed time）
    let TP: number;
    let ended = false;

    // 运行时间 大于等于 循环持续时间
    if (DT >= LD) {
      // 动画已结束
      TP = 1.0;
      ended = true;
      this.stop();
    } else {
      // 本轮动画已消耗的时间比例 = 本轮动画已消耗的时间 / 动画持续时间
      TP = ((DT + LS) % D) / D;
    }

    benchmark.time('update partial', () => this.onUpdate(TP));
    if (!this.isRunning && ended) {
      this.onEnd();
    }
  }
}
