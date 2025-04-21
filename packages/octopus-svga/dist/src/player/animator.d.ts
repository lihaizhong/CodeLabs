import type { Painter } from "../painter";
/**
 * 动画控制器
 */
export declare class Animator {
    private readonly painter;
    /**
     * 动画是否执行
     */
    private isRunning;
    /**
     * 动画开始时间
     */
    private startTime;
    /**
     * 动画持续时间
     */
    private duration;
    /**
     * 循环播放开始帧与动画开始帧之间的时间偏差
     */
    private loopStart;
    /**
     * 循环持续时间
     */
    private loopDuration;
    onStart: () => void;
    onUpdate: (timePercent: number) => void;
    onEnd: () => void;
    constructor(painter: Painter);
    /**
     * 设置动画的必要参数
     * @param duration
     * @param loopStart
     * @param loop
     * @param fillValue
     */
    setConfig(duration: number, loopStart: number, loop: number, fillValue: number): void;
    start(): void;
    resume(): void;
    pause(): void;
    stop(): void;
    private doFrame;
    private doDeltaTime;
}
