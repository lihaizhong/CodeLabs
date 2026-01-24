import { createPlatform, pluginNow } from 'octopus-platform';

const platform = createPlatform([pluginNow], "2.0.0");

const BADGE_PREFIX = "%cBENCHMARK";
const BASE_STYLE = "padding: 2px 4px; color: #FFFFFF; border-radius: 4px;";
const logBadge = [BADGE_PREFIX, `${BASE_STYLE} background: #68B984;`];
const infoBadge = [BADGE_PREFIX, `${BASE_STYLE} background: #89CFF0;`];
/**
 * 创建性能测试实例
 * @returns Benchmark 实例
 */
function createBenchmark() {
    const timeLabels = new Map();
    const markLabels = new Map();
    return {
        /**
         * 获取当前时间戳
         */
        now: () => platform.now(),
        /**
         * 开始计时
         */
        start(label) {
            timeLabels.set(label, platform.now());
        },
        /**
         * 停止计时并输出结果
         */
        stop(label) {
            const nowTime = platform.now();
            if (timeLabels.has(label)) {
                const startTime = timeLabels.get(label);
                console.log(`${label}: ${nowTime - startTime} ms`);
                timeLabels.delete(label);
            }
        },
        /**
         * 标记时间点并输出间隔
         */
        mark(label) {
            const nowTime = platform.now();
            if (markLabels.has(label)) {
                const prevTime = markLabels.get(label);
                console.log(`${label}: ${nowTime - prevTime} ms`);
            }
            markLabels.set(label, nowTime);
        },
        /**
         * 重置标记
         */
        reset(label) {
            markLabels.delete(label);
        },
        /**
         * 清除所有标签
         */
        clear() {
            timeLabels.clear();
            markLabels.clear();
        },
        /**
         * 测量异步操作的执行时间
         */
        async time(label, callback) {
            this.start(label);
            try {
                return await callback();
            }
            finally {
                this.stop(label);
            }
        },
        /**
         * 输出分隔线
         */
        line(size = 40) {
            console.log("-".repeat(size));
        },
        /**
         * 输出带徽标的日志
         */
        log(...message) {
            console.log(...logBadge, ...message);
        },
        /**
         * 输出带徽标的信息
         */
        info(...message) {
            console.info(...infoBadge, ...message);
        },
    };
}
/**
 * 默认性能测试实例
 */
const benchmark = createBenchmark();

export { benchmark, createBenchmark };
//# sourceMappingURL=index.js.map
