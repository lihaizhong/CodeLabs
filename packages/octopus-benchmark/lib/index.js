(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.benchmark = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
        return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    const noop = (() => { });

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

    function installPlugin(platform, plugin) {
        const value = plugin.install.call(platform);
        Object.defineProperty(platform, plugin.name, {
            get: () => value,
            enumerable: true,
            configurable: true,
        });
    }

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

    var EnhancedPlatform = /** @class */ (function (_super) {
        __extends(EnhancedPlatform, _super);
        function EnhancedPlatform() {
            var _this = _super.call(this, [pluginNow], "0.1.1") || this;
            _this.init();
            return _this;
        }
        EnhancedPlatform.prototype.installPlugin = function (plugin) {
            installPlugin(this, plugin);
        };
        return EnhancedPlatform;
    }(OctopusPlatform));
    var platform = new EnhancedPlatform();

    var logBadge = [
        "%cBENCHMARK",
        "padding: 2px 4px; background: #68B984; color: #FFFFFF; border-radius: 4px;",
    ];
    var infoBadge = [
        "%cBENCHMARK",
        "padding: 2px 4px; background: #89CFF0; color: #FFFFFF; border-radius: 4px;",
    ];
    var Stopwatch = /** @class */ (function () {
        function Stopwatch() {
            this.timeLabels = new Map();
            this.markLabels = new Map();
        }
        Stopwatch.prototype.start = function (label) {
            this.timeLabels.set(label, platform.now());
        };
        Stopwatch.prototype.stop = function (label) {
            var nowTime = platform.now();
            var timeLabels = this.timeLabels;
            if (timeLabels.has(label)) {
                console.log("".concat(label, ": ").concat(nowTime - timeLabels.get(label), " ms"));
                timeLabels.delete(label);
            }
        };
        Stopwatch.prototype.mark = function (label) {
            var nowTime = platform.now();
            var markLabels = this.markLabels;
            if (markLabels.has(label)) {
                console.log("".concat(label, ": ").concat(nowTime - markLabels.get(label), " ms"));
            }
            markLabels.set(label, nowTime);
        };
        Stopwatch.prototype.reset = function (label) {
            this.markLabels.delete(label);
        };
        Stopwatch.prototype.clear = function () {
            this.timeLabels.clear();
            this.markLabels.clear();
        };
        return Stopwatch;
    }());
    var stopwatch = new Stopwatch();
    var benchmark = Object.create(stopwatch);
    benchmark.now = function () { return platform.now(); };
    benchmark.time = function (label, callback) { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stopwatch.start(label);
                    return [4 /*yield*/, callback()];
                case 1:
                    result = _a.sent();
                    stopwatch.stop(label);
                    return [2 /*return*/, result];
            }
        });
    }); };
    benchmark.line = function (size) {
        if (size === void 0) { size = 40; }
        console.log("-".repeat(size));
    };
    benchmark.log = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        console.log.apply(console, __spreadArray(__spreadArray([], logBadge, false), message, false));
    };
    benchmark.info = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        console.info.apply(console, __spreadArray(__spreadArray([], infoBadge, false), message, false));
    };

    exports.benchmark = benchmark;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
