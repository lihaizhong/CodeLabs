import { platform } from "./platform";
const badge = [
    "%cBENCHMARK",
    "padding: 2px 4px; background: #68B984; color: #FFFFFF; border-radius: 4px;",
];
class Stopwatch {
    isRealMachine = ["ios", "android", "openharmony"].includes(platform.system);
    timeLabels = new Map();
    markLabels = new Map();
    start(label) {
        if (this.isRealMachine) {
            this.timeLabels.set(label, platform.now());
        }
        else {
            console.time(label);
        }
    }
    stop(label) {
        if (this.isRealMachine) {
            const nowTime = platform.now();
            if (this.timeLabels.has(label)) {
                console.log(`${label}: ${nowTime - this.timeLabels.get(label)} ms`);
                this.timeLabels.delete(label);
            }
        }
        else {
            console.timeEnd(label);
        }
    }
    mark(label) {
        const nowTime = platform.now();
        if (this.markLabels.has(label)) {
            console.log(`${label}: ${nowTime - this.markLabels.get(label)} ms`);
        }
        this.markLabels.set(label, nowTime);
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
    console.log(...badge, ...message);
};
export default benchmark;
