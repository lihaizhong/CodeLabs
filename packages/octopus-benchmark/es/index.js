const noop = () => { };

function delay(callback, interval) {
    return new Promise((resolve) => setTimeout(() => resolve(callback()), interval));
}
async function retry(fn, intervals = [], 
/*
 * @private 不建议外部传入
 */
times = 0) {
    try {
        return fn();
    }
    catch (err) {
        if (times >= intervals.length) {
            throw err;
        }
        return delay(() => retry(fn, intervals, ++times), intervals[times]);
    }
}

class OctopusPlatform {
    /**
     * 插件列表
     */
    plugins = [];
    /**
     * 平台版本
     */
    platformVersion = "0.0.1";
    /**
     * 应用版本
     */
    version = "";
    /**
     * 全局变量
     */
    globals = {
        env: "unknown",
        br: null,
        dpr: 1,
        system: "unknown",
    };
    noop = noop;
    retry = retry;
    constructor(plugins, version) {
        this.version = version || "";
        this.plugins = plugins;
        this.globals.env = this.autoEnv();
    }
    init() {
        const { globals, plugins } = this;
        const collection = new Map();
        const names = [];
        const installedPlugins = new Set();
        globals.br = this.useBridge();
        globals.dpr = this.usePixelRatio();
        globals.system = this.useSystem();
        for (const plugin of plugins) {
            names.push(plugin.name);
            collection.set(plugin.name, plugin);
        }
        this.usePlugins(collection, names, installedPlugins);
        installedPlugins.clear();
    }
    autoEnv() {
        // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
        if (typeof window !== "undefined") {
            return "h5";
        }
        if (typeof tt !== "undefined") {
            return "tt";
        }
        if (typeof my !== "undefined") {
            return "alipay";
        }
        if (typeof wx !== "undefined") {
            return "weapp";
        }
        throw new Error("Unsupported app");
    }
    useBridge() {
        switch (this.globals.env) {
            case "h5":
                return globalThis;
            case "alipay":
                return my;
            case "tt":
                return tt;
            case "weapp":
                return wx;
        }
        return {};
    }
    usePixelRatio() {
        const { env, br } = this.globals;
        if (env === "h5") {
            return devicePixelRatio;
        }
        if ("getWindowInfo" in br) {
            return br.getWindowInfo().pixelRatio;
        }
        if ("getSystemInfoSync" in br) {
            return br.getSystemInfoSync().pixelRatio;
        }
        return 1;
    }
    useSystem() {
        const { env } = this.globals;
        let system;
        switch (env) {
            case "weapp":
                system = wx.getDeviceInfo().platform;
                break;
            case "alipay":
                system = my.getDeviceBaseInfo().platform;
                break;
            case "tt":
                system = tt.getDeviceInfoSync().platform;
                break;
            default:
                system = "unknown";
        }
        return system.toLowerCase();
    }
    usePlugins(plugins, pluginNames, installedPlugins) {
        for (const pluginName of pluginNames) {
            if (!plugins.has(pluginName)) {
                throw new Error(`Plugin ${pluginName} not found`);
            }
            if (installedPlugins.has(pluginName)) {
                return;
            }
            const plugin = plugins.get(pluginName);
            // 递归调用依赖
            if (Array.isArray(plugin.dependencies)) {
                for (const dependency of plugin.dependencies) {
                    if (typeof plugins.get(dependency)?.install !== "function") {
                        throw new Error(`Plugin ${pluginName} depends on plugin ${dependency}, but ${dependency} is not found`);
                    }
                }
                // 递归加载依赖
                this.usePlugins(plugins, plugin.dependencies, installedPlugins);
            }
            this.installPlugin(plugin);
            installedPlugins.add(pluginName);
        }
    }
    switch(env) {
        this.globals.env = env;
        this.init();
    }
}

/**
 * 定义平台插件
 */
const definePlugin = (plugin) => plugin;

var pluginNow = definePlugin({
    name: "now",
    install() {
        const { env, br } = this.globals;
        // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
        const perf = env === "h5" || env === "tt" ? performance : br.getPerformance();
        if (typeof perf?.now === "function") {
            // 支付宝小程序的performance.now()获取的是当前时间戳，单位是微秒。
            if (perf.now() - Date.now() > 1) {
                return () => perf.now() / 1000;
            }
            // H5环境下，performance.now()获取的不是当前时间戳，而是从页面加载开始的时间戳，单位是毫秒。
            return () => perf.now();
        }
        return () => Date.now();
    },
});

class EnhancedPlatform extends OctopusPlatform {
    now;
    constructor() {
        super([pluginNow], "0.0.1");
        this.init();
    }
    installPlugin(plugin) {
        const value = plugin.install.call(this);
        Object.defineProperty(this, plugin.name, {
            get: () => value,
            enumerable: true,
            configurable: true,
        });
    }
}
const platform = new EnhancedPlatform();

const badge = [
    "%cBENCHMARK",
    "padding: 2px 4px; background: #68B984; color: #FFFFFF; border-radius: 4px;",
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
    console.log(...badge, ...message);
};

export { benchmark as default };
