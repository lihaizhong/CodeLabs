export declare class Poll {
    private running;
    private callback;
    private frameId;
    private interval;
    private lastTime;
    /**
     * 创建一个基于 requestAnimationFrame 的轮询实例
     * @param callback 每次轮询时执行的回调函数
     * @param interval 轮询间隔时间（毫秒），默认为 0ms
     */
    constructor(callback: Function, interval: number);
    /**
     * 开始轮询
     */
    start(): void;
    /**
     * 停止轮询
     */
    stop(): void;
    /**
     * 更改轮询间隔
     * @param newInterval 新的轮询间隔（毫秒）
     */
    setInterval(newInterval: number): void;
    /**
     * 内部轮询函数
     */
    private tick;
}
