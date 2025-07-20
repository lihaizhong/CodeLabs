import { OctopusPlatform, pluginNow, installPlugin } from 'octopus-platform';

class EnhancedPlatform extends OctopusPlatform {
    now;
    constructor() {
        super([pluginNow], "0.1.1");
        this.init();
    }
    installPlugin(plugin) {
        installPlugin(this, plugin);
    }
}
const platform = new EnhancedPlatform();

const logBadge = [
    "%cBENCHMARK",
    "padding: 2px 4px; background: #68B984; color: #FFFFFF; border-radius: 4px;",
];
const infoBadge = [
    "%cBENCHMARK",
    "padding: 2px 4px; background: #89CFF0; color: #FFFFFF; border-radius: 4px;",
];
class Stopwatch {
    timeLabels = new Map();
    markLabels = new Map();
    start(label) {
        this.timeLabels.set(label, platform.now());
    }
    stop(label) {
        const nowTime = platform.now();
        const { timeLabels } = this;
        if (timeLabels.has(label)) {
            console.log(`${label}: ${nowTime - timeLabels.get(label)} ms`);
            timeLabels.delete(label);
        }
    }
    mark(label) {
        const nowTime = platform.now();
        const { markLabels } = this;
        if (markLabels.has(label)) {
            console.log(`${label}: ${nowTime - markLabels.get(label)} ms`);
        }
        markLabels.set(label, nowTime);
    }
    reset(label) {
        this.markLabels.delete(label);
    }
    clear() {
        this.timeLabels.clear();
        this.markLabels.clear();
    }
}
const stopwatch = new Stopwatch();
const benchmark = Object.create(stopwatch);
benchmark.now = () => platform.now();
benchmark.time = async (label, callback) => {
    stopwatch.start(label);
    const result = await callback();
    stopwatch.stop(label);
    return result;
};
benchmark.line = (size = 40) => {
    console.log("-".repeat(size));
};
benchmark.log = (...message) => {
    console.log(...logBadge, ...message);
};
benchmark.info = (...message) => {
    console.info(...infoBadge, ...message);
};

export { benchmark };
