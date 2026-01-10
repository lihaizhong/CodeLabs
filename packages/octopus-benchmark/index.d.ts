type MessageHandler = (...message: unknown[]) => void;
type AsyncHandler<T> = (label: string, callback: () => Promise<T> | T) => Promise<T>;
type LabelHandler = (label: string) => void;
/**
 * 性能测试工具
 * 提供精确的时间测量、性能监控和格式化输出功能
 */
interface Benchmark {
    /**
     * 获取当前时间戳（毫秒）
     * @returns 当前时间戳
     */
    now: () => number;
    /**
     * 开始计时
     * @param label - 计时标签
     */
    start: LabelHandler;
    /**
     * 停止计时并输出结果
     * @param label - 计时标签
     */
    stop: LabelHandler;
    /**
     * 标记时间点并输出间隔
     * @param label - 标记标签
     */
    mark: LabelHandler;
    /**
     * 重置标记
     * @param label - 标记标签
     */
    reset: LabelHandler;
    /**
     * 清除所有标签
     */
    clear: () => void;
    /**
     * 测量异步操作的执行时间
     * @param label - 测试标签
     * @param callback - 要测试的异步函数
     * @returns callback 的返回值
     * @example
     * ```typescript
     * const result = await benchmark.time('fetch-data', async () => {
     *   return await fetchData();
     * });
     * ```
     */
    time: AsyncHandler<any>;
    /**
     * 输出分隔线
     * @param size - 分隔线长度，默认 40
     */
    line: (size?: number) => void;
    /**
     * 输出带徽标的日志
     * @param message - 日志内容
     */
    log: MessageHandler;
    /**
     * 输出带徽标的信息
     * @param message - 信息内容
     */
    info: MessageHandler;
}
/**
 * 创建性能测试实例
 * @returns Benchmark 实例
 */
declare function createBenchmark(): Benchmark;
/**
 * 默认性能测试实例
 */
declare const benchmark: Benchmark;

export { benchmark, createBenchmark };
export type { Benchmark };
