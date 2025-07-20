(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.OctopusSvga = {}));
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

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

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

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    const noop$1 = (() => { });

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

    // 使用静态缓冲区，避免重复创建
    const BUFFER_SIZE = 4096; // 更大的缓冲区，减少字符串拼接次数
    const STATIC_BUFFER = new Uint16Array(BUFFER_SIZE); // 预分配ASCII缓冲区
    /**
     * 优化的 UTF-8 解码函数
     * 主要优化点：
     * 1. 使用静态缓冲区减少内存分配
     * 2. 批量处理 ASCII 字符
     * 3. 优化循环结构和条件判断
     * 4. 使用 Uint16Array 代替普通数组提高性能
     */
    function utf8(buffer, start, end) {
        // 边界检查
        if (start < 0 || end > buffer.length)
            throw new RangeError("Index out of range");
        if (end - start < 1)
            return "";
        const resultParts = [];
        let bufferPos = 0;
        const appendBuffer = (parts) => {
            resultParts.push(String.fromCharCode.apply(null, Array.from(parts)));
        };
        // 快速路径：检查是否全是 ASCII
        let allAscii = true;
        for (let i = start; i < end; i++) {
            if (buffer[i] > 0x7F) {
                allAscii = false;
                break;
            }
        }
        // 全 ASCII 优化路径
        if (allAscii) {
            for (let i = start; i < end; i += BUFFER_SIZE) {
                const chunkEnd = Math.min(i + BUFFER_SIZE, end);
                const len = chunkEnd - i;
                // 直接复制到 Uint16Array
                for (let j = 0; j < len; j++) {
                    STATIC_BUFFER[j] = buffer[i + j];
                }
                appendBuffer(STATIC_BUFFER.subarray(0, len));
            }
            return resultParts.join('');
        }
        // 混合内容处理
        for (let i = start; i < end;) {
            const byte = buffer[i++];
            // ASCII 字符处理
            if (byte < 0x80) {
                STATIC_BUFFER[bufferPos++] = byte;
                // 如果缓冲区满了，提交并清空
                if (bufferPos === BUFFER_SIZE) {
                    appendBuffer(STATIC_BUFFER);
                    bufferPos = 0;
                }
                continue;
            }
            // 提交之前的 ASCII 字符
            if (bufferPos > 0) {
                appendBuffer(STATIC_BUFFER.subarray(0, bufferPos));
                bufferPos = 0;
            }
            // 变长编码处理 - 使用查表法代替多个条件判断
            let codePoint;
            // 2 字节序列: 110xxxxx 10xxxxxx
            if ((byte & 0xE0) === 0xC0 && i < end) {
                codePoint = ((byte & 0x1F) << 6) | (buffer[i++] & 0x3F);
            }
            // 3 字节序列: 1110xxxx 10xxxxxx 10xxxxxx
            else if ((byte & 0xF0) === 0xE0 && i + 1 < end) {
                codePoint = ((byte & 0x0F) << 12) |
                    ((buffer[i++] & 0x3F) << 6) |
                    (buffer[i++] & 0x3F);
            }
            // 4 字节序列: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
            else if ((byte & 0xF8) === 0xF0 && i + 2 < end) {
                codePoint = ((byte & 0x07) << 18) |
                    ((buffer[i++] & 0x3F) << 12) |
                    ((buffer[i++] & 0x3F) << 6) |
                    (buffer[i++] & 0x3F);
                // 处理 Unicode 代理对
                if (codePoint > 0xFFFF) {
                    codePoint -= 0x10000;
                    STATIC_BUFFER[bufferPos++] = 0xD800 + (codePoint >> 10);
                    STATIC_BUFFER[bufferPos++] = 0xDC00 + (codePoint & 0x3FF);
                    // 检查缓冲区是否需要提交
                    if (bufferPos >= BUFFER_SIZE - 2) { // 预留空间给下一个可能的代理对
                        appendBuffer(STATIC_BUFFER.subarray(0, bufferPos));
                        bufferPos = 0;
                    }
                    continue;
                }
            }
            // 无效的 UTF-8 序列
            else {
                codePoint = 0xFFFD; // Unicode 替换字符
                // 跳过可能的后续字节
                while (i < end && (buffer[i] & 0xC0) === 0x80)
                    i++;
            }
            STATIC_BUFFER[bufferPos++] = codePoint;
            // 检查缓冲区是否需要提交
            if (bufferPos >= BUFFER_SIZE - 3) { // 预留空间给下一个可能的多字节字符
                appendBuffer(STATIC_BUFFER.subarray(0, bufferPos));
                bufferPos = 0;
            }
        }
        // 提交剩余字符
        if (bufferPos > 0) {
            appendBuffer(STATIC_BUFFER.subarray(0, bufferPos));
        }
        return resultParts.join('');
    }

    class OctopusPlatform {
        /**
         * 插件列表
         */
        plugins = [];
        /**
         * 平台版本
         */
        platformVersion = "0.0.2";
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
        noop = noop$1;
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

    /**
     * 通过选择器匹配获取canvas实例
     * @returns
     */
    var pluginCanvas = definePlugin({
        name: "getCanvas",
        install() {
            const { retry } = this;
            const { env, br, dpr } = this.globals;
            const intervals = [50, 100, 100];
            function initCanvas(canvas, width, height) {
                if (!canvas) {
                    throw new Error("canvas not found.");
                }
                // const MAX_SIZE = 1365;
                const context = canvas.getContext("2d");
                // let virtualWidth = width * dpr;
                // let virtualHeight = height * dpr;
                // // 微信小程序限制canvas最大尺寸为 1365 * 1365
                // if (
                //   env === "weapp" &&
                //   (virtualWidth > MAX_SIZE || virtualHeight > MAX_SIZE)
                // ) {
                //   if (virtualWidth > virtualHeight) {
                //     virtualHeight = (virtualHeight / virtualWidth) * MAX_SIZE;
                //     virtualWidth = MAX_SIZE;
                //   } else {
                //     virtualWidth = (virtualWidth / virtualHeight) * MAX_SIZE;
                //     virtualHeight = MAX_SIZE;
                //   }
                // }
                // canvas!.width = virtualWidth;
                // canvas!.height = virtualHeight;
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                return { canvas, context };
            }
            if (env === "h5") {
                const querySelector = (selector) => document.querySelector(selector);
                return (selector) => retry(() => {
                    // FIXME: Taro 对 canvas 做了特殊处理，canvas 元素的 id 会被加上 canvas-id 的前缀
                    const canvas = (querySelector(`canvas[canvas-id=${selector.slice(1)}]`) || querySelector(selector));
                    return initCanvas(canvas, canvas?.clientWidth, canvas?.clientHeight);
                }, intervals);
            }
            return (selector, component) => retry(() => new Promise((resolve, reject) => {
                let query = br.createSelectorQuery();
                if (component) {
                    query = query.in(component);
                }
                query
                    .select(selector)
                    .fields({ node: true, size: true }, (res) => {
                    const { node, width, height } = res || {};
                    try {
                        resolve(initCanvas(node, width, height));
                    }
                    catch (e) {
                        reject(e);
                    }
                })
                    .exec();
            }), intervals);
        },
    });

    /**
     * 用于处理数据解码
     * @returns
     */
    var pluginDecode = definePlugin({
        name: "decode",
        install() {
            const { env, br } = this.globals;
            const b64Wrap = (b64, type = "image/png") => `data:${type};base64,${b64}`;
            const decode = {
                toBuffer(data) {
                    const { buffer, byteOffset, byteLength } = data;
                    if (buffer instanceof ArrayBuffer) {
                        return buffer.slice(byteOffset, byteOffset + byteLength);
                    }
                    const view = new Uint8Array(byteLength);
                    view.set(data);
                    return view.buffer;
                },
                bytesToString(data) {
                    const chunkSize = 8192; // 安全的块大小
                    let result = "";
                    for (let i = 0; i < data.length; i += chunkSize) {
                        const chunk = data.slice(i, i + chunkSize);
                        // 在安全的块上使用 String.fromCharCode
                        result += String.fromCharCode.apply(null, Array.from(chunk));
                    }
                    return result;
                },
            };
            if (env === "h5") {
                const textDecoder = new TextDecoder("utf-8", { fatal: true });
                return {
                    ...decode,
                    toDataURL: (data) => b64Wrap(btoa(decode.bytesToString(data))),
                    utf8: (data, start, end) => textDecoder.decode(data.subarray(start, end)),
                };
            }
            return {
                ...decode,
                toDataURL: (data) => b64Wrap(br.arrayBufferToBase64(decode.toBuffer(data))),
                utf8,
            };
        },
    });

    /**
     * 用于处理远程文件读取
     * @returns
     */
    var pluginDownload = definePlugin({
        name: "remote",
        install() {
            const { env, br } = this.globals;
            const isRemote = (url) => /^(blob:)?http(s)?:\/\//.test(url);
            if (env === "h5") {
                return {
                    is: isRemote,
                    fetch: (url) => fetch(url).then((response) => {
                        if (response.ok) {
                            return response.arrayBuffer();
                        }
                        throw new Error(`HTTP error, status=${response.status}, statusText=${response.statusText}`);
                    }),
                };
            }
            function download(url, enableCache) {
                return new Promise((resolve, reject) => {
                    br.request({
                        url,
                        // @ts-ignore 支付宝小程序必须有该字段
                        dataType: "arraybuffer",
                        responseType: "arraybuffer",
                        enableCache,
                        success: (res) => resolve(res.data),
                        fail: reject,
                    });
                }).catch((err) => {
                    const errorMessage = err.errMsg || err.errorMessage || err.message;
                    // FIXME: 可能存在写入网络缓存空间失败的情况，此时重新下载
                    if (errorMessage.includes("ERR_CACHE_WRITE_FAILURE") ||
                        errorMessage.includes("ERR_CACHE_WRITE_FAILED")) {
                        return download(url, false);
                    }
                    throw err;
                });
            }
            return {
                is: isRemote,
                fetch: (url) => download(url, true),
            };
        },
    });

    /**
     * 用于处理本地文件存储
     * @returns
     */
    var pluginFsm = definePlugin({
        name: "local",
        install() {
            const { env, br } = this.globals;
            if (env === "h5" || env === "tt") {
                return null;
            }
            const fsm = br.getFileSystemManager();
            return {
                exists: (filepath) => new Promise((resolve) => {
                    fsm.access({
                        path: filepath,
                        success: () => resolve(true),
                        fail: () => resolve(false),
                    });
                }),
                write: (data, filePath) => new Promise((resolve, reject) => {
                    fsm.writeFile({
                        filePath,
                        data,
                        success: () => resolve(filePath),
                        fail: reject,
                    });
                }),
                read: (filePath) => new Promise((resolve, reject) => {
                    fsm.readFile({
                        filePath,
                        success: (res) => resolve(res.data),
                        fail: reject,
                    });
                }),
                remove: (filePath) => new Promise((resolve, reject) => {
                    fsm.unlink({
                        filePath,
                        success: () => resolve(filePath),
                        fail: reject,
                    });
                }),
            };
        },
    });

    /**
     * 图片加载插件
     * @package plugin-fsm 本地文件存储能力
     * @package plugin-path 路径处理能力
     * @package plugin-decode 解码能力
     */
    var pluginImage = definePlugin({
        name: "image",
        dependencies: ["local", "decode"],
        install() {
            const { local, decode } = this;
            const { env } = this.globals;
            let genImageSource = (data, _filepath) => (typeof data === "string" ? data : decode.toDataURL(data));
            /**
             * 加载图片
             * @param img
             * @param url
             * @returns
             */
            function loadImage(img, url) {
                return new Promise((resolve, reject) => {
                    img.onload = () => resolve(img);
                    img.onerror = () => reject(new Error(`SVGA LOADING FAILURE: ${url}`));
                    img.src = url;
                });
            }
            function releaseImage(img) {
                img.onload = null;
                img.onerror = null;
                img.src = "";
            }
            if (env === "h5") {
                return {
                    create: (_) => new Image(),
                    load: (createImage, data, filepath) => {
                        // 由于ImageBitmap在图片渲染上有优势，故优先使用
                        if (data instanceof Uint8Array && "createImageBitmap" in globalThis) {
                            return createImageBitmap(new Blob([decode.toBuffer(data)]));
                        }
                        if (data instanceof ImageBitmap) {
                            return Promise.resolve(data);
                        }
                        return loadImage(createImage(), genImageSource(data, filepath));
                    },
                    release: releaseImage,
                };
            }
            // FIXME: 支付宝小程序IDE保存临时文件会失败;抖音最大用户文件大小为10M
            if (env === "weapp") {
                genImageSource = async (data, filepath) => {
                    if (typeof data === "string") {
                        return data;
                    }
                    // FIXME: IOS设备 微信小程序 Uint8Array转base64 时间较长，使用图片缓存形式速度会更快
                    return local
                        .write(decode.toBuffer(data), filepath)
                        .catch((ex) => {
                        console.warn(`image write fail: ${ex.errorMessage || ex.errMsg || ex.message}`);
                        return decode.toDataURL(data);
                    });
                };
            }
            return {
                create: (canvas) => canvas.createImage(),
                load: async (createImage, data, filepath) => loadImage(createImage(), await genImageSource(data, filepath)),
                release: releaseImage,
            };
        },
    });

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

    /**
     * 用于创建离屏canvas
     * @returns
     */
    var pluginOfsCanvas = definePlugin({
        name: "getOfsCanvas",
        install() {
            const { env } = this.globals;
            let createOffscreenCanvas;
            if (env === "h5") {
                createOffscreenCanvas = (options) => new OffscreenCanvas(options.width, options.height);
            }
            else if (env === "alipay") {
                createOffscreenCanvas = (options) => my.createOffscreenCanvas(options);
            }
            else if (env === "tt") {
                createOffscreenCanvas = (options) => {
                    const canvas = tt.createOffscreenCanvas();
                    canvas.width = options.width;
                    canvas.height = options.height;
                    return canvas;
                };
            }
            else {
                createOffscreenCanvas = (options) => wx.createOffscreenCanvas(options);
            }
            return (options) => {
                const type = options.type || "2d";
                const canvas = createOffscreenCanvas({ ...options, type });
                const context = canvas.getContext(type);
                return {
                    canvas,
                    context,
                };
            };
        },
    });

    /**
     * 用于处理文件路径
     * @returns
     */
    var pluginPath = definePlugin({
        name: "path",
        install() {
            const { env, br } = this.globals;
            const filename = (path) => {
                const filepath = path.split(/\?#/g)[0];
                return filepath.substring(filepath.lastIndexOf("/") + 1);
            };
            if (env === "h5" || env === "tt") {
                return {
                    USER_DATA_PATH: "",
                    is: (_) => false,
                    filename,
                    resolve: (filename, prefix) => "",
                };
            }
            const { USER_DATA_PATH } = br.env;
            return {
                USER_DATA_PATH,
                is: (filepath) => filepath?.startsWith(USER_DATA_PATH),
                filename,
                resolve: (filename, prefix) => `${USER_DATA_PATH}/${prefix ? `${prefix}__` : ""}${filename}`,
            };
        },
    });

    /**
     * 用于处理requestAnimationFrame
     * @returns
     */
    var pluginRaf = definePlugin({
        name: "rAF",
        install() {
            const { env } = this.globals;
            function requestAnimationFrameImpl() {
                return (callback) => setTimeout(callback, Math.max(0, 16 - (Date.now() % 16)));
            }
            if (env === "h5") {
                const rAF = "requestAnimationFrame" in globalThis
                    ? requestAnimationFrame
                    : requestAnimationFrameImpl();
                return (_, callback) => rAF(callback);
            }
            return (canvas, callback) => {
                // 检查canvas是否存在
                try {
                    return canvas.requestAnimationFrame(callback);
                }
                catch (error) {
                    console.warn(error.message);
                    return requestAnimationFrameImpl()(callback);
                }
            };
        },
    });

    var EnhancedPlatform = /** @class */ (function (_super) {
        __extends(EnhancedPlatform, _super);
        function EnhancedPlatform() {
            var _this = _super.call(this, [
                pluginCanvas,
                pluginOfsCanvas,
                pluginDecode,
                pluginDownload,
                pluginFsm,
                pluginImage,
                pluginNow,
                pluginPath,
                pluginRaf,
            ], "0.3.1") || this;
            _this.init();
            return _this;
        }
        EnhancedPlatform.prototype.installPlugin = function (plugin) {
            installPlugin(this, plugin);
        };
        return EnhancedPlatform;
    }(OctopusPlatform));
    var platform = new EnhancedPlatform();

    function readFloatLEImpl() {
        // 使用静态DataView池
        var DATA_VIEW_POOL_SIZE = 4;
        var dataViewPool = Array(DATA_VIEW_POOL_SIZE)
            .fill(0)
            .map(function () { return new DataView(new ArrayBuffer(8)); }); // 使用8字节支持double
        var currentViewIndex = 0;
        return function readFloatLE(buf, pos) {
            if (pos < 0 || pos + 4 > buf.length)
                throw new RangeError("Index out of range");
            // 轮换使用DataView池中的实例
            var view = dataViewPool[currentViewIndex];
            currentViewIndex = (currentViewIndex + 1) % DATA_VIEW_POOL_SIZE;
            // 直接设置字节，避免创建subarray
            var u8 = new Uint8Array(view.buffer);
            u8[0] = buf[pos];
            u8[1] = buf[pos + 1];
            u8[2] = buf[pos + 2];
            u8[3] = buf[pos + 3];
            return view.getFloat32(0, true);
        };
    }
    var readFloatLE = readFloatLEImpl();

    /**
     * 简易的hash算法
     * @param buff
     * @param start
     * @param end
     * @param step
     * @returns
     */
    function calculateHash(buff, start, end, step) {
        // 使用简单的哈希算法
        var hash = 0;
        for (var i = start; i < end; i += step) {
            // 简单的哈希算法，类似于字符串哈希
            hash = (hash << 5) - hash + buff[i];
            hash = hash & hash; // 转换为32位整数
        }
        // 添加数据长度作为哈希的一部分，增加唯一性
        hash = (hash << 5) - hash + end - start;
        hash = hash & hash;
        // 转换为字符串
        return hash.toString(36);
    }

    var Preflight = /** @class */ (function () {
        function Preflight() {
            this.caches = new Map();
            this.count = 0;
        }
        Object.defineProperty(Preflight.prototype, "size", {
            get: function () {
                return this.caches.size;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Preflight.prototype, "hitCount", {
            get: function () {
                return this.count;
            },
            enumerable: false,
            configurable: true
        });
        // get cache() {
        //   return Object.fromEntries(this.caches);
        // }
        /**
         * 计算二进制数据的哈希值
         * @param reader Reader对象
         * @param end 结束位置
         * @returns 哈希值
         */
        Preflight.prototype.calculate = function (reader, end) {
            // 保存原始位置
            var startPos = reader.pos, buf = reader.buf;
            var endPos = Math.min(end, reader.len);
            // 采样数据以加快计算速度，同时保持足够的唯一性
            // 对于大数据，每隔几个字节采样一次
            var step = Math.max(1, Math.floor((endPos - startPos) / 100));
            return calculateHash(buf, startPos, endPos, step);
        };
        /**
         * 检查是否存在缓存数据
         * @param key 键
         * @returns 是否存在
         */
        Preflight.prototype.has = function (key) {
            var hit = this.caches.has(key);
            if (hit) {
                this.count++;
            }
            return hit;
            // return this.caches.has(key);
        };
        /**
         * 获取缓存数据
         * @param key 键
         * @returns 缓存数据
         */
        Preflight.prototype.get = function (key) {
            return this.caches.get(key);
        };
        /**
         * 设置缓存数据
         * @param key 键
         * @param value 缓存数据
         */
        Preflight.prototype.set = function (key, value) {
            this.caches.set(key, value);
        };
        /**
         * 清空所有缓存数据
         */
        Preflight.prototype.clear = function () {
            this.count = 0;
            this.caches.clear();
        };
        return Preflight;
    }());

    var Reader = /** @class */ (function () {
        /**
         * Constructs a new reader instance using the specified buffer.
         * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
         * @constructor
         * @param {Uint8Array} buffer Buffer to read from
         */
        function Reader(buffer) {
            this.preflight = new Preflight();
            this.buf = buffer;
            this.pos = 0;
            this.len = buffer.length;
        }
        Reader.prototype.indexOutOfRange = function (reader, writeLength) {
            return new RangeError("index out of range: " +
                reader.pos +
                " + " +
                (writeLength || 1) +
                " > " +
                reader.len);
        };
        /**
         * 将复杂逻辑分离到单独方法
         * @returns
         */
        Reader.prototype.readVarint32Slow = function () {
            var byte = this.buf[this.pos++];
            var value = byte & 0x7f;
            var shift = 7;
            // 使用do-while循环减少条件判断
            do {
                if (this.pos >= this.len) {
                    throw this.indexOutOfRange(this);
                }
                byte = this.buf[this.pos++];
                value |= (byte & 0x7f) << shift;
                shift += 7;
            } while (byte >= 128 && shift < 32);
            return value >>> 0; // 确保无符号
        };
        /**
         * Reads a sequence of bytes preceded by its length as a varint.
         * @param length
         * @returns
         */
        Reader.prototype.end = function (length) {
            return length === undefined ? this.len : this.pos + length;
        };
        /**
         * Reads a varint as an unsigned 32 bit value.
         * @function
         * @returns {number} Value read
         */
        Reader.prototype.uint32 = function () {
            // 快速路径：大多数情况下是单字节
            var byte = this.buf[this.pos];
            if (byte < 128) {
                this.pos++;
                return byte;
            }
            // 慢速路径：多字节处理
            return this.readVarint32Slow();
        };
        /**
         * Reads a varint as a signed 32 bit value.
         * @returns {number} Value read
         */
        Reader.prototype.int32 = function () {
            return this.uint32() | 0;
        };
        /**
         * Reads a float (32 bit) as a number.
         * @function
         * @returns {number} Value read
         */
        Reader.prototype.float = function () {
            var pos = this.pos + 4;
            if (pos > this.len) {
                throw this.indexOutOfRange(this, 4);
            }
            var value = readFloatLE(this.buf, this.pos);
            this.pos = pos;
            return value;
        };
        /**
         * read bytes range
         * @returns
         */
        Reader.prototype.getBytesRange = function () {
            var length = this.uint32();
            var start = this.pos;
            var end = start + length;
            if (end > this.len) {
                throw this.indexOutOfRange(this, length);
            }
            return [start, end, length];
        };
        /**
         * Reads a sequence of bytes preceded by its length as a varint.
         * @returns {Uint8Array} Value read
         */
        Reader.prototype.bytes = function () {
            var _a = this.getBytesRange(), start = _a[0], end = _a[1], length = _a[2];
            this.pos += length;
            if (length === 0) {
                return Reader.EMPTY_UINT8ARRAY;
            }
            return this.buf.subarray(start, end);
        };
        /**
         * Reads a string preceeded by its byte length as a varint.
         * @returns {string} Value read
         */
        Reader.prototype.string = function () {
            var _a = this.getBytesRange(), start = _a[0], end = _a[1];
            // 直接在原始buffer上解码，避免创建中间bytes对象
            var result = platform.decode.utf8(this.buf, start, end);
            this.pos = end;
            return result;
        };
        /**
         * Skips the specified number of bytes if specified, otherwise skips a varint.
         * @param {number} [length] Length if known, otherwise a varint is assumed
         * @returns {Reader} `this`
         */
        Reader.prototype.skip = function (length) {
            if (typeof length === "number") {
                if (this.pos + length > this.len) {
                    throw this.indexOutOfRange(this, length);
                }
                this.pos += length;
                return this;
            }
            // 变长整数跳过优化 - 使用位运算
            var _a = this, buf = _a.buf, len = _a.len;
            var pos = this.pos;
            // 一次检查多个字节，减少循环次数
            while (pos < len) {
                var byte = buf[pos++];
                if ((byte & 0x80) === 0) {
                    this.pos = pos;
                    return this;
                }
                // 快速检查连续的高位字节
                if (pos < len && (buf[pos] & 0x80) !== 0) {
                    pos++;
                    if (pos < len && (buf[pos] & 0x80) !== 0) {
                        pos++;
                        if (pos < len && (buf[pos] & 0x80) !== 0) {
                            pos++;
                            // 继续检查剩余字节
                            while (pos < len && (buf[pos] & 0x80) !== 0) {
                                pos++;
                                if (pos - this.pos >= 10) {
                                    throw Error("invalid varint encoding");
                                }
                            }
                            if (pos < len) {
                                this.pos = pos + 1;
                                return this;
                            }
                        }
                    }
                }
            }
            throw this.indexOutOfRange(this);
        };
        /**
         * Skips the next element of the specified wire type.
         * @param {number} wireType Wire type received
         * @returns {Reader} `this`
         */
        Reader.prototype.skipType = function (wireType) {
            switch (wireType) {
                case 0:
                    this.skip();
                    break;
                case 1:
                    this.skip(8);
                    break;
                case 2:
                    this.skip(this.uint32());
                    break;
                case 3:
                    while ((wireType = this.uint32() & 7) !== 4) {
                        this.skipType(wireType);
                    }
                    break;
                case 5:
                    this.skip(4);
                    break;
                /* istanbul ignore next */
                default:
                    throw Error("invalid wire type " + wireType + " at offset " + this.pos);
            }
            return this;
        };
        // 添加静态缓存，用于常用的空数组
        Reader.EMPTY_UINT8ARRAY = new Uint8Array(0);
        return Reader;
    }());

    var Layout = /** @class */ (function () {
        function Layout() {
            /**
             * Layout x.
             * @member {number} x
             * @memberof com.opensource.svga.Layout
             * @instance
             */
            this.x = 0;
            /**
             * Layout y.
             * @member {number} y
             * @memberof com.opensource.svga.Layout
             * @instance
             */
            this.y = 0;
            /**
             * Layout width.
             * @member {number} width
             * @memberof com.opensource.svga.Layout
             * @instance
             */
            this.width = 0;
            /**
             * Layout height.
             * @member {number} height
             * @memberof com.opensource.svga.Layout
             * @instance
             */
            this.height = 0;
        }
        /**
         * Decodes a Layout message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.Layout
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.Layout} Layout
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Layout.decode = function (reader, length) {
            var preflight = reader.preflight;
            var end = reader.end(length);
            var hash = preflight.calculate(reader, end);
            if (preflight.has(hash)) {
                reader.pos = end;
                return preflight.get(hash);
            }
            var message = new Layout();
            var tag;
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.x = reader.float();
                        break;
                    }
                    case 2: {
                        message.y = reader.float();
                        break;
                    }
                    case 3: {
                        message.width = reader.float();
                        break;
                    }
                    case 4: {
                        message.height = reader.float();
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            preflight.set(hash, Layout.format(message));
            return preflight.get(hash);
        };
        Layout.format = function (message) {
            var _a = message.x, x = _a === void 0 ? 0 : _a, _b = message.y, y = _b === void 0 ? 0 : _b, _c = message.width, width = _c === void 0 ? 0 : _c, _d = message.height, height = _d === void 0 ? 0 : _d;
            return { x: x, y: y, width: width, height: height };
        };
        return Layout;
    }());

    var Transform = /** @class */ (function () {
        function Transform() {
            /**
             * Transform a.
             * @member {number} a
             * @memberof com.opensource.svga.Transform
             * @instance
             */
            this.a = 0;
            /**
             * Transform b.
             * @member {number} b
             * @memberof com.opensource.svga.Transform
             * @instance
             */
            this.b = 0;
            /**
             * Transform c.
             * @member {number} c
             * @memberof com.opensource.svga.Transform
             * @instance
             */
            this.c = 0;
            /**
             * Transform d.
             * @member {number} d
             * @memberof com.opensource.svga.Transform
             * @instance
             */
            this.d = 0;
            /**
             * Transform tx.
             * @member {number} tx
             * @memberof com.opensource.svga.Transform
             * @instance
             */
            this.tx = 0;
            /**
             * Transform ty.
             * @member {number} ty
             * @memberof com.opensource.svga.Transform
             * @instance
             */
            this.ty = 0;
        }
        /**
         * Decodes a Transform message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.Transform
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.Transform} Transform
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transform.decode = function (reader, length) {
            var end = reader.end(length);
            var message = new Transform();
            var tag;
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.a = reader.float();
                        break;
                    }
                    case 2: {
                        message.b = reader.float();
                        break;
                    }
                    case 3: {
                        message.c = reader.float();
                        break;
                    }
                    case 4: {
                        message.d = reader.float();
                        break;
                    }
                    case 5: {
                        message.tx = reader.float();
                        break;
                    }
                    case 6: {
                        message.ty = reader.float();
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        return Transform;
    }());

    var ShapeArgs = /** @class */ (function () {
        function ShapeArgs() {
            /**
             * ShapeArgs d.
             * @member {string} d
             * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
             * @instance
             */
            this.d = "";
        }
        /**
         * Decodes a ShapeArgs message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ShapeArgs.decode = function (reader, length) {
            var preflight = reader.preflight;
            var end = reader.end(length);
            var hash = preflight.calculate(reader, end);
            if (preflight.has(hash)) {
                reader.pos = end;
                return preflight.get(hash);
            }
            var message = new ShapeArgs();
            var tag;
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.d = reader.string();
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            preflight.set(hash, message);
            return preflight.get(hash);
        };
        return ShapeArgs;
    }());

    var RectArgs = /** @class */ (function () {
        function RectArgs() {
            /**
             * RectArgs x.
             * @member {number} x
             * @memberof com.opensource.svga.ShapeEntity.RectArgs
             * @instance
             */
            this.x = 0;
            /**
             * RectArgs y.
             * @member {number} y
             * @memberof com.opensource.svga.ShapeEntity.RectArgs
             * @instance
             */
            this.y = 0;
            /**
             * RectArgs width.
             * @member {number} width
             * @memberof com.opensource.svga.ShapeEntity.RectArgs
             * @instance
             */
            this.width = 0;
            /**
             * RectArgs height.
             * @member {number} height
             * @memberof com.opensource.svga.ShapeEntity.RectArgs
             * @instance
             */
            this.height = 0;
            /**
             * RectArgs cornerRadius.
             * @member {number} cornerRadius
             * @memberof com.opensource.svga.ShapeEntity.RectArgs
             * @instance
             */
            this.cornerRadius = 0;
        }
        /**
         * Decodes a RectArgs message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.ShapeEntity.RectArgs
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RectArgs.decode = function (reader, length) {
            var preflight = reader.preflight;
            var end = reader.end(length);
            var hash = preflight.calculate(reader, end);
            if (preflight.has(hash)) {
                reader.pos = end;
                return preflight.get(hash);
            }
            var message = new RectArgs();
            var tag;
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.x = reader.float();
                        break;
                    }
                    case 2: {
                        message.y = reader.float();
                        break;
                    }
                    case 3: {
                        message.width = reader.float();
                        break;
                    }
                    case 4: {
                        message.height = reader.float();
                        break;
                    }
                    case 5: {
                        message.cornerRadius = reader.float();
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            preflight.set(hash, message);
            return preflight.get(hash);
        };
        return RectArgs;
    }());

    var EllipseArgs = /** @class */ (function () {
        function EllipseArgs() {
            /**
             * EllipseArgs x.
             * @member {number} x
             * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
             * @instance
             */
            this.x = 0;
            /**
             * EllipseArgs y.
             * @member {number} y
             * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
             * @instance
             */
            this.y = 0;
            /**
             * EllipseArgs radiusX.
             * @member {number} radiusX
             * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
             * @instance
             */
            this.radiusX = 0;
            /**
             * EllipseArgs radiusY.
             * @member {number} radiusY
             * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
             * @instance
             */
            this.radiusY = 0;
        }
        /**
         * Decodes an EllipseArgs message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EllipseArgs.decode = function (reader, length) {
            var preflight = reader.preflight;
            var end = reader.end(length);
            var hash = preflight.calculate(reader, end);
            if (preflight.has(hash)) {
                reader.pos = end;
                return preflight.get(hash);
            }
            var message = new EllipseArgs();
            var tag;
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.x = reader.float();
                        break;
                    }
                    case 2: {
                        message.y = reader.float();
                        break;
                    }
                    case 3: {
                        message.radiusX = reader.float();
                        break;
                    }
                    case 4: {
                        message.radiusY = reader.float();
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            preflight.set(hash, message);
            return preflight.get(hash);
        };
        return EllipseArgs;
    }());

    var RGBAColor = /** @class */ (function () {
        function RGBAColor() {
            /**
             * RGBAColor r.
             * @member {number} r
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
             * @instance
             */
            this.r = 0;
            /**
             * RGBAColor g.
             * @member {number} g
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
             * @instance
             */
            this.g = 0;
            /**
             * RGBAColor b.
             * @member {number} b
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
             * @instance
             */
            this.b = 0;
            /**
             * RGBAColor a.
             * @member {number} a
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
             * @instance
             */
            this.a = 0;
        }
        /**
         * Decodes a RGBAColor message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGBAColor.decode = function (reader, length) {
            var preflight = reader.preflight;
            var end = reader.end(length);
            var hash = preflight.calculate(reader, end);
            if (preflight.has(hash)) {
                reader.pos = end;
                return preflight.get(hash);
            }
            var message = new RGBAColor();
            var tag;
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.r = reader.float();
                        break;
                    }
                    case 2: {
                        message.g = reader.float();
                        break;
                    }
                    case 3: {
                        message.b = reader.float();
                        break;
                    }
                    case 4: {
                        message.a = reader.float();
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            preflight.set(hash, RGBAColor.format(message));
            return preflight.get(hash);
        };
        RGBAColor.format = function (message) {
            var r = message.r, g = message.g, b = message.b, a = message.a;
            return "rgba(".concat((r * 255) | 0, ", ").concat((g * 255) | 0, ", ").concat((b * 255) | 0, ", ").concat((a * 1) | 0, ")");
        };
        return RGBAColor;
    }());

    var ShapeStyle = /** @class */ (function () {
        function ShapeStyle() {
            /**
             * ShapeStyle fill.
             * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} fill
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
             * @instance
             */
            this.fill = null;
            /**
             * ShapeStyle stroke.
             * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} stroke
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
             * @instance
             */
            this.stroke = null;
            /**
             * ShapeStyle strokeWidth.
             * @member {number} strokeWidth
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
             * @instance
             */
            this.strokeWidth = 0;
            /**
             * ShapeStyle lineCap.
             * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap} lineCap
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
             * @instance
             */
            this.lineCap = 0;
            /**
             * ShapeStyle lineJoin.
             * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin} lineJoin
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
             * @instance
             */
            this.lineJoin = 0;
            /**
             * ShapeStyle miterLimit.
             * @member {number} miterLimit
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
             * @instance
             */
            this.miterLimit = 0;
            /**
             * ShapeStyle lineDashI.
             * @member {number} lineDashI
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
             * @instance
             */
            this.lineDashI = 0;
            /**
             * ShapeStyle lineDashII.
             * @member {number} lineDashII
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
             * @instance
             */
            this.lineDashII = 0;
            /**
             * ShapeStyle lineDashIII.
             * @member {number} lineDashIII
             * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
             * @instance
             */
            this.lineDashIII = 0;
        }
        /**
         * Decodes a ShapeStyle message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ShapeStyle.decode = function (reader, length) {
            var preflight = reader.preflight;
            var end = reader.end(length);
            var hash = preflight.calculate(reader, end);
            if (preflight.has(hash)) {
                reader.pos = end;
                return preflight.get(hash);
            }
            var message = new ShapeStyle();
            var tag;
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.fill = RGBAColor.decode(reader, reader.uint32());
                        break;
                    }
                    case 2: {
                        message.stroke = RGBAColor.decode(reader, reader.uint32());
                        break;
                    }
                    case 3: {
                        message.strokeWidth = reader.float();
                        break;
                    }
                    case 4: {
                        message.lineCap = reader.int32();
                        break;
                    }
                    case 5: {
                        message.lineJoin = reader.int32();
                        break;
                    }
                    case 6: {
                        message.miterLimit = reader.float();
                        break;
                    }
                    case 7: {
                        message.lineDashI = reader.float();
                        break;
                    }
                    case 8: {
                        message.lineDashII = reader.float();
                        break;
                    }
                    case 9: {
                        message.lineDashIII = reader.float();
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            preflight.set(hash, ShapeStyle.format(message));
            return preflight.get(hash);
        };
        ShapeStyle.format = function (message) {
            var fill = message.fill, stroke = message.stroke, strokeWidth = message.strokeWidth, miterLimit = message.miterLimit, lineDashI = message.lineDashI, lineDashII = message.lineDashII, lineDashIII = message.lineDashIII;
            var lineDash = [];
            var lineCap;
            var lineJoin;
            if (lineDashI > 0) {
                lineDash.push(lineDashI);
            }
            if (lineDashII > 0) {
                if (lineDash.length < 1) {
                    lineDash.push(0);
                }
                lineDash.push(lineDashII);
            }
            if (lineDashIII > 0) {
                if (lineDash.length < 2) {
                    lineDash.push(0, 0);
                }
                lineDash.push(lineDashIII);
            }
            switch (message.lineCap) {
                case 0 /* PlatformVideo.LINE_CAP_CODE.BUTT */:
                    lineCap = "butt" /* PlatformVideo.LINE_CAP.BUTT */;
                    break;
                case 1 /* PlatformVideo.LINE_CAP_CODE.ROUND */:
                    lineCap = "round" /* PlatformVideo.LINE_CAP.ROUND */;
                    break;
                case 2 /* PlatformVideo.LINE_CAP_CODE.SQUARE */:
                    lineCap = "square" /* PlatformVideo.LINE_CAP.SQUARE */;
                    break;
            }
            switch (message.lineJoin) {
                case 0 /* PlatformVideo.LINE_JOIN_CODE.MITER */:
                    lineJoin = "miter" /* PlatformVideo.LINE_JOIN.MITER */;
                    break;
                case 1 /* PlatformVideo.LINE_JOIN_CODE.ROUND */:
                    lineJoin = "round" /* PlatformVideo.LINE_JOIN.ROUND */;
                    break;
                case 2 /* PlatformVideo.LINE_JOIN_CODE.BEVEL */:
                    lineJoin = "bevel" /* PlatformVideo.LINE_JOIN.BEVEL */;
                    break;
            }
            return {
                lineDash: lineDash,
                fill: fill ? fill : null,
                stroke: stroke ? stroke : null,
                lineCap: lineCap,
                lineJoin: lineJoin,
                strokeWidth: strokeWidth,
                miterLimit: miterLimit
            };
        };
        return ShapeStyle;
    }());

    var ShapeEntity = /** @class */ (function () {
        function ShapeEntity() {
            /**
             * ShapeEntity type.
             * @member {com.opensource.svga.ShapeEntity.ShapeType} type
             * @memberof com.opensource.svga.ShapeEntity
             * @instance
             */
            this.type = 0;
            /**
             * ShapeEntity shape.
             * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
             * @memberof com.opensource.svga.ShapeEntity
             * @instance
             */
            this.shape = null;
            /**
             * ShapeEntity rect.
             * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
             * @memberof com.opensource.svga.ShapeEntity
             * @instance
             */
            this.rect = null;
            /**
             * ShapeEntity ellipse.
             * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
             * @memberof com.opensource.svga.ShapeEntity
             * @instance
             */
            this.ellipse = null;
            /**
             * ShapeEntity styles.
             * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
             * @memberof com.opensource.svga.ShapeEntity
             * @instance
             */
            this.styles = null;
            /**
             * ShapeEntity transform.
             * @member {com.opensource.svga.ITransform|null|undefined} transform
             * @memberof com.opensource.svga.ShapeEntity
             * @instance
             */
            this.transform = null;
        }
        /**
         * Decodes a ShapeEntity message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.ShapeEntity
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ShapeEntity.decode = function (reader, length) {
            var end = reader.end(length);
            var message = new ShapeEntity();
            var tag;
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.type = reader.int32();
                        break;
                    }
                    case 2: {
                        message.shape = ShapeArgs.decode(reader, reader.uint32());
                        break;
                    }
                    case 3: {
                        message.rect = RectArgs.decode(reader, reader.uint32());
                        break;
                    }
                    case 4: {
                        message.ellipse = EllipseArgs.decode(reader, reader.uint32());
                        break;
                    }
                    case 10: {
                        message.styles = ShapeStyle.decode(reader, reader.uint32());
                        break;
                    }
                    case 11: {
                        message.transform = Transform.decode(reader, reader.uint32());
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return ShapeEntity.format(message);
        };
        ShapeEntity.format = function (message) {
            var type = message.type, shape = message.shape, rect = message.rect, ellipse = message.ellipse, styles = message.styles, transform = message.transform;
            switch (type) {
                case 0 /* PlatformVideo.SHAPE_TYPE_CODE.SHAPE */:
                    return {
                        type: "shape" /* PlatformVideo.SHAPE_TYPE.SHAPE */,
                        path: shape,
                        styles: styles,
                        transform: transform,
                    };
                case 1 /* PlatformVideo.SHAPE_TYPE_CODE.RECT */:
                    return {
                        type: "rect" /* PlatformVideo.SHAPE_TYPE.RECT */,
                        path: rect,
                        styles: styles,
                        transform: transform,
                    };
                case 2 /* PlatformVideo.SHAPE_TYPE_CODE.ELLIPSE */:
                    return {
                        type: "ellipse" /* PlatformVideo.SHAPE_TYPE.ELLIPSE */,
                        path: ellipse,
                        styles: styles,
                        transform: transform,
                    };
            }
            return null;
        };
        return ShapeEntity;
    }());

    var FrameEntity = /** @class */ (function () {
        function FrameEntity() {
            /**
             * FrameEntity shapes.
             * @member {Array.<com.opensource.svga.IShapeEntity>} shapes
             * @memberof com.opensource.svga.FrameEntity
             * @instance
             */
            this.shapes = [];
            /**
             * FrameEntity alpha.
             * @member {number} alpha
             * @memberof com.opensource.svga.FrameEntity
             * @instance
             */
            this.alpha = 0;
            /**
             * FrameEntity layout.
             * @member {com.opensource.svga.ILayout|null|undefined} layout
             * @memberof com.opensource.svga.FrameEntity
             * @instance
             */
            this.layout = null;
            /**
             * FrameEntity transform.
             * @member {com.opensource.svga.ITransform|null|undefined} transform
             * @memberof com.opensource.svga.FrameEntity
             * @instance
             */
            this.transform = null;
            /**
             * FrameEntity clipPath.
             * @member {string} clipPath
             * @memberof com.opensource.svga.FrameEntity
             * @instance
             */
            this.clipPath = "";
        }
        /**
         * Decodes a FrameEntity message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.FrameEntity
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.FrameEntity} FrameEntity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FrameEntity.decode = function (reader, length) {
            var end = reader.end(length);
            var message = new FrameEntity();
            var tag;
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.alpha = reader.float();
                        break;
                    }
                    case 2: {
                        message.layout = Layout.decode(reader, reader.uint32());
                        break;
                    }
                    case 3: {
                        message.transform = Transform.decode(reader, reader.uint32());
                        break;
                    }
                    case 4: {
                        message.clipPath = reader.string();
                        break;
                    }
                    case 5: {
                        var shape = ShapeEntity.decode(reader, reader.uint32());
                        if (shape !== null) {
                            message.shapes.push(shape);
                        }
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            if (message.shapes.length === 0) {
                message.shapes = reader.preflight.get("latest_shapes");
            }
            else {
                reader.preflight.set("latest_shapes", message.shapes);
            }
            return FrameEntity.format(message);
        };
        FrameEntity.format = function (message) {
            // alpha值小于 0.05 将不展示，所以不做解析处理
            if (message.alpha < 0.05) {
                return FrameEntity.HIDDEN_FRAME;
            }
            var alpha = message.alpha, layout = message.layout, transform = message.transform, shapes = message.shapes;
            return {
                alpha: alpha,
                layout: layout,
                transform: transform,
                shapes: shapes,
            };
        };
        FrameEntity.HIDDEN_FRAME = {
            alpha: 0,
        };
        return FrameEntity;
    }());

    var SpriteEntity = /** @class */ (function () {
        function SpriteEntity() {
            /**
             * SpriteEntity frames.
             * @member {Array.<com.opensource.svga.IFrameEntity>} frames
             * @memberof com.opensource.svga.SpriteEntity
             * @instance
             */
            this.frames = [];
            /**
             * SpriteEntity imageKey.
             * @member {string} imageKey
             * @memberof com.opensource.svga.SpriteEntity
             * @instance
             */
            this.imageKey = "";
            /**
             * SpriteEntity matteKey.
             * @member {string} matteKey
             * @memberof com.opensource.svga.SpriteEntity
             * @instance
             */
            this.matteKey = "";
        }
        /**
         * Decodes a SpriteEntity message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.SpriteEntity
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SpriteEntity.decode = function (reader, length) {
            var end = reader.end(length);
            var message = new SpriteEntity();
            var tag;
            reader.preflight.set("latest_shapes", []);
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.imageKey = reader.string();
                        break;
                    }
                    case 2: {
                        if (!(message.frames && message.frames.length)) {
                            message.frames = [];
                        }
                        message.frames.push(FrameEntity.decode(reader, reader.uint32()));
                        break;
                    }
                    case 3: {
                        message.matteKey = reader.string();
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return SpriteEntity.format(message);
        };
        SpriteEntity.format = function (message) {
            return {
                imageKey: message.imageKey,
                frames: message.frames,
            };
        };
        return SpriteEntity;
    }());

    var MovieParams = /** @class */ (function () {
        function MovieParams() {
            /**
             * MovieParams viewBoxWidth.
             * @member {number} viewBoxWidth
             * @memberof com.opensource.svga.MovieParams
             * @instance
             */
            this.viewBoxWidth = 0;
            /**
             * MovieParams viewBoxHeight.
             * @member {number} viewBoxHeight
             * @memberof com.opensource.svga.MovieParams
             * @instance
             */
            this.viewBoxHeight = 0;
            /**
             * MovieParams fps.
             * @member {number} fps
             * @memberof com.opensource.svga.MovieParams
             * @instance
             */
            this.fps = 0;
            /**
             * MovieParams frames.
             * @member {number} frames
             * @memberof com.opensource.svga.MovieParams
             * @instance
             */
            this.frames = 0;
        }
        /**
         * Decodes a MovieParams message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.MovieParams
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.MovieParams} MovieParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MovieParams.decode = function (reader, length) {
            var end = reader.end(length);
            var message = new MovieParams();
            var tag;
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.viewBoxWidth = reader.float();
                        break;
                    }
                    case 2: {
                        message.viewBoxHeight = reader.float();
                        break;
                    }
                    case 3: {
                        message.fps = reader.int32();
                        break;
                    }
                    case 4: {
                        message.frames = reader.int32();
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        return MovieParams;
    }());

    var MovieEntity = /** @class */ (function () {
        function MovieEntity() {
            /**
             * MovieEntity version.
             * @member {string} version
             * @memberof com.opensource.svga.MovieEntity
             * @instance
             */
            this.version = "";
            /**
             * MovieEntity params.
             * @member {com.opensource.svga.IMovieParams|null|undefined} params
             * @memberof com.opensource.svga.MovieEntity
             * @instance
             */
            this.params = null;
            /**
             * MovieEntity images.
             * @member {Object.<string,Uint8Array>} images
             * @memberof com.opensource.svga.MovieEntity
             * @instance
             */
            this.images = {};
            /**
             * MovieEntity sprites.
             * @member {Array.<com.opensource.svga.ISpriteEntity>} sprites
             * @memberof com.opensource.svga.MovieEntity
             * @instance
             */
            this.sprites = [];
        }
        /**
         * Decodes a MovieEntity message from the specified reader.
         * @function decode
         * @memberof com.opensource.svga.MovieEntity
         * @static
         * @param {$protobuf.Reader} reader Reader to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {com.opensource.svga.MovieEntity} MovieEntity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MovieEntity.decode = function (reader, length) {
            var end = reader.end(length);
            var message = new MovieEntity();
            var key;
            var value;
            var end2;
            var tag;
            var tag2;
            while (reader.pos < end) {
                tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1: {
                        message.version = reader.string();
                        break;
                    }
                    case 2: {
                        message.params = MovieParams.decode(reader, reader.uint32());
                        break;
                    }
                    case 3: {
                        end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = MovieEntity.EMPTY_U8;
                        while (reader.pos < end2) {
                            tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = reader.bytes();
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                            }
                        }
                        message.images[key] = value;
                        break;
                    }
                    case 4: {
                        message.sprites.push(SpriteEntity.decode(reader, reader.uint32()));
                        break;
                    }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return MovieEntity.format(message);
        };
        MovieEntity.format = function (message) {
            var version = message.version, images = message.images, sprites = message.sprites;
            var _a = message.params, fps = _a.fps, frames = _a.frames, viewBoxWidth = _a.viewBoxWidth, viewBoxHeight = _a.viewBoxHeight;
            return {
                version: version,
                filename: "",
                locked: false,
                dynamicElements: {},
                size: {
                    width: viewBoxWidth,
                    height: viewBoxHeight,
                },
                fps: fps,
                frames: frames,
                images: images,
                sprites: sprites,
            };
        };
        MovieEntity.EMPTY_U8 = new Uint8Array(0);
        return MovieEntity;
    }());

    // import benchmark from "octopus-benchmark";
    function createVideoEntity(data, filename) {
        if (data instanceof Uint8Array) {
            var reader = new Reader(data);
            var video = MovieEntity.decode(reader);
            // benchmark.log('preflight cache size', reader.preflight.size);
            // benchmark.log('preflight hit count', reader.preflight.hitCount);
            video.filename = filename;
            reader.preflight.clear();
            return video;
        }
        throw new Error("Invalid data type");
    }

    /**
     * CurrentPoint对象池，用于减少对象创建和GC压力
     */
    var PointPool = /** @class */ (function () {
        function PointPool() {
            this.pool = [];
        }
        PointPool.prototype.acquire = function () {
            var pool = this.pool;
            return pool.length > 0
                ? pool.pop()
                : { x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
        };
        PointPool.prototype.release = function (point) {
            // 重置点的属性
            point.x = point.y = point.x1 = point.y1 = point.x2 = point.y2 = 0;
            this.pool.push(point);
        };
        return PointPool;
    }());

    var Renderer2D = /** @class */ (function () {
        function Renderer2D(context) {
            this.context = context;
            this.pointPool = new PointPool();
            this.lastResizeKey = "";
            this.globalTransform = undefined;
            this.currentPoint = this.pointPool.acquire();
        }
        // 在Renderer2D类中添加新的解析方法
        Renderer2D.parseSVGPath = function (d) {
            var SVG_LETTER_REGEXP = Renderer2D.SVG_LETTER_REGEXP;
            var result = [];
            var currentIndex = 0;
            // 状态：0 - 等待命令，1 - 读取参数
            var state = 0;
            var currentCommand = "";
            var currentArgs = "";
            while (currentIndex < d.length) {
                var char = d[currentIndex];
                switch (state) {
                    case 0: // 等待命令
                        if (SVG_LETTER_REGEXP.test(char)) {
                            currentCommand = char;
                            state = 1;
                        }
                        break;
                    case 1: // 读取参数
                        if (SVG_LETTER_REGEXP.test(char)) {
                            // 遇到新命令，保存当前命令和参数
                            result.push({
                                command: currentCommand,
                                args: currentArgs.trim(),
                            });
                            currentCommand = char;
                            currentArgs = "";
                        }
                        else {
                            currentArgs += char;
                        }
                        break;
                }
                currentIndex++;
            }
            // 处理最后一个命令
            if (currentCommand && state === 1) {
                result.push({
                    command: currentCommand,
                    args: currentArgs.trim(),
                });
            }
            return result;
        };
        Renderer2D.fillOrStroke = function (context, styles) {
            if (styles) {
                if (styles.fill) {
                    context.fill();
                }
                if (styles.stroke) {
                    context.stroke();
                }
            }
        };
        Renderer2D.resetShapeStyles = function (context, styles) {
            if (styles) {
                context.strokeStyle = styles.stroke || "transparent";
                if (styles.strokeWidth > 0) {
                    context.lineWidth = styles.strokeWidth;
                }
                if (styles.miterLimit > 0) {
                    context.miterLimit = styles.miterLimit;
                }
                if (styles.lineCap) {
                    context.lineCap = styles.lineCap;
                }
                if (styles.lineJoin) {
                    context.lineJoin = styles.lineJoin;
                }
                context.fillStyle = styles.fill || "transparent";
                if (styles.lineDash) {
                    context.setLineDash(styles.lineDash);
                }
            }
        };
        /**
         * 计算缩放比例
         * @param contentMode
         * @param videoSize
         * @param canvasSize
         * @returns
         */
        Renderer2D.calculateScale = function (contentMode, videoSize, canvasSize) {
            var imageRatio = videoSize.width / videoSize.height;
            var viewRatio = canvasSize.width / canvasSize.height;
            var isAspectFit = contentMode === "aspect-fit" /* PLAYER_CONTENT_MODE.ASPECT_FIT */;
            var shouldUseWidth = (imageRatio >= viewRatio && isAspectFit) ||
                (imageRatio <= viewRatio && !isAspectFit);
            var createTransform = function (scale, translateX, translateY) { return ({
                scaleX: scale,
                scaleY: scale,
                translateX: translateX,
                translateY: translateY,
            }); };
            if (shouldUseWidth) {
                var scale_1 = canvasSize.width / videoSize.width;
                return createTransform(scale_1, 0, (canvasSize.height - videoSize.height * scale_1) / 2);
            }
            var scale = canvasSize.height / videoSize.height;
            return createTransform(scale, (canvasSize.width - videoSize.width * scale) / 2, 0);
        };
        Renderer2D.prototype.setTransform = function (transform) {
            if (transform && this.context) {
                this.context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
            }
        };
        Renderer2D.prototype.drawBezier = function (d, transform, styles) {
            var _a = this, context = _a.context, pointPool = _a.pointPool;
            this.currentPoint = pointPool.acquire();
            context.save();
            Renderer2D.resetShapeStyles(context, styles);
            this.setTransform(transform);
            context.beginPath();
            if (d) {
                // 使用状态机解析器替代正则表达式
                var commands = Renderer2D.parseSVGPath(d);
                for (var _i = 0, commands_1 = commands; _i < commands_1.length; _i++) {
                    var _b = commands_1[_i], command = _b.command, args = _b.args;
                    if (Renderer2D.SVG_PATH.has(command)) {
                        this.drawBezierElement(this.currentPoint, command, args.split(/[\s,]+/).filter(Boolean));
                    }
                }
            }
            Renderer2D.fillOrStroke(context, styles);
            pointPool.release(this.currentPoint);
            context.restore();
        };
        Renderer2D.prototype.drawBezierElement = function (currentPoint, method, args) {
            var context = this.context;
            switch (method) {
                case "M":
                    currentPoint.x = +args[0];
                    currentPoint.y = +args[1];
                    context.moveTo(currentPoint.x, currentPoint.y);
                    break;
                case "m":
                    currentPoint.x += +args[0];
                    currentPoint.y += +args[1];
                    context.moveTo(currentPoint.x, currentPoint.y);
                    break;
                case "L":
                    currentPoint.x = +args[0];
                    currentPoint.y = +args[1];
                    context.lineTo(currentPoint.x, currentPoint.y);
                    break;
                case "l":
                    currentPoint.x += +args[0];
                    currentPoint.y += +args[1];
                    context.lineTo(currentPoint.x, currentPoint.y);
                    break;
                case "H":
                    currentPoint.x = +args[0];
                    context.lineTo(currentPoint.x, currentPoint.y);
                    break;
                case "h":
                    currentPoint.x += +args[0];
                    context.lineTo(currentPoint.x, currentPoint.y);
                    break;
                case "V":
                    currentPoint.y = +args[0];
                    context.lineTo(currentPoint.x, currentPoint.y);
                    break;
                case "v":
                    currentPoint.y += +args[0];
                    context.lineTo(currentPoint.x, currentPoint.y);
                    break;
                case "C":
                    currentPoint.x1 = +args[0];
                    currentPoint.y1 = +args[1];
                    currentPoint.x2 = +args[2];
                    currentPoint.y2 = +args[3];
                    currentPoint.x = +args[4];
                    currentPoint.y = +args[5];
                    context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
                    break;
                case "c":
                    currentPoint.x1 = currentPoint.x + +args[0];
                    currentPoint.y1 = currentPoint.y + +args[1];
                    currentPoint.x2 = currentPoint.x + +args[2];
                    currentPoint.y2 = currentPoint.y + +args[3];
                    currentPoint.x += +args[4];
                    currentPoint.y += +args[5];
                    context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
                    break;
                case "S":
                    if (currentPoint.x1 !== undefined &&
                        currentPoint.y1 !== undefined &&
                        currentPoint.x2 !== undefined &&
                        currentPoint.y2 !== undefined) {
                        currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
                        currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
                        currentPoint.x2 = +args[0];
                        currentPoint.y2 = +args[1];
                        currentPoint.x = +args[2];
                        currentPoint.y = +args[3];
                        context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
                    }
                    else {
                        currentPoint.x1 = +args[0];
                        currentPoint.y1 = +args[1];
                        currentPoint.x = +args[2];
                        currentPoint.y = +args[3];
                        context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
                    }
                    break;
                case "s":
                    if (currentPoint.x1 !== undefined &&
                        currentPoint.y1 !== undefined &&
                        currentPoint.x2 !== undefined &&
                        currentPoint.y2 !== undefined) {
                        currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
                        currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
                        currentPoint.x2 = currentPoint.x + +args[0];
                        currentPoint.y2 = currentPoint.y + +args[1];
                        currentPoint.x += +args[2];
                        currentPoint.y += +args[3];
                        context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
                    }
                    else {
                        currentPoint.x1 = currentPoint.x + +args[0];
                        currentPoint.y1 = currentPoint.y + +args[1];
                        currentPoint.x += +args[2];
                        currentPoint.y += +args[3];
                        context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
                    }
                    break;
                case "Q":
                    currentPoint.x1 = +args[0];
                    currentPoint.y1 = +args[1];
                    currentPoint.x = +args[2];
                    currentPoint.y = +args[3];
                    context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
                    break;
                case "q":
                    currentPoint.x1 = currentPoint.x + +args[0];
                    currentPoint.y1 = currentPoint.y + +args[1];
                    currentPoint.x += +args[2];
                    currentPoint.y += +args[3];
                    context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
                    break;
                case "Z":
                case "z":
                    context.closePath();
                    break;
            }
        };
        Renderer2D.prototype.drawEllipse = function (x, y, radiusX, radiusY, transform, styles) {
            var context = this.context;
            context.save();
            Renderer2D.resetShapeStyles(context, styles);
            this.setTransform(transform);
            x -= radiusX;
            y -= radiusY;
            var w = radiusX * 2;
            var h = radiusY * 2;
            var kappa = 0.5522848;
            var ox = (w / 2) * kappa;
            var oy = (h / 2) * kappa;
            var xe = x + w;
            var ye = y + h;
            var xm = x + w / 2;
            var ym = y + h / 2;
            context.beginPath();
            context.moveTo(x, ym);
            context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            Renderer2D.fillOrStroke(context, styles);
            context.restore();
        };
        Renderer2D.prototype.drawRect = function (x, y, width, height, cornerRadius, transform, styles) {
            var context = this.context;
            context.save();
            Renderer2D.resetShapeStyles(context, styles);
            this.setTransform(transform);
            var radius = cornerRadius;
            if (width < 2 * radius) {
                radius = width / 2;
            }
            if (height < 2 * radius) {
                radius = height / 2;
            }
            context.beginPath();
            context.moveTo(x + radius, y);
            context.arcTo(x + width, y, x + width, y + height, radius);
            context.arcTo(x + width, y + height, x, y + height, radius);
            context.arcTo(x, y + height, x, y, radius);
            context.arcTo(x, y, x + width, y, radius);
            context.closePath();
            Renderer2D.fillOrStroke(context, styles);
            context.restore();
        };
        Renderer2D.prototype.drawShape = function (shape) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var type = shape.type, path = shape.path, transform = shape.transform, styles = shape.styles;
            switch (type) {
                case "shape" /* PlatformVideo.SHAPE_TYPE.SHAPE */:
                    this.drawBezier(path.d, transform, styles);
                    break;
                case "ellipse" /* PlatformVideo.SHAPE_TYPE.ELLIPSE */:
                    this.drawEllipse((_a = path.x) !== null && _a !== void 0 ? _a : 0, (_b = path.y) !== null && _b !== void 0 ? _b : 0, (_c = path.radiusX) !== null && _c !== void 0 ? _c : 0, (_d = path.radiusY) !== null && _d !== void 0 ? _d : 0, transform, styles);
                    break;
                case "rect" /* PlatformVideo.SHAPE_TYPE.RECT */:
                    this.drawRect((_e = path.x) !== null && _e !== void 0 ? _e : 0, (_f = path.y) !== null && _f !== void 0 ? _f : 0, (_g = path.width) !== null && _g !== void 0 ? _g : 0, (_h = path.height) !== null && _h !== void 0 ? _h : 0, (_j = path.cornerRadius) !== null && _j !== void 0 ? _j : 0, transform, styles);
                    break;
            }
        };
        Renderer2D.prototype.drawSprite = function (frame, bitmap, dynamicElement) {
            if (frame.alpha === 0)
                return;
            var context = this.context;
            var _a = frame, alpha = _a.alpha, transform = _a.transform, layout = _a.layout, shapes = _a.shapes;
            var _b = transform !== null && transform !== void 0 ? transform : {}, _c = _b.a, a = _c === void 0 ? 1 : _c, _d = _b.b, b = _d === void 0 ? 0 : _d, _e = _b.c, c = _e === void 0 ? 0 : _e, _f = _b.d, d = _f === void 0 ? 1 : _f, _g = _b.tx, tx = _g === void 0 ? 0 : _g, _h = _b.ty, ty = _h === void 0 ? 0 : _h;
            context.save();
            this.setTransform(this.globalTransform);
            context.globalAlpha = alpha;
            context.transform(a, b, c, d, tx, ty);
            if (bitmap) {
                context.drawImage(bitmap, 0, 0, layout.width, layout.height);
            }
            if (dynamicElement) {
                context.drawImage(dynamicElement, (layout.width - dynamicElement.width) / 2, (layout.height - dynamicElement.height) / 2);
            }
            for (var i = 0; i < shapes.length; i++) {
                this.drawShape(shapes[i]);
            }
            context.restore();
        };
        /**
         * 调整画布尺寸
         * @param contentMode
         * @param videoSize
         * @param canvasSize
         * @returns
         */
        Renderer2D.prototype.resize = function (contentMode, videoSize, canvasSize) {
            var canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;
            var videoWidth = videoSize.width, videoHeight = videoSize.height;
            var resizeKey = "".concat(contentMode, "-").concat(videoWidth, "-").concat(videoHeight, "-").concat(canvasWidth, "-").concat(canvasHeight);
            var lastTransform = this.globalTransform;
            if (this.lastResizeKey === resizeKey && lastTransform) {
                return;
            }
            var scale = {
                scaleX: 1,
                scaleY: 1,
                translateX: 0,
                translateY: 0,
            };
            if (contentMode === "fill" /* PLAYER_CONTENT_MODE.FILL */) {
                scale.scaleX = canvasWidth / videoWidth;
                scale.scaleY = canvasHeight / videoHeight;
            }
            else {
                scale = Renderer2D.calculateScale(contentMode, videoSize, canvasSize);
            }
            this.lastResizeKey = resizeKey;
            this.globalTransform = {
                a: scale.scaleX,
                b: 0.0,
                c: 0.0,
                d: scale.scaleY,
                tx: scale.translateX,
                ty: scale.translateY,
            };
        };
        Renderer2D.prototype.render = function (videoEntity, materials, dynamicMaterials, currentFrame, head, tail) {
            var sprite;
            var imageKey;
            var bitmap;
            var dynamicElement;
            for (var i = head; i < tail; i++) {
                sprite = videoEntity.sprites[i];
                imageKey = sprite.imageKey;
                bitmap = materials.get(imageKey);
                dynamicElement = dynamicMaterials.get(imageKey);
                this.drawSprite(sprite.frames[currentFrame], bitmap, dynamicElement);
            }
        };
        Renderer2D.prototype.destroy = function () {
            this.globalTransform = undefined;
            this.lastResizeKey = "";
            this.context = null;
        };
        /**
         * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths
         * 绘制路径的不同指令：
         * * 直线命令
         * - M: moveTo，移动到指定点，不绘制直线。
         * - L: lineTo，从起始点绘制一条直线到指定点。
         * - H: horizontal lineTo，从起始点绘制一条水平线到指定点。
         * - V: vertical lineTo，从起始点绘制一条垂直线到指定点。
         * - Z: closePath，从起始点绘制一条直线到路径起点，形成一个闭合路径。
         * * 曲线命令
         * - C: bezierCurveTo，绘制三次贝塞尔曲线。
         * - S: smooth curveTo，绘制平滑三次贝塞尔曲线。
         * - Q: quadraticCurveTo，绘制两次贝塞尔曲线。
         * - T: smooth quadraticCurveTo，绘制平滑两次贝塞尔曲线。
         * * 弧线命令
         * - A: arcTo，从起始点绘制一条弧线到指定点。
         */
        Renderer2D.SVG_PATH = new Set([
            "M",
            "L",
            "H",
            "V",
            "Z",
            "C",
            "S",
            "Q",
            "m",
            "l",
            "h",
            "v",
            "z",
            "c",
            "s",
            "q",
        ]);
        Renderer2D.SVG_LETTER_REGEXP = /[a-zA-Z]/;
        return Renderer2D;
    }());

    /**
     * 动画控制器
     */
    var Animator = /** @class */ (function () {
        function Animator() {
            /**
             * 动画是否执行
             */
            this.isRunning = false;
            /**
             * 动画开始时间
             */
            this.startTime = 0;
            /**
             * 动画持续时间
             */
            this.duration = 0;
            /**
             * 循环播放开始帧与动画开始帧之间的时间偏差
             */
            this.loopStart = 0;
            /**
             * 循环持续时间
             */
            this.loopDuration = 0;
            this.onAnimate = (platform.noop);
            /* ---- 事件钩子 ---- */
            this.onStart = platform.noop;
            this.onUpdate = platform.noop;
            this.onEnd = platform.noop;
        }
        /**
         * 设置动画的必要参数
         * @param duration
         * @param loopStart
         * @param loop
         * @param fillValue
         */
        Animator.prototype.setConfig = function (duration, loopStart, loop, fillValue) {
            this.duration = duration;
            this.loopStart = loopStart;
            this.loopDuration = duration * loop + fillValue - loopStart;
        };
        Animator.prototype.start = function () {
            this.isRunning = true;
            this.startTime = platform.now();
            this.onStart();
            this.doFrame();
        };
        Animator.prototype.resume = function () {
            this.isRunning = true;
            this.startTime = platform.now();
            this.doFrame();
        };
        Animator.prototype.pause = function () {
            this.isRunning = false;
            // 设置暂停的位置
            this.loopStart = (platform.now() - this.startTime + this.loopStart) % this.duration;
        };
        Animator.prototype.stop = function () {
            this.isRunning = false;
            this.loopStart = 0;
        };
        Animator.prototype.doFrame = function () {
            var _this = this;
            if (this.isRunning) {
                this.doDeltaTime(platform.now() - this.startTime);
                if (this.isRunning) {
                    this.onAnimate(function () { return _this.doFrame(); });
                }
            }
        };
        Animator.prototype.doDeltaTime = function (DT) {
            var _a = this, D = _a.duration, LS = _a.loopStart, LD = _a.loopDuration;
            // 本轮动画已消耗的时间比例（Percentage of speed time）
            var TP;
            var ended = false;
            // 运行时间 大于等于 循环持续时间
            if (DT >= LD) {
                // 动画已结束
                TP = 1.0;
                ended = true;
                this.stop();
            }
            else {
                // 本轮动画已消耗的时间比例 = 本轮动画已消耗的时间 / 动画持续时间
                TP = ((DT + LS) % D) / D;
            }
            this.onUpdate(TP);
            if (!this.isRunning && ended) {
                this.onEnd();
            }
        };
        return Animator;
    }());

    // DEFLATE is a complex format; to read this code, you should probably check the RFC first:
    // https://tools.ietf.org/html/rfc1951
    // You may also wish to take a look at the guide I made about this program:
    // https://gist.github.com/101arrowz/253f31eb5abc3d9275ab943003ffecad
    // Some of the following code is similar to that of UZIP.js:
    // https://github.com/photopea/UZIP.js
    // However, the vast majority of the codebase has diverged from UZIP.js to increase performance and reduce bundle size.
    // Sometimes 0 will appear where -1 would be more appropriate. This is because using a uint
    // is better for memory in most engines (I *think*).
    // aliases for shorter compressed code (most minifers don't do this)
    var u8 = Uint8Array, u16 = Uint16Array, i32 = Int32Array;
    // fixed length extra bits
    var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
    // fixed distance extra bits
    var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
    // code length index map
    var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
    // get base, reverse index map from extra bits
    var freb = function (eb, start) {
        var b = new u16(31);
        for (var i = 0; i < 31; ++i) {
            b[i] = start += 1 << eb[i - 1];
        }
        // numbers here are at max 18 bits
        var r = new i32(b[30]);
        for (var i = 1; i < 30; ++i) {
            for (var j = b[i]; j < b[i + 1]; ++j) {
                r[j] = ((j - b[i]) << 5) | i;
            }
        }
        return { b: b, r: r };
    };
    var _a = freb(fleb, 2), fl = _a.b, revfl = _a.r;
    // we can ignore the fact that the other numbers are wrong; they never happen anyway
    fl[28] = 258, revfl[258] = 28;
    var _b = freb(fdeb, 0), fd = _b.b, revfd = _b.r;
    // map of value to reverse (assuming 16 bits)
    var rev = new u16(32768);
    for (var i$1 = 0; i$1 < 32768; ++i$1) {
        // reverse table algorithm from SO
        var x = ((i$1 & 0xAAAA) >> 1) | ((i$1 & 0x5555) << 1);
        x = ((x & 0xCCCC) >> 2) | ((x & 0x3333) << 2);
        x = ((x & 0xF0F0) >> 4) | ((x & 0x0F0F) << 4);
        rev[i$1] = (((x & 0xFF00) >> 8) | ((x & 0x00FF) << 8)) >> 1;
    }
    // create huffman tree from u8 "map": index -> code length for code index
    // mb (max bits) must be at most 15
    // TODO: optimize/split up?
    var hMap = (function (cd, mb, r) {
        var s = cd.length;
        // index
        var i = 0;
        // u16 "map": index -> # of codes with bit length = index
        var l = new u16(mb);
        // length of cd must be 288 (total # of codes)
        for (; i < s; ++i) {
            if (cd[i])
                ++l[cd[i] - 1];
        }
        // u16 "map": index -> minimum code for bit length = index
        var le = new u16(mb);
        for (i = 1; i < mb; ++i) {
            le[i] = (le[i - 1] + l[i - 1]) << 1;
        }
        var co;
        if (r) {
            // u16 "map": index -> number of actual bits, symbol for code
            co = new u16(1 << mb);
            // bits to remove for reverser
            var rvb = 15 - mb;
            for (i = 0; i < s; ++i) {
                // ignore 0 lengths
                if (cd[i]) {
                    // num encoding both symbol and bits read
                    var sv = (i << 4) | cd[i];
                    // free bits
                    var r_1 = mb - cd[i];
                    // start value
                    var v = le[cd[i] - 1]++ << r_1;
                    // m is end value
                    for (var m = v | ((1 << r_1) - 1); v <= m; ++v) {
                        // every 16 bit value starting with the code yields the same result
                        co[rev[v] >> rvb] = sv;
                    }
                }
            }
        }
        else {
            co = new u16(s);
            for (i = 0; i < s; ++i) {
                if (cd[i]) {
                    co[i] = rev[le[cd[i] - 1]++] >> (15 - cd[i]);
                }
            }
        }
        return co;
    });
    // fixed length tree
    var flt = new u8(288);
    for (var i$1 = 0; i$1 < 144; ++i$1)
        flt[i$1] = 8;
    for (var i$1 = 144; i$1 < 256; ++i$1)
        flt[i$1] = 9;
    for (var i$1 = 256; i$1 < 280; ++i$1)
        flt[i$1] = 7;
    for (var i$1 = 280; i$1 < 288; ++i$1)
        flt[i$1] = 8;
    // fixed distance tree
    var fdt = new u8(32);
    for (var i$1 = 0; i$1 < 32; ++i$1)
        fdt[i$1] = 5;
    // fixed length map
    var flm = /*#__PURE__*/ hMap(flt, 9, 0), flrm = /*#__PURE__*/ hMap(flt, 9, 1);
    // fixed distance map
    var fdm = /*#__PURE__*/ hMap(fdt, 5, 0), fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
    // find max of array
    var max = function (a) {
        var m = a[0];
        for (var i = 1; i < a.length; ++i) {
            if (a[i] > m)
                m = a[i];
        }
        return m;
    };
    // read d, starting at bit p and mask with m
    var bits = function (d, p, m) {
        var o = (p / 8) | 0;
        return ((d[o] | (d[o + 1] << 8)) >> (p & 7)) & m;
    };
    // read d, starting at bit p continuing for at least 16 bits
    var bits16 = function (d, p) {
        var o = (p / 8) | 0;
        return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) >> (p & 7));
    };
    // get end of byte
    var shft = function (p) { return ((p + 7) / 8) | 0; };
    // typed array slice - allows garbage collector to free original reference,
    // while being more compatible than .slice
    var slc = function (v, s, e) {
        if (e == null || e > v.length)
            e = v.length;
        // can't use .constructor in case user-supplied
        return new u8(v.subarray(s, e));
    };
    // error codes
    var ec = [
        'unexpected EOF',
        'invalid block type',
        'invalid length/literal',
        'invalid distance',
        'stream finished',
        'no stream handler',
        , // determined by compression function
        'no callback',
        'invalid UTF-8 data',
        'extra field too long',
        'date not in range 1980-2099',
        'filename too long',
        'stream finishing',
        'invalid zip data'
        // determined by unknown compression method
    ];
    var err = function (ind, msg, nt) {
        var e = new Error(msg || ec[ind]);
        e.code = ind;
        if (Error.captureStackTrace)
            Error.captureStackTrace(e, err);
        if (!nt)
            throw e;
        return e;
    };
    // expands raw DEFLATE data
    var inflt = function (dat, st, buf, dict) {
        // source length       dict length
        var sl = dat.length, dl = dict ? dict.length : 0;
        if (!sl || st.f && !st.l)
            return buf || new u8(0);
        var noBuf = !buf;
        // have to estimate size
        var resize = noBuf || st.i != 2;
        // no state
        var noSt = st.i;
        // Assumes roughly 33% compression ratio average
        if (noBuf)
            buf = new u8(sl * 3);
        // ensure buffer can fit at least l elements
        var cbuf = function (l) {
            var bl = buf.length;
            // need to increase size to fit
            if (l > bl) {
                // Double or set to necessary, whichever is greater
                var nbuf = new u8(Math.max(bl * 2, l));
                nbuf.set(buf);
                buf = nbuf;
            }
        };
        //  last chunk         bitpos           bytes
        var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
        // total bits
        var tbts = sl * 8;
        do {
            if (!lm) {
                // BFINAL - this is only 1 when last chunk is next
                final = bits(dat, pos, 1);
                // type: 0 = no compression, 1 = fixed huffman, 2 = dynamic huffman
                var type = bits(dat, pos + 1, 3);
                pos += 3;
                if (!type) {
                    // go to end of byte boundary
                    var s = shft(pos) + 4, l = dat[s - 4] | (dat[s - 3] << 8), t = s + l;
                    if (t > sl) {
                        if (noSt)
                            err(0);
                        break;
                    }
                    // ensure size
                    if (resize)
                        cbuf(bt + l);
                    // Copy over uncompressed data
                    buf.set(dat.subarray(s, t), bt);
                    // Get new bitpos, update byte count
                    st.b = bt += l, st.p = pos = t * 8, st.f = final;
                    continue;
                }
                else if (type == 1)
                    lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
                else if (type == 2) {
                    //  literal                            lengths
                    var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
                    var tl = hLit + bits(dat, pos + 5, 31) + 1;
                    pos += 14;
                    // length+distance tree
                    var ldt = new u8(tl);
                    // code length tree
                    var clt = new u8(19);
                    for (var i = 0; i < hcLen; ++i) {
                        // use index map to get real code
                        clt[clim[i]] = bits(dat, pos + i * 3, 7);
                    }
                    pos += hcLen * 3;
                    // code lengths bits
                    var clb = max(clt), clbmsk = (1 << clb) - 1;
                    // code lengths map
                    var clm = hMap(clt, clb, 1);
                    for (var i = 0; i < tl;) {
                        var r = clm[bits(dat, pos, clbmsk)];
                        // bits read
                        pos += r & 15;
                        // symbol
                        var s = r >> 4;
                        // code length to copy
                        if (s < 16) {
                            ldt[i++] = s;
                        }
                        else {
                            //  copy   count
                            var c = 0, n = 0;
                            if (s == 16)
                                n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
                            else if (s == 17)
                                n = 3 + bits(dat, pos, 7), pos += 3;
                            else if (s == 18)
                                n = 11 + bits(dat, pos, 127), pos += 7;
                            while (n--)
                                ldt[i++] = c;
                        }
                    }
                    //    length tree                 distance tree
                    var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
                    // max length bits
                    lbt = max(lt);
                    // max dist bits
                    dbt = max(dt);
                    lm = hMap(lt, lbt, 1);
                    dm = hMap(dt, dbt, 1);
                }
                else
                    err(1);
                if (pos > tbts) {
                    if (noSt)
                        err(0);
                    break;
                }
            }
            // Make sure the buffer can hold this + the largest possible addition
            // Maximum chunk size (practically, theoretically infinite) is 2^17
            if (resize)
                cbuf(bt + 131072);
            var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
            var lpos = pos;
            for (;; lpos = pos) {
                // bits read, code
                var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
                pos += c & 15;
                if (pos > tbts) {
                    if (noSt)
                        err(0);
                    break;
                }
                if (!c)
                    err(2);
                if (sym < 256)
                    buf[bt++] = sym;
                else if (sym == 256) {
                    lpos = pos, lm = undefined;
                    break;
                }
                else {
                    var add = sym - 254;
                    // no extra bits needed if less
                    if (sym > 264) {
                        // index
                        var i = sym - 257, b = fleb[i];
                        add = bits(dat, pos, (1 << b) - 1) + fl[i];
                        pos += b;
                    }
                    // dist
                    var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
                    if (!d)
                        err(3);
                    pos += d & 15;
                    var dt = fd[dsym];
                    if (dsym > 3) {
                        var b = fdeb[dsym];
                        dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
                    }
                    if (pos > tbts) {
                        if (noSt)
                            err(0);
                        break;
                    }
                    if (resize)
                        cbuf(bt + 131072);
                    var end = bt + add;
                    if (bt < dt) {
                        var shift = dl - dt, dend = Math.min(dt, end);
                        if (shift + bt < 0)
                            err(3);
                        for (; bt < dend; ++bt)
                            buf[bt] = dict[shift + bt];
                    }
                    for (; bt < end; ++bt)
                        buf[bt] = buf[bt - dt];
                }
            }
            st.l = lm, st.p = lpos, st.b = bt, st.f = final;
            if (lm)
                final = 1, st.m = lbt, st.d = dm, st.n = dbt;
        } while (!final);
        // don't reallocate for streams or user buffers
        return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
    };
    // starting at p, write the minimum number of bits that can hold v to d
    var wbits = function (d, p, v) {
        v <<= p & 7;
        var o = (p / 8) | 0;
        d[o] |= v;
        d[o + 1] |= v >> 8;
    };
    // starting at p, write the minimum number of bits (>8) that can hold v to d
    var wbits16 = function (d, p, v) {
        v <<= p & 7;
        var o = (p / 8) | 0;
        d[o] |= v;
        d[o + 1] |= v >> 8;
        d[o + 2] |= v >> 16;
    };
    // creates code lengths from a frequency table
    var hTree = function (d, mb) {
        // Need extra info to make a tree
        var t = [];
        for (var i = 0; i < d.length; ++i) {
            if (d[i])
                t.push({ s: i, f: d[i] });
        }
        var s = t.length;
        var t2 = t.slice();
        if (!s)
            return { t: et, l: 0 };
        if (s == 1) {
            var v = new u8(t[0].s + 1);
            v[t[0].s] = 1;
            return { t: v, l: 1 };
        }
        t.sort(function (a, b) { return a.f - b.f; });
        // after i2 reaches last ind, will be stopped
        // freq must be greater than largest possible number of symbols
        t.push({ s: -1, f: 25001 });
        var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
        t[0] = { s: -1, f: l.f + r.f, l: l, r: r };
        // efficient algorithm from UZIP.js
        // i0 is lookbehind, i2 is lookahead - after processing two low-freq
        // symbols that combined have high freq, will start processing i2 (high-freq,
        // non-composite) symbols instead
        // see https://reddit.com/r/photopea/comments/ikekht/uzipjs_questions/
        while (i1 != s - 1) {
            l = t[t[i0].f < t[i2].f ? i0++ : i2++];
            r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
            t[i1++] = { s: -1, f: l.f + r.f, l: l, r: r };
        }
        var maxSym = t2[0].s;
        for (var i = 1; i < s; ++i) {
            if (t2[i].s > maxSym)
                maxSym = t2[i].s;
        }
        // code lengths
        var tr = new u16(maxSym + 1);
        // max bits in tree
        var mbt = ln(t[i1 - 1], tr, 0);
        if (mbt > mb) {
            // more algorithms from UZIP.js
            // TODO: find out how this code works (debt)
            //  ind    debt
            var i = 0, dt = 0;
            //    left            cost
            var lft = mbt - mb, cst = 1 << lft;
            t2.sort(function (a, b) { return tr[b.s] - tr[a.s] || a.f - b.f; });
            for (; i < s; ++i) {
                var i2_1 = t2[i].s;
                if (tr[i2_1] > mb) {
                    dt += cst - (1 << (mbt - tr[i2_1]));
                    tr[i2_1] = mb;
                }
                else
                    break;
            }
            dt >>= lft;
            while (dt > 0) {
                var i2_2 = t2[i].s;
                if (tr[i2_2] < mb)
                    dt -= 1 << (mb - tr[i2_2]++ - 1);
                else
                    ++i;
            }
            for (; i >= 0 && dt; --i) {
                var i2_3 = t2[i].s;
                if (tr[i2_3] == mb) {
                    --tr[i2_3];
                    ++dt;
                }
            }
            mbt = mb;
        }
        return { t: new u8(tr), l: mbt };
    };
    // get the max length and assign length codes
    var ln = function (n, l, d) {
        return n.s == -1
            ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1))
            : (l[n.s] = d);
    };
    // length codes generation
    var lc = function (c) {
        var s = c.length;
        // Note that the semicolon was intentional
        while (s && !c[--s])
            ;
        var cl = new u16(++s);
        //  ind      num         streak
        var cli = 0, cln = c[0], cls = 1;
        var w = function (v) { cl[cli++] = v; };
        for (var i = 1; i <= s; ++i) {
            if (c[i] == cln && i != s)
                ++cls;
            else {
                if (!cln && cls > 2) {
                    for (; cls > 138; cls -= 138)
                        w(32754);
                    if (cls > 2) {
                        w(cls > 10 ? ((cls - 11) << 5) | 28690 : ((cls - 3) << 5) | 12305);
                        cls = 0;
                    }
                }
                else if (cls > 3) {
                    w(cln), --cls;
                    for (; cls > 6; cls -= 6)
                        w(8304);
                    if (cls > 2)
                        w(((cls - 3) << 5) | 8208), cls = 0;
                }
                while (cls--)
                    w(cln);
                cls = 1;
                cln = c[i];
            }
        }
        return { c: cl.subarray(0, cli), n: s };
    };
    // calculate the length of output from tree, code lengths
    var clen = function (cf, cl) {
        var l = 0;
        for (var i = 0; i < cl.length; ++i)
            l += cf[i] * cl[i];
        return l;
    };
    // writes a fixed block
    // returns the new bit pos
    var wfblk = function (out, pos, dat) {
        // no need to write 00 as type: TypedArray defaults to 0
        var s = dat.length;
        var o = shft(pos + 2);
        out[o] = s & 255;
        out[o + 1] = s >> 8;
        out[o + 2] = out[o] ^ 255;
        out[o + 3] = out[o + 1] ^ 255;
        for (var i = 0; i < s; ++i)
            out[o + i + 4] = dat[i];
        return (o + 4 + s) * 8;
    };
    // writes a block
    var wblk = function (dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
        wbits(out, p++, final);
        ++lf[256];
        var _a = hTree(lf, 15), dlt = _a.t, mlb = _a.l;
        var _b = hTree(df, 15), ddt = _b.t, mdb = _b.l;
        var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
        var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
        var lcfreq = new u16(19);
        for (var i = 0; i < lclt.length; ++i)
            ++lcfreq[lclt[i] & 31];
        for (var i = 0; i < lcdt.length; ++i)
            ++lcfreq[lcdt[i] & 31];
        var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
        var nlcc = 19;
        for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
            ;
        var flen = (bl + 5) << 3;
        var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
        var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
        if (bs >= 0 && flen <= ftlen && flen <= dtlen)
            return wfblk(out, p, dat.subarray(bs, bs + bl));
        var lm, ll, dm, dl;
        wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
        if (dtlen < ftlen) {
            lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
            var llm = hMap(lct, mlcb, 0);
            wbits(out, p, nlc - 257);
            wbits(out, p + 5, ndc - 1);
            wbits(out, p + 10, nlcc - 4);
            p += 14;
            for (var i = 0; i < nlcc; ++i)
                wbits(out, p + 3 * i, lct[clim[i]]);
            p += 3 * nlcc;
            var lcts = [lclt, lcdt];
            for (var it_1 = 0; it_1 < 2; ++it_1) {
                var clct = lcts[it_1];
                for (var i = 0; i < clct.length; ++i) {
                    var len = clct[i] & 31;
                    wbits(out, p, llm[len]), p += lct[len];
                    if (len > 15)
                        wbits(out, p, (clct[i] >> 5) & 127), p += clct[i] >> 12;
                }
            }
        }
        else {
            lm = flm, ll = flt, dm = fdm, dl = fdt;
        }
        for (var i = 0; i < li; ++i) {
            var sym = syms[i];
            if (sym > 255) {
                var len = (sym >> 18) & 31;
                wbits16(out, p, lm[len + 257]), p += ll[len + 257];
                if (len > 7)
                    wbits(out, p, (sym >> 23) & 31), p += fleb[len];
                var dst = sym & 31;
                wbits16(out, p, dm[dst]), p += dl[dst];
                if (dst > 3)
                    wbits16(out, p, (sym >> 5) & 8191), p += fdeb[dst];
            }
            else {
                wbits16(out, p, lm[sym]), p += ll[sym];
            }
        }
        wbits16(out, p, lm[256]);
        return p + ll[256];
    };
    // deflate options (nice << 13) | chain
    var deo = /*#__PURE__*/ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
    // empty
    var et = /*#__PURE__*/ new u8(0);
    // compresses data into a raw DEFLATE buffer
    var dflt = function (dat, lvl, plvl, pre, post, st) {
        var s = st.z || dat.length;
        var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7000)) + post);
        // writing to this writes to the output buffer
        var w = o.subarray(pre, o.length - post);
        var lst = st.l;
        var pos = (st.r || 0) & 7;
        if (lvl) {
            if (pos)
                w[0] = st.r >> 3;
            var opt = deo[lvl - 1];
            var n = opt >> 13, c = opt & 8191;
            var msk_1 = (1 << plvl) - 1;
            //    prev 2-byte val map    curr 2-byte val map
            var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
            var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
            var hsh = function (i) { return (dat[i] ^ (dat[i + 1] << bs1_1) ^ (dat[i + 2] << bs2_1)) & msk_1; };
            // 24576 is an arbitrary number of maximum symbols per block
            // 424 buffer for last block
            var syms = new i32(25000);
            // length/literal freq   distance freq
            var lf = new u16(288), df = new u16(32);
            //  l/lcnt  exbits  index          l/lind  waitdx          blkpos
            var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
            for (; i + 2 < s; ++i) {
                // hash value
                var hv = hsh(i);
                // index mod 32768    previous index mod
                var imod = i & 32767, pimod = head[hv];
                prev[imod] = pimod;
                head[hv] = imod;
                // We always should modify head and prev, but only add symbols if
                // this data is not yet processed ("wait" for wait index)
                if (wi <= i) {
                    // bytes remaining
                    var rem = s - i;
                    if ((lc_1 > 7000 || li > 24576) && (rem > 423 || !lst)) {
                        pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
                        li = lc_1 = eb = 0, bs = i;
                        for (var j = 0; j < 286; ++j)
                            lf[j] = 0;
                        for (var j = 0; j < 30; ++j)
                            df[j] = 0;
                    }
                    //  len    dist   chain
                    var l = 2, d = 0, ch = c, dif = imod - pimod & 32767;
                    if (rem > 2 && hv == hsh(i - dif)) {
                        var maxn = Math.min(n, rem) - 1;
                        var maxd = Math.min(32767, i);
                        // max possible length
                        // not capped at dif because decompressors implement "rolling" index population
                        var ml = Math.min(258, rem);
                        while (dif <= maxd && --ch && imod != pimod) {
                            if (dat[i + l] == dat[i + l - dif]) {
                                var nl = 0;
                                for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                                    ;
                                if (nl > l) {
                                    l = nl, d = dif;
                                    // break out early when we reach "nice" (we are satisfied enough)
                                    if (nl > maxn)
                                        break;
                                    // now, find the rarest 2-byte sequence within this
                                    // length of literals and search for that instead.
                                    // Much faster than just using the start
                                    var mmd = Math.min(dif, nl - 2);
                                    var md = 0;
                                    for (var j = 0; j < mmd; ++j) {
                                        var ti = i - dif + j & 32767;
                                        var pti = prev[ti];
                                        var cd = ti - pti & 32767;
                                        if (cd > md)
                                            md = cd, pimod = ti;
                                    }
                                }
                            }
                            // check the previous match
                            imod = pimod, pimod = prev[imod];
                            dif += imod - pimod & 32767;
                        }
                    }
                    // d will be nonzero only when a match was found
                    if (d) {
                        // store both dist and len data in one int32
                        // Make sure this is recognized as a len/dist with 28th bit (2^28)
                        syms[li++] = 268435456 | (revfl[l] << 18) | revfd[d];
                        var lin = revfl[l] & 31, din = revfd[d] & 31;
                        eb += fleb[lin] + fdeb[din];
                        ++lf[257 + lin];
                        ++df[din];
                        wi = i + l;
                        ++lc_1;
                    }
                    else {
                        syms[li++] = dat[i];
                        ++lf[dat[i]];
                    }
                }
            }
            for (i = Math.max(i, wi); i < s; ++i) {
                syms[li++] = dat[i];
                ++lf[dat[i]];
            }
            pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
            if (!lst) {
                st.r = (pos & 7) | w[(pos / 8) | 0] << 3;
                // shft(pos) now 1 less if pos & 7 != 0
                pos -= 7;
                st.h = head, st.p = prev, st.i = i, st.w = wi;
            }
        }
        else {
            for (var i = st.w || 0; i < s + lst; i += 65535) {
                // end
                var e = i + 65535;
                if (e >= s) {
                    // write final block
                    w[(pos / 8) | 0] = lst;
                    e = s;
                }
                pos = wfblk(w, pos + 1, dat.subarray(i, e));
            }
            st.i = s;
        }
        return slc(o, 0, pre + shft(pos) + post);
    };
    // Adler32
    var adler = function () {
        var a = 1, b = 0;
        return {
            p: function (d) {
                // closures have awful performance
                var n = a, m = b;
                var l = d.length | 0;
                for (var i = 0; i != l;) {
                    var e = Math.min(i + 2655, l);
                    for (; i < e; ++i)
                        m += n += d[i];
                    n = (n & 65535) + 15 * (n >> 16), m = (m & 65535) + 15 * (m >> 16);
                }
                a = n, b = m;
            },
            d: function () {
                a %= 65521, b %= 65521;
                return (a & 255) << 24 | (a & 0xFF00) << 8 | (b & 255) << 8 | (b >> 8);
            }
        };
    };
    // deflate with opts
    var dopt = function (dat, opt, pre, post, st) {
        if (!st) {
            st = { l: 1 };
            if (opt.dictionary) {
                var dict = opt.dictionary.subarray(-32768);
                var newDat = new u8(dict.length + dat.length);
                newDat.set(dict);
                newDat.set(dat, dict.length);
                dat = newDat;
                st.w = dict.length;
            }
        }
        return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? (st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20) : (12 + opt.mem), pre, post, st);
    };
    // write bytes
    var wbytes = function (d, b, v) {
        for (; v; ++b)
            d[b] = v, v >>>= 8;
    };
    // zlib header
    var zlh = function (c, o) {
        var _a, _b;
        var lv = (_a = o.level) !== null && _a !== void 0 ? _a : 0, fl = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
        c[0] = 120, c[1] = (fl << 6) | (((_b = o.dictionary) !== null && _b !== void 0 ? _b : 0) && 32);
        c[1] |= 31 - ((c[0] << 8) | c[1]) % 31;
        if (o.dictionary) {
            var h = adler();
            h.p(o.dictionary);
            wbytes(c, 2, h.d());
        }
    };
    // zlib start
    var zls = function (d, dict) {
        if ((d[0] & 15) != 8 || (d[0] >> 4) > 7 || ((d[0] << 8 | d[1]) % 31))
            err(6, 'invalid zlib data');
        if ((d[1] >> 5 & 1) == +!dict)
            err(6, 'invalid zlib data: ' + (d[1] & 32 ? 'need' : 'unexpected') + ' dictionary');
        return (d[1] >> 3 & 4) + 2;
    };
    // before you yell at me for not just using extends, my reason is that TS inheritance is hard to workerize.
    /**
     * Compress data with Zlib
     * @param data The data to compress
     * @param opts The compression options
     * @returns The zlib-compressed version of the data
     */
    function zlibSync(data, opts) {
        if (opts === void 0) { opts = {}; }
        var a = adler();
        a.p(data);
        var d = dopt(data, opts, opts.dictionary ? 6 : 2, 4);
        return zlh(d, opts), wbytes(d, d.length - 4, a.d()), d;
    }
    /**
     * Expands Zlib data
     * @param data The data to decompress
     * @param opts The decompression options
     * @returns The decompressed version of the data
     */
    function unzlibSync(data, opts) {
        if (opts === void 0) { opts = {}; }
        return inflt(data.subarray(zls(data, opts.dictionary), -4), { i: 2 }, opts && opts.out, opts && opts.dictionary);
    }

    var CRC32 = /** @class */ (function () {
        function CRC32() {
            this.caches = new Map();
        }
        CRC32.prototype.calculate = function (buff) {
            if (!(buff instanceof Uint8Array)) {
                throw new TypeError('Input must be a Uint8Array');
            }
            var caches = this.caches;
            var key = platform.decode.bytesToString(buff);
            if (caches.has(key)) {
                return caches.get(key);
            }
            var crc = CRC32.WHITE_COLOR;
            // 使用位运算优化
            for (var i = 0; i < buff.length; i++) {
                crc = (crc >>> 8) ^ CRC32.table[(crc ^ buff[i]) & 0xff];
            }
            caches.set(key, (crc ^ CRC32.WHITE_COLOR) >>> 0);
            return caches.get(key);
        };
        CRC32.prototype.clear = function () {
            this.caches.clear();
        };
        // CRC32 Table 初始化
        CRC32.table = Uint32Array.from(Array(256), function (_, i) {
            var c = i;
            for (var j = 0; j < 8; j++) {
                c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
            }
            return c >>> 0;
        });
        CRC32.WHITE_COLOR = 0xffffffff;
        return CRC32;
    }());

    // import { zlibSync } from "fflate";
    var PNGEncoder = /** @class */ (function () {
        function PNGEncoder(width, height) {
            this.width = width;
            this.height = height;
            this.crc32 = new CRC32();
            this.view = new DataView(new ArrayBuffer(4 * width * height));
        }
        PNGEncoder.prototype.createChunk = function (type, data) {
            // 长度（4字节，大端序）
            var length = new Uint8Array(4);
            new DataView(length.buffer).setUint32(0, data.length, false);
            // 块类型（4字节， ASCII）
            var chunkType = Uint8Array.from(type, function (c) { return c.charCodeAt(0); });
            // 计算 CRC32 校验（类型 + 数据）
            var partialChunk = new Uint8Array(chunkType.length + data.length);
            partialChunk.set(chunkType);
            partialChunk.set(data, chunkType.length);
            var crc = new Uint8Array(4);
            new DataView(crc.buffer).setUint32(0, this.crc32.calculate(partialChunk) >>> 0, false);
            // 汇总成完整的chunk数据
            var result = new Uint8Array(length.length + partialChunk.length + crc.length);
            result.set(length);
            result.set(partialChunk, length.length);
            result.set(crc, length.length + partialChunk.length);
            return result;
        };
        PNGEncoder.prototype.createIHDRChunk = function () {
            var ihdrData = new Uint8Array(13);
            var view = new DataView(ihdrData.buffer);
            // 宽度
            view.setUint32(0, this.width, false);
            // 高度
            view.setUint32(4, this.height, false);
            // 位深度
            view.setUint8(8, 8);
            // 颜色类型
            view.setUint8(9, 6);
            // 压缩方法
            view.setUint8(10, 0);
            // 过滤器方法
            view.setUint8(11, 0);
            // 交错方法
            view.setUint8(12, 0);
            return this.createChunk("IHDR", ihdrData);
        };
        PNGEncoder.prototype.createIDATChunk = function () {
            var _a = this, width = _a.width, height = _a.height;
            var validRowSize = width * 4;
            // 每行开头添加一位过滤头数据
            var rowSize = validRowSize + 1;
            var data = new Uint8Array(rowSize * height);
            // 将Uint32数据转换为Uint8数据
            var pixelsData = new Uint8Array(this.view.buffer);
            var startIdx;
            var srcStart;
            for (var y = 0; y < height; y++) {
                startIdx = y * rowSize;
                data[startIdx] = 0x00; // 过滤头
                // ✅ 复制预先转换好的 RGBA 数据
                srcStart = y * validRowSize; // Uint32 => 每个元素占 4 字节
                data.set(pixelsData.subarray(srcStart, srcStart + validRowSize), startIdx + 1);
            }
            // 使用 zlib 进行压缩, 平衡压缩率有利于提升文件生成速度
            return this.createChunk("IDAT", zlibSync(data));
        };
        PNGEncoder.prototype.setPixel = function (x, y, pixel) {
            this.view.setUint32((y * this.width + x) * 4, pixel, false);
        };
        PNGEncoder.prototype.write = function (pixels) {
            var _a = this, width = _a.width, height = _a.height;
            var pos;
            var r;
            var g;
            var b;
            var a;
            var pixel;
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    pos = (y * width + x) * 4;
                    r = pixels[pos];
                    g = pixels[pos + 1];
                    b = pixels[pos + 2];
                    a = pixels[pos + 3];
                    pixel = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
                    this.setPixel(x, y, pixel);
                }
            }
            return this;
        };
        PNGEncoder.prototype.flush = function () {
            // 预先创建所有块
            var iHDRChunk = this.createIHDRChunk();
            var iDATChunk = this.createIDATChunk();
            var iENDChunk = this.createChunk("IEND", new Uint8Array(0));
            // 一次性分配内存（直接计算总大小）
            var pngData = new Uint8Array(8 + iHDRChunk.length + iDATChunk.length + iENDChunk.length);
            /* ------ 按顺序写入数据 ------ */
            // 1. 写入文件头（固定 8 字节）
            var offset = 0;
            pngData.set(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), offset);
            // 2. 写入IHDR块
            offset += 8;
            pngData.set(iHDRChunk, offset);
            // 3. 写入IDAT块
            offset += iHDRChunk.length;
            pngData.set(iDATChunk, offset);
            // 4. 写入IEND块
            offset += iDATChunk.length;
            pngData.set(iENDChunk, offset);
            /* ------ 清空 CRC32 缓存 ------ */
            this.crc32.clear();
            return pngData;
        };
        return PNGEncoder;
    }());

    // ---------------------------------------------------------------------
    // qrBitBuffer
    // ---------------------------------------------------------------------
    var BitBuffer = /** @class */ (function () {
        function BitBuffer() {
            this.buffer = [];
            this.lengthInBits = 0;
        }
        BitBuffer.prototype.getAt = function (i) {
            var bufIndex = ~~(i / 8);
            return ((this.buffer[bufIndex] >>> (7 - (i % 8))) & 1) === 1;
        };
        BitBuffer.prototype.put = function (num, length) {
            for (var i = 0; i < length; i++) {
                this.putBit(((num >>> (length - i - 1)) & 1) === 1);
            }
        };
        BitBuffer.prototype.putBit = function (bit) {
            var _a = this, len = _a.lengthInBits, buffer = _a.buffer;
            var bufIndex = ~~(len / 8);
            if (buffer.length <= bufIndex) {
                buffer.push(0);
            }
            if (bit) {
                buffer[bufIndex] |= 0x80 >>> len % 8;
            }
            this.lengthInBits += 1;
        };
        return BitBuffer;
    }());

    // ---------------------------------------------------------------------
    // QRMode
    // ---------------------------------------------------------------------
    var QRMode = {
        MODE_NUMBER: 1 << 0,
        MODE_ALPHA_NUM: 1 << 1,
        MODE_8BIT_BYTE: 1 << 2,
        MODE_KANJI: 1 << 3,
    };
    // ---------------------------------------------------------------------
    // QRErrorCorrectLevel
    // ---------------------------------------------------------------------
    var QRErrorCorrectLevel = {
        L: 1,
        M: 0,
        Q: 3,
        H: 2,
    };
    // ---------------------------------------------------------------------
    // QRMaskPattern
    // ---------------------------------------------------------------------
    var QRMaskPattern = {
        PATTERN000: 0,
        PATTERN001: 1,
        PATTERN010: 2,
        PATTERN011: 3,
        PATTERN100: 4,
        PATTERN101: 5,
        PATTERN110: 6,
        PATTERN111: 7,
    };

    // ---------------------------------------------------------------------
    // qr8BitByte
    // ---------------------------------------------------------------------
    var BitByte = /** @class */ (function () {
        function BitByte(data) {
            var parsedData = [];
            // Added to support UTF-8 Characters
            for (var i = 0; i < data.length; i++) {
                var byteArray = [];
                var code = data.charCodeAt(i);
                if (code > 0x10000) {
                    byteArray[0] = 0xf0 | ((code & 0x1c0000) >>> 18);
                    byteArray[1] = 0x80 | ((code & 0x3f000) >>> 12);
                    byteArray[2] = 0x80 | ((code & 0xfc0) >>> 6);
                    byteArray[3] = 0x80 | (code & 0x3f);
                }
                else if (code > 0x800) {
                    byteArray[0] = 0xe0 | ((code & 0xf000) >>> 12);
                    byteArray[1] = 0x80 | ((code & 0xfc0) >>> 6);
                    byteArray[2] = 0x80 | (code & 0x3f);
                }
                else if (code > 0x80) {
                    byteArray[0] = 0xc0 | ((code & 0x7c0) >>> 6);
                    byteArray[1] = 0x80 | (code & 0x3f);
                }
                else {
                    byteArray[0] = code;
                }
                // Fix Unicode corruption bug
                parsedData.push(byteArray);
            }
            this.bytes = parsedData.flat(1);
            var bytes = this.bytes;
            if (bytes.length !== data.length) {
                bytes.unshift(191);
                bytes.unshift(187);
                bytes.unshift(239);
            }
        }
        Object.defineProperty(BitByte.prototype, "mode", {
            get: function () {
                return QRMode.MODE_8BIT_BYTE;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BitByte.prototype, "length", {
            get: function () {
                return this.bytes.length;
            },
            enumerable: false,
            configurable: true
        });
        BitByte.prototype.write = function (buff) {
            var bytes = this.bytes;
            for (var i = 0; i < bytes.length; i++) {
                buff.put(bytes[i], 8);
            }
        };
        return BitByte;
    }());

    // ---------------------------------------------------------------------
    // QRRSBlock
    // ---------------------------------------------------------------------
    var RS_BLOCK_TABLE = [
        [1, 26, 19],
        [1, 26, 16],
        [1, 26, 13],
        [1, 26, 9],
        [1, 44, 34],
        [1, 44, 28],
        [1, 44, 22],
        [1, 44, 16],
        [1, 70, 55],
        [1, 70, 44],
        [2, 35, 17],
        [2, 35, 13],
        [1, 100, 80],
        [2, 50, 32],
        [2, 50, 24],
        [4, 25, 9],
        [1, 134, 108],
        [2, 67, 43],
        [2, 33, 15, 2, 34, 16],
        [2, 33, 11, 2, 34, 12],
        [2, 86, 68],
        [4, 43, 27],
        [4, 43, 19],
        [4, 43, 15],
        [2, 98, 78],
        [4, 49, 31],
        [2, 32, 14, 4, 33, 15],
        [4, 39, 13, 1, 40, 14],
        [2, 121, 97],
        [2, 60, 38, 2, 61, 39],
        [4, 40, 18, 2, 41, 19],
        [4, 40, 14, 2, 41, 15],
        [2, 146, 116],
        [3, 58, 36, 2, 59, 37],
        [4, 36, 16, 4, 37, 17],
        [4, 36, 12, 4, 37, 13],
        [2, 86, 68, 2, 87, 69],
        [4, 69, 43, 1, 70, 44],
        [6, 43, 19, 2, 44, 20],
        [6, 43, 15, 2, 44, 16],
        [4, 101, 81],
        [1, 80, 50, 4, 81, 51],
        [4, 50, 22, 4, 51, 23],
        [3, 36, 12, 8, 37, 13],
        [2, 116, 92, 2, 117, 93],
        [6, 58, 36, 2, 59, 37],
        [4, 46, 20, 6, 47, 21],
        [7, 42, 14, 4, 43, 15],
        [4, 133, 107],
        [8, 59, 37, 1, 60, 38],
        [8, 44, 20, 4, 45, 21],
        [12, 33, 11, 4, 34, 12],
        [3, 145, 115, 1, 146, 116],
        [4, 64, 40, 5, 65, 41],
        [11, 36, 16, 5, 37, 17],
        [11, 36, 12, 5, 37, 13],
        [5, 109, 87, 1, 110, 88],
        [5, 65, 41, 5, 66, 42],
        [5, 54, 24, 7, 55, 25],
        [11, 36, 12],
        [5, 122, 98, 1, 123, 99],
        [7, 73, 45, 3, 74, 46],
        [15, 43, 19, 2, 44, 20],
        [3, 45, 15, 13, 46, 16],
        [1, 135, 107, 5, 136, 108],
        [10, 74, 46, 1, 75, 47],
        [1, 50, 22, 15, 51, 23],
        [2, 42, 14, 17, 43, 15],
        [5, 150, 120, 1, 151, 121],
        [9, 69, 43, 4, 70, 44],
        [17, 50, 22, 1, 51, 23],
        [2, 42, 14, 19, 43, 15],
        [3, 141, 113, 4, 142, 114],
        [3, 70, 44, 11, 71, 45],
        [17, 47, 21, 4, 48, 22],
        [9, 39, 13, 16, 40, 14],
        [3, 135, 107, 5, 136, 108],
        [3, 67, 41, 13, 68, 42],
        [15, 54, 24, 5, 55, 25],
        [15, 43, 15, 10, 44, 16],
        [4, 144, 116, 4, 145, 117],
        [17, 68, 42],
        [17, 50, 22, 6, 51, 23],
        [19, 46, 16, 6, 47, 17],
        [2, 139, 111, 7, 140, 112],
        [17, 74, 46],
        [7, 54, 24, 16, 55, 25],
        [34, 37, 13],
        [4, 151, 121, 5, 152, 122],
        [4, 75, 47, 14, 76, 48],
        [11, 54, 24, 14, 55, 25],
        [16, 45, 15, 14, 46, 16],
        [6, 147, 117, 4, 148, 118],
        [6, 73, 45, 14, 74, 46],
        [11, 54, 24, 16, 55, 25],
        [30, 46, 16, 2, 47, 17],
        [8, 132, 106, 4, 133, 107],
        [8, 75, 47, 13, 76, 48],
        [7, 54, 24, 22, 55, 25],
        [22, 45, 15, 13, 46, 16],
        [10, 142, 114, 2, 143, 115],
        [19, 74, 46, 4, 75, 47],
        [28, 50, 22, 6, 51, 23],
        [33, 46, 16, 4, 47, 17],
        [8, 152, 122, 4, 153, 123],
        [22, 73, 45, 3, 74, 46],
        [8, 53, 23, 26, 54, 24],
        [12, 45, 15, 28, 46, 16],
        [3, 147, 117, 10, 148, 118],
        [3, 73, 45, 23, 74, 46],
        [4, 54, 24, 31, 55, 25],
        [11, 45, 15, 31, 46, 16],
        [7, 146, 116, 7, 147, 117],
        [21, 73, 45, 7, 74, 46],
        [1, 53, 23, 37, 54, 24],
        [19, 45, 15, 26, 46, 16],
        [5, 145, 115, 10, 146, 116],
        [19, 75, 47, 10, 76, 48],
        [15, 54, 24, 25, 55, 25],
        [23, 45, 15, 25, 46, 16],
        [13, 145, 115, 3, 146, 116],
        [2, 74, 46, 29, 75, 47],
        [42, 54, 24, 1, 55, 25],
        [23, 45, 15, 28, 46, 16],
        [17, 145, 115],
        [10, 74, 46, 23, 75, 47],
        [10, 54, 24, 35, 55, 25],
        [19, 45, 15, 35, 46, 16],
        [17, 145, 115, 1, 146, 116],
        [14, 74, 46, 21, 75, 47],
        [29, 54, 24, 19, 55, 25],
        [11, 45, 15, 46, 46, 16],
        [13, 145, 115, 6, 146, 116],
        [14, 74, 46, 23, 75, 47],
        [44, 54, 24, 7, 55, 25],
        [59, 46, 16, 1, 47, 17],
        [12, 151, 121, 7, 152, 122],
        [12, 75, 47, 26, 76, 48],
        [39, 54, 24, 14, 55, 25],
        [22, 45, 15, 41, 46, 16],
        [6, 151, 121, 14, 152, 122],
        [6, 75, 47, 34, 76, 48],
        [46, 54, 24, 10, 55, 25],
        [2, 45, 15, 64, 46, 16],
        [17, 152, 122, 4, 153, 123],
        [29, 74, 46, 14, 75, 47],
        [49, 54, 24, 10, 55, 25],
        [24, 45, 15, 46, 46, 16],
        [4, 152, 122, 18, 153, 123],
        [13, 74, 46, 32, 75, 47],
        [48, 54, 24, 14, 55, 25],
        [42, 45, 15, 32, 46, 16],
        [20, 147, 117, 4, 148, 118],
        [40, 75, 47, 7, 76, 48],
        [43, 54, 24, 22, 55, 25],
        [10, 45, 15, 67, 46, 16],
        [19, 148, 118, 6, 149, 119],
        [18, 75, 47, 31, 76, 48],
        [34, 54, 24, 34, 55, 25],
        [20, 45, 15, 61, 46, 16],
    ];
    var RSBlock = /** @class */ (function () {
        function RSBlock() {
        }
        RSBlock.prototype.getRSBlockTable = function (typeNumber, errorCorrectLevel) {
            var L = QRErrorCorrectLevel.L, M = QRErrorCorrectLevel.M, Q = QRErrorCorrectLevel.Q, H = QRErrorCorrectLevel.H;
            var pos = (typeNumber - 1) * 4;
            switch (errorCorrectLevel) {
                case L:
                    return RS_BLOCK_TABLE[pos + 0];
                case M:
                    return RS_BLOCK_TABLE[pos + 1];
                case Q:
                    return RS_BLOCK_TABLE[pos + 2];
                case H:
                    return RS_BLOCK_TABLE[pos + 3];
                default:
                    throw new Error("bad rs block @ typeNumber:".concat(typeNumber, "/errorCorrectLevel: ").concat(errorCorrectLevel));
            }
        };
        RSBlock.prototype.getRSBlocks = function (typeNumber, errorCorrectLevel) {
            var rsBlock = this.getRSBlockTable(typeNumber, errorCorrectLevel);
            var length = rsBlock.length / 3;
            var list = [];
            for (var i = 0; i < length; i++) {
                var count = rsBlock[i * 3];
                var totalCount = rsBlock[i * 3 + 1];
                var dataCount = rsBlock[i * 3 + 2];
                for (var j = 0; j < count; j++) {
                    list.push({ totalCount: totalCount, dataCount: dataCount });
                }
            }
            return list;
        };
        return RSBlock;
    }());

    // ---------------------------------------------------------------------
    // QRMath
    // ---------------------------------------------------------------------
    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);
    // initialize tables
    for (var i = 0; i < 8; i++) {
        EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i++) {
        EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i++) {
        LOG_TABLE[EXP_TABLE[i]] = i;
    }
    var QRMath = {
        glog: function (n) {
            if (n < 1) {
                throw new Error("glog(".concat(n, ")"));
            }
            return LOG_TABLE[n];
        },
        gexp: function (n) {
            if (n < 0) {
                n = 255 + (n % 255);
            }
            else if (n > 255) {
                n %= 255;
            }
            return EXP_TABLE[n];
        }
    };

    // ---------------------------------------------------------------------
    // Polynomial
    // ---------------------------------------------------------------------
    var Polynomial = /** @class */ (function () {
        function Polynomial(num, shift) {
            var length = num.length;
            if (length === undefined) {
                throw new Error("".concat(length, "/").concat(shift));
            }
            var offset = 0;
            while (offset < length && num[offset] === 0) {
                offset++;
            }
            var len = length - offset;
            this.num = new Array(len + shift);
            for (var i = 0; i < len; i++) {
                this.num[i] = num[i + offset];
            }
        }
        Object.defineProperty(Polynomial.prototype, "length", {
            get: function () {
                return this.num.length;
            },
            enumerable: false,
            configurable: true
        });
        Polynomial.prototype.getAt = function (i) {
            return this.num[i];
        };
        Polynomial.prototype.multiply = function (e) {
            var glog = QRMath.glog, gexp = QRMath.gexp;
            var num = [];
            for (var i = 0; i < this.length; i++) {
                for (var j = 0; j < e.length; j++) {
                    num[i + j] ^= gexp(glog(this.getAt(i)) + glog(e.getAt(j)));
                }
            }
            return new Polynomial(num, 0);
        };
        Polynomial.prototype.mod = function (e) {
            if (this.length - e.length < 0) {
                return this;
            }
            var glog = QRMath.glog, gexp = QRMath.gexp;
            var ratio = glog(this.getAt(0)) - glog(e.getAt(0));
            var num = [];
            for (var i = 0; i < this.length; i++) {
                var n = this.getAt(i);
                num[i] = i < e.length ? n ^ gexp(glog(e.getAt(i)) + ratio) : n;
            }
            // recursive call
            return new Polynomial(num, 0).mod(e);
        };
        return Polynomial;
    }());

    var PATTERN_POSITION_TABLE = [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170],
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) |
        (1 << 11) |
        (1 << 10) |
        (1 << 9) |
        (1 << 8) |
        (1 << 5) |
        (1 << 2) |
        (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
    var genBCHDigit = function (data) { return data === 0 ? 0 : Math.log2(data); };
    var BCH_G15 = genBCHDigit(G15);
    var BCH_G18 = genBCHDigit(G18);
    // ---------------------------------------------------------------------
    // QRUtil
    // ---------------------------------------------------------------------
    var Util = {
        getBCHTypeInfo: function (data) {
            var d = data << 10;
            while (genBCHDigit(d) - BCH_G15 >= 0) {
                d ^= G15 << (genBCHDigit(d) - BCH_G15);
            }
            return ((data << 10) | d) ^ G15_MASK;
        },
        getBCHTypeNumber: function (data) {
            var d = data << 12;
            while (genBCHDigit(d) - BCH_G18 >= 0) {
                d ^= G18 << (genBCHDigit(d) - BCH_G18);
            }
            return (data << 12) | d;
        },
        getPatternPosition: function (typeNumber) {
            return PATTERN_POSITION_TABLE[typeNumber - 1];
        },
        getMaskFunction: function (maskPattern) {
            var PATTERN000 = QRMaskPattern.PATTERN000, PATTERN001 = QRMaskPattern.PATTERN001, PATTERN010 = QRMaskPattern.PATTERN010, PATTERN011 = QRMaskPattern.PATTERN011, PATTERN100 = QRMaskPattern.PATTERN100, PATTERN101 = QRMaskPattern.PATTERN101, PATTERN110 = QRMaskPattern.PATTERN110, PATTERN111 = QRMaskPattern.PATTERN111;
            switch (maskPattern) {
                case PATTERN000:
                    return function (i, j) { return (i + j) % 2 === 0; };
                case PATTERN001:
                    return function (i) { return i % 2 === 0; };
                case PATTERN010:
                    return function (_i, j) { return j % 3 === 0; };
                case PATTERN011:
                    return function (i, j) { return (i + j) % 3 === 0; };
                case PATTERN100:
                    return function (i, j) { return (~~(i / 2) + ~~(j / 3)) % 2 === 0; };
                case PATTERN101:
                    return function (i, j) { return ((i * j) % 2) + ((i * j) % 3) === 0; };
                case PATTERN110:
                    return function (i, j) {
                        return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
                    };
                case PATTERN111:
                    return function (i, j) {
                        return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
                    };
                default:
                    throw new Error("bad maskPattern: ".concat(maskPattern));
            }
        },
        getErrorCorrectPolynomial: function (errorCorrectLength) {
            var a = new Polynomial([1], 0);
            for (var i = 0; i < errorCorrectLength; i++) {
                a = a.multiply(new Polynomial([1, QRMath.gexp(i)], 0));
            }
            return a;
        },
        getLengthInBits: function (mode, type) {
            var MODE_NUMBER = QRMode.MODE_NUMBER, MODE_ALPHA_NUM = QRMode.MODE_ALPHA_NUM, MODE_8BIT_BYTE = QRMode.MODE_8BIT_BYTE, MODE_KANJI = QRMode.MODE_KANJI;
            if (type < 1 || type > 40) {
                throw new Error("type: ".concat(type));
            }
            if (type >= 1 && type < 10) {
                // 1 - 9
                switch (mode) {
                    case MODE_NUMBER:
                        return 10;
                    case MODE_ALPHA_NUM:
                        return 9;
                    case MODE_8BIT_BYTE:
                        return 8;
                    case MODE_KANJI:
                        return 8;
                }
            }
            if (type < 27) {
                // 10 - 26
                switch (mode) {
                    case MODE_NUMBER:
                        return 12;
                    case MODE_ALPHA_NUM:
                        return 11;
                    case MODE_8BIT_BYTE:
                        return 16;
                    case MODE_KANJI:
                        return 10;
                }
            }
            if (type <= 40) {
                // 27 - 40
                switch (mode) {
                    case MODE_NUMBER:
                        return 14;
                    case MODE_ALPHA_NUM:
                        return 13;
                    case MODE_8BIT_BYTE:
                        return 16;
                    case MODE_KANJI:
                        return 12;
                }
            }
            throw new Error("mode: ".concat(mode));
        },
        getLostPoint: function (qr) {
            var moduleCount = qr.getModuleCount();
            var lostPoint = 0;
            // LEVEL1
            for (var row = 0; row < moduleCount; row++) {
                for (var col = 0; col < moduleCount; col++) {
                    var dark = qr.isDark(row, col);
                    var sameCount = 0;
                    for (var r = -1; r <= 1; r++) {
                        var nRow = row + r;
                        if (nRow < 0 || moduleCount <= nRow)
                            continue;
                        for (var c = -1; c <= 1; c++) {
                            var nCol = col + c;
                            if (nCol < 0 || moduleCount <= nCol)
                                continue;
                            if (r === 0 && c === 0)
                                continue;
                            if (dark === qr.isDark(nRow, nCol)) {
                                sameCount++;
                            }
                        }
                    }
                    if (sameCount > 5) {
                        lostPoint += sameCount + 3 - 5;
                    }
                }
            }
            // LEVEL2
            for (var row = 0; row < moduleCount - 1; row++) {
                for (var col = 0; col < moduleCount - 1; col++) {
                    var count = 0;
                    if (qr.isDark(row, col))
                        count++;
                    if (qr.isDark(row + 1, col))
                        count++;
                    if (qr.isDark(row, col + 1))
                        count++;
                    if (qr.isDark(row + 1, col + 1))
                        count++;
                    if (count === 0 || count === 4) {
                        lostPoint += 3;
                    }
                }
            }
            // LEVEL3
            for (var row = 0; row < moduleCount; row++) {
                for (var col = 0; col < moduleCount - 6; col++) {
                    if (qr.isDark(row, col) &&
                        !qr.isDark(row, col + 1) &&
                        qr.isDark(row, col + 2) &&
                        qr.isDark(row, col + 3) &&
                        qr.isDark(row, col + 4) &&
                        !qr.isDark(row, col + 5) &&
                        qr.isDark(row, col + 6)) {
                        lostPoint += 40;
                    }
                }
            }
            for (var col = 0; col < moduleCount; col++) {
                for (var row = 0; row < moduleCount - 6; row++) {
                    if (qr.isDark(row, col) &&
                        !qr.isDark(row + 1, col) &&
                        qr.isDark(row + 2, col) &&
                        qr.isDark(row + 3, col) &&
                        qr.isDark(row + 4, col) &&
                        !qr.isDark(row + 5, col) &&
                        qr.isDark(row + 6, col)) {
                        lostPoint += 40;
                    }
                }
            }
            // LEVEL4
            var darkCount = 0;
            for (var col = 0; col < moduleCount; col++) {
                for (var row = 0; row < moduleCount; row++) {
                    if (qr.isDark(row, col)) {
                        darkCount++;
                    }
                }
            }
            var ratio = Math.abs((100 * darkCount) / Math.pow(moduleCount, 2) - 50) / 5;
            return lostPoint + ratio * 10;
        },
    };

    // ---------------------------------------------------------------------
    //
    // QR Code Generator for JavaScript
    //
    // Copyright (c) 2025 LiHZSky
    //
    // URL: http://www.d-project.com/
    //
    // Licensed under the MIT license:
    // http://www.opensource.org/licenses/mit-license.php
    //
    // The word 'QR Code' is registered trademark of
    // DENSO WAVE INCORPORATED
    //
    // ---------------------------------------------------------------------
    var PAD0 = 0xec;
    var PAD1 = 0x11;
    /**
     * QRCode实现
     * https://www.cnblogs.com/leestar54/p/15782929.html
     * @param typeNumber 1 to 40
     * @param errorCorrectLevel 'L','M','Q','H'
     */
    var QRCode = /** @class */ (function () {
        function QRCode(typeNumber, errorCorrectLevel) {
            this.typeNumber = typeNumber;
            this.modules = [];
            this.moduleCount = 0;
            this.dataCache = null;
            this.dataList = [];
            this.errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
        }
        QRCode.prototype.makeImpl = function (test, maskPattern) {
            this.moduleCount = this.typeNumber * 4 + 17;
            this.modules = (function (moduleCount) {
                var modules = [];
                // 预设一个 moduleCount * moduleCount 的空白矩阵
                for (var row = 0; row < moduleCount; row++) {
                    modules[row] = [];
                    for (var col = 0; col < moduleCount; col++) {
                        modules[row][col] = null;
                    }
                }
                return modules;
            })(this.moduleCount);
            var count = this.moduleCount - 7;
            this.setupPositionProbePattern(0, 0);
            this.setupPositionProbePattern(count, 0);
            this.setupPositionProbePattern(0, count);
            this.setupPositionAdjustPattern();
            this.setupTimingPattern();
            this.setupTypeInfo(test, maskPattern);
            if (this.typeNumber >= 7) {
                this.setupTypeNumber(test);
            }
            if (this.dataCache === null) {
                this.dataCache = this.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
            }
            this.mapData(this.dataCache, maskPattern);
        };
        QRCode.prototype.setupPositionProbePattern = function (row, col) {
            var _a = this, modules = _a.modules, moduleCount = _a.moduleCount;
            for (var r = -1; r <= 7; r++) {
                var nr = row + r;
                if (nr <= -1 || moduleCount <= nr)
                    continue;
                for (var c = -1; c <= 7; c++) {
                    var nc = col + c;
                    if (nc <= -1 || moduleCount <= nc)
                        continue;
                    modules[nr][nc] =
                        (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                            (r >= 2 && r <= 4 && c >= 2 && c <= 4);
                }
            }
        };
        QRCode.prototype.setupPositionAdjustPattern = function () {
            var _a = this, typeNumber = _a.typeNumber, modules = _a.modules;
            var pos = Util.getPatternPosition(typeNumber);
            var length = pos.length;
            for (var i = 0; i < length; i++) {
                for (var j = 0; j < length; j++) {
                    var row = pos[i];
                    var col = pos[j];
                    if (modules[row][col] != null)
                        continue;
                    for (var r = -2; r <= 2; r++) {
                        for (var c = -2; c <= 2; c++) {
                            modules[row + r][col + c] =
                                r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0);
                        }
                    }
                }
            }
        };
        QRCode.prototype.setupTimingPattern = function () {
            var _a = this, moduleCount = _a.moduleCount, modules = _a.modules;
            var count = moduleCount - 8;
            for (var r = 8; r < count; r++) {
                if (modules[r][6] != null)
                    continue;
                modules[r][6] = r % 2 === 0;
            }
            for (var c = 8; c < count; c++) {
                if (modules[6][c] != null)
                    continue;
                modules[6][c] = c % 2 === 0;
            }
        };
        QRCode.prototype.setupTypeInfo = function (test, maskPattern) {
            var _a = this, errorCorrectLevel = _a.errorCorrectLevel, modules = _a.modules, moduleCount = _a.moduleCount;
            var data = (errorCorrectLevel << 3) | maskPattern;
            var bits = Util.getBCHTypeInfo(data);
            // vertical
            for (var i = 0; i < 15; i++) {
                var mod = !test && ((bits >> i) & 1) === 1;
                if (i < 6) {
                    modules[i][8] = mod;
                }
                else if (i < 8) {
                    modules[i + 1][8] = mod;
                }
                else {
                    modules[moduleCount - 15 + i][8] = mod;
                }
            }
            // horizontal
            for (var i = 0; i < 15; i++) {
                var mod = !test && ((bits >> i) & 1) === 1;
                if (i < 8) {
                    modules[8][moduleCount - i - 1] = mod;
                }
                else if (i < 9) {
                    modules[8][15 - i] = mod;
                }
                else {
                    modules[8][15 - i - 1] = mod;
                }
            }
            // fixed module
            modules[moduleCount - 8][8] = !test;
        };
        QRCode.prototype.getBestMaskPattern = function () {
            var minLostPoint = 0;
            var pattern = 0;
            for (var i = 0; i < 8; i++) {
                this.makeImpl(true, i);
                var lostPoint = Util.getLostPoint(this);
                if (i === 0 || minLostPoint > lostPoint) {
                    minLostPoint = lostPoint;
                    pattern = i;
                }
            }
            return pattern;
        };
        QRCode.prototype.setupTypeNumber = function (test) {
            var _a = this, typeNumber = _a.typeNumber, modules = _a.modules, moduleCount = _a.moduleCount;
            var bits = Util.getBCHTypeNumber(typeNumber);
            for (var i = 0; i < 18; i++) {
                var mod = !test && ((bits >> i) & 1) === 1;
                modules[~~(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod;
                modules[(i % 3) + moduleCount - 8 - 3][~~(i / 3)] = mod;
            }
        };
        QRCode.prototype.createData = function (typeNumber, errorCorrectLevel, dataList) {
            var rsBlocks = new RSBlock().getRSBlocks(typeNumber, errorCorrectLevel);
            var buffer = new BitBuffer();
            for (var i = 0; i < dataList.length; i++) {
                var data = dataList[i];
                buffer.put(data.mode, 4);
                buffer.put(data.length, Util.getLengthInBits(data.mode, typeNumber));
                data.write(buffer);
            }
            // calc num max data.
            var totalDataCount = 0;
            for (var i = 0; i < rsBlocks.length; i++) {
                totalDataCount += rsBlocks[i].dataCount;
            }
            var totalCount = totalDataCount * 8;
            if (buffer.lengthInBits > totalCount) {
                throw new Error("code length overflow. (".concat(buffer.lengthInBits, " > ").concat(totalCount, ")"));
            }
            // end code
            if (buffer.lengthInBits + 4 <= totalCount) {
                buffer.put(0, 4);
            }
            // padding
            while (buffer.lengthInBits % 8 !== 0) {
                buffer.putBit(false);
            }
            // padding
            while (true) {
                if (buffer.lengthInBits >= totalCount) {
                    break;
                }
                buffer.put(PAD0, 8);
                if (buffer.lengthInBits >= totalCount) {
                    break;
                }
                buffer.put(PAD1, 8);
            }
            return this.createBytes(buffer, rsBlocks);
        };
        QRCode.prototype.mapData = function (data, maskPattern) {
            var _a = this, modules = _a.modules, moduleCount = _a.moduleCount;
            var maskFunc = Util.getMaskFunction(maskPattern);
            var inc = -1;
            var row = moduleCount - 1;
            var bitIndex = 7;
            var byteIndex = 0;
            for (var col = row; col > 0; col -= 2) {
                if (col === 6)
                    col -= 1;
                while (true) {
                    for (var c = 0; c < 2; c++) {
                        if (modules[row][col - c] == null) {
                            var dark = false;
                            if (byteIndex < data.length) {
                                dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
                            }
                            if (maskFunc(row, col - c)) {
                                dark = !dark;
                            }
                            modules[row][col - c] = dark;
                            bitIndex--;
                            if (bitIndex === -1) {
                                byteIndex++;
                                bitIndex = 7;
                            }
                        }
                    }
                    row += inc;
                    if (row < 0 || moduleCount <= row) {
                        row -= inc;
                        inc = -inc;
                        break;
                    }
                }
            }
        };
        QRCode.prototype.createBytes = function (bitBuffer, rsBlocks) {
            var dcdata = [];
            var ecdata = [];
            var offset = 0;
            var maxDcCount = 0;
            var maxEcCount = 0;
            for (var r = 0; r < rsBlocks.length; r++) {
                var dcCount = rsBlocks[r].dataCount;
                var ecCount = rsBlocks[r].totalCount - dcCount;
                maxDcCount = Math.max(maxDcCount, dcCount);
                maxEcCount = Math.max(maxEcCount, ecCount);
                dcdata[r] = [];
                for (var i = 0; i < dcCount; i++) {
                    dcdata[r][i] = 0xff & bitBuffer.buffer[i + offset];
                }
                offset += dcCount;
                var rsPoly = Util.getErrorCorrectPolynomial(ecCount);
                var rawPoly = new Polynomial(dcdata[r], rsPoly.length - 1);
                var modPoly = rawPoly.mod(rsPoly);
                ecdata[r] = new Array(rsPoly.length - 1);
                for (var i = 0; i < ecdata[r].length; i++) {
                    var modIndex = i + modPoly.length - ecdata[r].length;
                    ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
                }
            }
            var totalCodeCount = 0;
            for (var i = 0; i < rsBlocks.length; i++) {
                totalCodeCount += rsBlocks[i].totalCount;
            }
            var data = new Array(totalCodeCount);
            var index = 0;
            for (var i = 0; i < maxDcCount; i++) {
                for (var r = 0; r < rsBlocks.length; r++) {
                    if (i < dcdata[r].length) {
                        data[index++] = dcdata[r][i];
                    }
                }
            }
            for (var i = 0; i < maxEcCount; i++) {
                for (var r = 0; r < rsBlocks.length; r++) {
                    if (i < ecdata[r].length) {
                        data[index++] = ecdata[r][i];
                    }
                }
            }
            return data;
        };
        QRCode.prototype.isDark = function (row, col) {
            var moduleCount = this.moduleCount;
            if (row < 0 || moduleCount <= row || col < 0 || moduleCount <= col) {
                throw new Error("".concat(row, ", ").concat(col));
            }
            return this.modules[row][col];
        };
        QRCode.prototype.addData = function (data) {
            this.dataList.push(new BitByte(data));
            this.dataCache = null;
        };
        QRCode.prototype.getModuleCount = function () {
            return this.moduleCount;
        };
        QRCode.prototype.make = function () {
            this.makeImpl(false, this.getBestMaskPattern());
        };
        return QRCode;
    }());

    /**
     * SVGA 下载解析器
     */
    var Parser = /** @class */ (function () {
        function Parser() {
        }
        /**
         * 解压视频源文件
         * @param data
         * @returns
         */
        Parser.decompress = function (data) {
            return unzlibSync(new Uint8Array(data)).buffer;
        };
        /**
         * 解析视频实体
         * @param data 视频二进制数据
         * @param url 视频地址
         * @param needDecompress 是否解压
         * @returns
         */
        Parser.parseVideo = function (data, url, needDecompress) {
            if (needDecompress === void 0) { needDecompress = true; }
            return createVideoEntity(new Uint8Array(needDecompress ? this.decompress(data) : data), platform.path.filename(url));
        };
        /**
         * 读取文件资源
         * @param url 文件资源地址
         * @returns
         */
        Parser.download = function (url) {
            return __awaiter(this, void 0, void 0, function () {
                var globals, remote, path, local, env, supportLocal, filepath, buff, ex_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            globals = platform.globals, remote = platform.remote, path = platform.path, local = platform.local;
                            env = globals.env;
                            supportLocal = env !== "h5" && env !== "tt";
                            filepath = path.is(url)
                                ? url
                                : path.resolve(path.filename(url));
                            if (!supportLocal) return [3 /*break*/, 2];
                            return [4 /*yield*/, local.exists(filepath)];
                        case 1:
                            if (_a.sent()) {
                                return [2 /*return*/, local.read(filepath)];
                            }
                            _a.label = 2;
                        case 2: return [4 /*yield*/, remote.fetch(url)];
                        case 3:
                            buff = _a.sent();
                            if (!supportLocal) return [3 /*break*/, 7];
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, local.write(buff, filepath)];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            ex_1 = _a.sent();
                            // eslint-disable-next-line no-console
                            console.error(ex_1);
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/, buff];
                    }
                });
            });
        };
        /**
         * 通过 url 下载并解析 SVGA 文件
         * @param url SVGA 文件的下载链接
         * @returns Promise<SVGA 数据源
         */
        Parser.load = function (url) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _b = (_a = Parser).parseVideo;
                            return [4 /*yield*/, Parser.download(url)];
                        case 1: return [2 /*return*/, _b.apply(_a, [(_c.sent()), url])];
                    }
                });
            });
        };
        return Parser;
    }());

    var noop = platform.noop;
    var Painter = /** @class */ (function () {
        /**
         *
         * @param mode
         *  - poster: 海报模式
         *  - animation: 动画模式
         *  - 默认为 animation
         * @param W 海报模式必须传入
         * @param H 海报模式必须传入
         */
        function Painter(mode, width, height) {
            if (mode === void 0) { mode = "animation"; }
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            this.mode = mode;
            /**
             * 主屏的 Canvas 元素
             * Main Screen
             */
            this.X = null;
            /**
             * 主屏的 Context 对象
             * Main Context
             */
            this.XC = null;
            /**
             * 副屏的 Canvas 元素
             * Secondary Screen
             */
            this.Y = null;
            /**
             * 副屏的 Context 对象
             * Secondary Context
             */
            this.YC = null;
            /**
             * 粉刷模式
             */
            this.model = {};
            this.clearContainer = noop;
            this.clearSecondary = noop;
            var dpr = platform.globals.dpr;
            this.W = width * dpr;
            this.H = height * dpr;
        }
        Painter.prototype.setModel = function (type) {
            var model = this.model;
            var env = platform.globals.env;
            // set type
            model.type = type;
            // set clear
            if (type === "O" &&
                // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
                env === "h5" &&
                navigator.userAgent.includes("Firefox")) {
                model.clear = "CR";
            }
            else if ((type === "O" && env === "tt") || env === "alipay") {
                model.clear = "CL";
            }
            else {
                model.clear = "RE";
            }
        };
        /**
         * 注册画笔，根据环境判断生成最优的绘制方式
         * @param selector
         * @param ofsSelector
         * @param component
         */
        Painter.prototype.register = function (selector, ofsSelector, component) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, model, mode, getCanvas, getOfsCanvas, env, _b, W, H, _c, canvas, context, _d, canvas, context, width, height, ofsResult;
                var _this = this;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _a = this, model = _a.model, mode = _a.mode;
                            getCanvas = platform.getCanvas, getOfsCanvas = platform.getOfsCanvas;
                            env = platform.globals.env;
                            if (!(mode === "poster" &&
                                (env !== "h5" || "OffscreenCanvas" in globalThis))) return [3 /*break*/, 1];
                            _b = this, W = _b.W, H = _b.H;
                            if (!(W > 0 && H > 0)) {
                                throw new Error("Poster mode must set width and height when create Brush instance");
                            }
                            _c = getOfsCanvas({ width: W, height: H }), canvas = _c.canvas, context = _c.context;
                            this.X = canvas;
                            this.XC = context;
                            this.setModel("O");
                            return [3 /*break*/, 3];
                        case 1: return [4 /*yield*/, getCanvas(selector, component)];
                        case 2:
                            _d = _e.sent(), canvas = _d.canvas, context = _d.context;
                            width = canvas.width, height = canvas.height;
                            // 添加主屏
                            this.X = canvas;
                            this.XC = context;
                            if (mode === "poster") {
                                canvas.width = width;
                                canvas.height = height;
                                this.setModel("C");
                            }
                            else {
                                this.W = width;
                                this.H = height;
                            }
                            _e.label = 3;
                        case 3:
                            if (!(mode === "poster")) return [3 /*break*/, 4];
                            this.Y = this.X;
                            this.YC = this.XC;
                            return [3 /*break*/, 8];
                        case 4:
                            ofsResult = void 0;
                            if (!(typeof ofsSelector === "string" && ofsSelector !== "")) return [3 /*break*/, 6];
                            return [4 /*yield*/, getCanvas(ofsSelector, component)];
                        case 5:
                            ofsResult = _e.sent();
                            ofsResult.canvas.width = this.W;
                            ofsResult.canvas.height = this.H;
                            this.setModel("C");
                            return [3 /*break*/, 7];
                        case 6:
                            ofsResult = getOfsCanvas({ width: this.W, height: this.H });
                            this.setModel("O");
                            _e.label = 7;
                        case 7:
                            this.Y = ofsResult.canvas;
                            this.YC = ofsResult.context;
                            _e.label = 8;
                        case 8:
                            // #endregion set secondary screen implement
                            // #region clear main screen implement
                            // ------- 生成主屏清理函数 -------
                            // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布
                            if (model.clear === "CL") {
                                this.clearContainer = function () {
                                    var _a = _this, W = _a.W, H = _a.H;
                                    _this.XC.clearRect(0, 0, W, H);
                                };
                            }
                            else {
                                this.clearContainer = function () {
                                    var _a = _this, W = _a.W, H = _a.H;
                                    _this.X.width = W;
                                    _this.X.height = H;
                                };
                            }
                            // #endregion clear main screen implement
                            if (mode === "poster") {
                                this.clearSecondary = this.stick = noop;
                            }
                            else {
                                // #region clear secondary screen implement
                                // ------- 生成副屏清理函数 --------
                                switch (model.clear) {
                                    case "CR":
                                        this.clearSecondary = function () {
                                            var _a = _this, W = _a.W, H = _a.H;
                                            // FIXME:【支付宝小程序】频繁创建新的 OffscreenCanvas 会出现崩溃现象
                                            var _b = getOfsCanvas({ width: W, height: H }), canvas = _b.canvas, context = _b.context;
                                            _this.Y = canvas;
                                            _this.YC = context;
                                        };
                                        break;
                                    case "CL":
                                        this.clearSecondary = function () {
                                            var _a = _this, W = _a.W, H = _a.H;
                                            // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布，无论是Canvas还是OffscreenCanvas
                                            _this.YC.clearRect(0, 0, W, H);
                                        };
                                        break;
                                    default:
                                        this.clearSecondary = function () {
                                            var _a = _this, W = _a.W, H = _a.H, Y = _a.Y;
                                            Y.width = W;
                                            Y.height = H;
                                        };
                                }
                                // #endregion clear secondary screen implement
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        Painter.prototype.stick = function () {
            var _a = this, W = _a.W, H = _a.H, mode = _a.mode;
            if (mode !== "poster") {
                this.XC.drawImage(this.YC.canvas, 0, 0, W, H);
            }
        };
        /**
         * 销毁画笔
         */
        Painter.prototype.destroy = function () {
            this.clearContainer();
            this.clearSecondary();
            this.X = this.XC = this.Y = this.YC = null;
            this.clearContainer = this.clearSecondary = this.stick = noop;
        };
        return Painter;
    }());

    var Config = /** @class */ (function () {
        function Config() {
            /**
             * 最后停留的目标模式，类似于 animation-fill-mode，默认值 forwards。
             */
            this.fillMode = "backwards" /* PLAYER_FILL_MODE.BACKWARDS */;
            /**
             * 播放模式，默认值 forwards
             */
            this.playMode = "forwards" /* PLAYER_PLAY_MODE.FORWARDS */;
            /**
             * 填充模式，类似于 content-mode。
             */
            this.contentMode = "fill" /* PLAYER_CONTENT_MODE.FILL */;
            /**
             * 开始播放的帧，默认值 0
             */
            this.startFrame = 0;
            /**
             * 结束播放的帧，默认值 0
             */
            this.endFrame = 0;
            /**
             * 循环播放的开始帧，默认值 0
             */
            this.loopStartFrame = 0;
            /**
             * 循环次数，默认值 0（无限循环）
             */
            this.loop = 0;
        }
        /**
         * 是否开启动画容器视窗检测，默认值 false
         * 开启后利用 Intersection Observer API 检测动画容器是否处于视窗内，若处于视窗外，停止描绘渲染帧避免造成资源消耗
         */
        // public isUseIntersectionObserver = false;
        Config.prototype.register = function (config) {
            if (typeof config.loop === "number" && config.loop >= 0) {
                this.loop = config.loop;
            }
            if (config.fillMode &&
                [
                    "forwards" /* PLAYER_FILL_MODE.FORWARDS */,
                    "backwards" /* PLAYER_FILL_MODE.BACKWARDS */,
                    "none" /* PLAYER_FILL_MODE.NONE */,
                ].includes(config.fillMode)) {
                this.fillMode = config.fillMode;
            }
            if (config.playMode &&
                ["forwards" /* PLAYER_PLAY_MODE.FORWARDS */, "fallbacks" /* PLAYER_PLAY_MODE.FALLBACKS */].includes(config.playMode)) {
                this.playMode = config.playMode;
            }
            if (typeof config.startFrame === "number" && config.startFrame >= 0) {
                this.startFrame = config.startFrame;
            }
            if (typeof config.endFrame === "number" && config.endFrame >= 0) {
                this.endFrame = config.endFrame;
            }
            if (typeof config.loopStartFrame === "number" &&
                config.loopStartFrame >= 0) {
                this.loopStartFrame = config.loopStartFrame;
            }
            if (typeof config.contentMode === "string") {
                this.contentMode = config.contentMode;
            }
            // if (typeof config.isUseIntersectionObserver === 'boolean') {
            //   this.isUseIntersectionObserver = config.isUseIntersectionObserver
            // }
        };
        Config.prototype.setItem = function (key, value) {
            var _a;
            this.register((_a = {}, _a[key] = value, _a));
        };
        Config.prototype.getConfig = function (entity) {
            var _a = this, playMode = _a.playMode, loopStartFrame = _a.loopStartFrame, startFrame = _a.startFrame, endFrame = _a.endFrame, fillMode = _a.fillMode, loop = _a.loop;
            var fps = entity.fps, sprites = entity.sprites;
            var frames = entity.frames;
            var spriteCount = sprites.length;
            var start = startFrame > 0 ? startFrame : 0;
            var end = endFrame > 0 && endFrame < frames ? endFrame : frames;
            // 每帧持续的时间
            var frameDuration = 1000 / fps;
            if (start > end) {
                throw new Error("StartFrame should greater than EndFrame");
            }
            // 更新活动帧总数
            if (end < frames) {
                frames = end - start;
            }
            else if (start > 0) {
                frames -= start;
            }
            var duration = Math.floor(frames * frameDuration * Math.pow(10, 6)) / Math.pow(10, 6);
            var currFrame = 0;
            var extFrame = 0;
            var loopStart;
            // 顺序播放/倒叙播放
            if (playMode === "forwards" /* PLAYER_PLAY_MODE.FORWARDS */) {
                // 重置为开始帧
                currFrame = Math.max(loopStartFrame, startFrame);
                if (fillMode === "forwards" /* PLAYER_FILL_MODE.FORWARDS */) {
                    extFrame = 1;
                }
                loopStart =
                    loopStartFrame > start ? (loopStartFrame - start) * frameDuration : 0;
            }
            else {
                // 重置为开始帧
                currFrame = Math.min(loopStartFrame, end - 1);
                if (fillMode === "backwards" /* PLAYER_FILL_MODE.BACKWARDS */) {
                    extFrame = 1;
                }
                loopStart =
                    loopStartFrame < end ? (end - loopStartFrame) * frameDuration : 0;
            }
            return {
                currFrame: currFrame,
                startFrame: start,
                endFrame: end,
                totalFrame: frames,
                spriteCount: spriteCount,
                aniConfig: {
                    // 单个周期的运行时长
                    duration: duration,
                    // 第一个周期开始时间偏移量
                    loopStart: loopStart,
                    // 循环次数
                    loop: loop === 0 ? Infinity : loop,
                    // 最后一帧不在周期内，需要单独计算
                    fillValue: extFrame * frameDuration,
                },
            };
        };
        return Config;
    }());

    function parseOptions(options) {
        var _a, _b, _c, _d;
        var typeNumber = (_a = options.typeNumber) !== null && _a !== void 0 ? _a : 4;
        var correctLevel = (_b = options.correctLevel) !== null && _b !== void 0 ? _b : "H";
        var codeColor = (_c = options.codeColor) !== null && _c !== void 0 ? _c : "#000000";
        var backgroundColor = (_d = options.backgroundColor) !== null && _d !== void 0 ? _d : "#FFFFFF";
        return {
            code: options.code,
            size: options.size,
            typeNumber: typeNumber,
            correctLevel: correctLevel,
            codeColor: codeColor,
            backgroundColor: backgroundColor,
        };
    }
    var calcCellSizeAndPadding = function (moduleCount, size) {
        var cellSize = ~~(size / moduleCount);
        return {
            padding: ~~((size - moduleCount * cellSize) / 2),
            cellSize: cellSize || 2,
        };
    };
    function generateImageBufferFromCode(options) {
        var _a = parseOptions(options), code = _a.code, typeNumber = _a.typeNumber, correctLevel = _a.correctLevel, size = _a.size, codeColor = _a.codeColor, backgroundColor = _a.backgroundColor;
        var qr;
        try {
            qr = new QRCode(typeNumber, correctLevel);
            qr.addData(code);
            qr.make();
        }
        catch (e) {
            if (typeNumber >= 40) {
                throw new Error("Text too long to encode");
            }
            return arguments.callee({
                code: code,
                size: size,
                correctLevel: correctLevel,
                typeNumber: typeNumber + 1,
                codeColor: codeColor,
                backgroundColor: backgroundColor,
            });
        }
        // calc cellsize and margin
        var moduleCount = qr.getModuleCount();
        var _b = calcCellSizeAndPadding(moduleCount, size), padding = _b.padding, cellSize = _b.cellSize;
        var max = moduleCount * cellSize + padding;
        var CODE_COLOR = +"".concat(codeColor.replace("#", "0x"), "FF");
        var BACKGROUND_COLOR = +"".concat(backgroundColor.replace("#", "0x"), "FF");
        var png = new PNGEncoder(size, size);
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                if (padding <= x && x < max && padding <= y && y < max) {
                    var c = ~~((x - padding) / cellSize);
                    var r = ~~((y - padding) / cellSize);
                    png.setPixel(x, y, qr.isDark(r, c) ? CODE_COLOR : BACKGROUND_COLOR);
                }
                else {
                    png.setPixel(x, y, BACKGROUND_COLOR);
                }
            }
        }
        return png.flush();
    }
    function generateImageFromCode(options) {
        var buff = generateImageBufferFromCode(options);
        return platform.decode.toDataURL(buff);
    }

    function getBufferFromImageData(imageData) {
        var width = imageData.width, height = imageData.height, data = imageData.data;
        return new PNGEncoder(width, height).write(data).flush();
    }
    function getDataURLFromImageData(imageData) {
        var buff = getBufferFromImageData(imageData);
        return platform.decode.toDataURL(buff);
    }

    /**
     * 检查数据是否为zlib压缩格式
     * @param data 待检查的二进制数据
     * @returns 是否为zlib压缩格式
     */
    function isZlibCompressed(data) {
        // 检查数据长度是否足够（至少需要2字节头部和4字节ADLER-32校验和）
        if (data.length < 6) {
            return false;
        }
        // 获取CMF和FLG字节
        var cmf = data[0];
        var flg = data[1];
        // 检查CMF的压缩方法（低4位为8表示DEFLATE）
        // eslint-disable-next-line no-bitwise
        if ((cmf & 0x0F) !== 8) {
            return false;
        }
        // 检查窗口大小（高4位通常为7，但不是严格要求）
        // 这里不强制检查，因为理论上可以是其他值
        // 验证头部校验（CMF * 256 + FLG必须是31的倍数）
        if (((cmf * 256 + flg) % 31) !== 0) {
            return false;
        }
        // 检查字典标志位（如果设置了字典，需要额外验证，但这种情况很少见）
        // eslint-disable-next-line no-bitwise
        var fdict = (flg & 0x20) !== 0;
        if (fdict) {
            // 标准zlib压缩通常不使用预定义字典
            // 这里假设不使用字典，若检测到字典标志则认为不是标准zlib格式
            return false;
        }
        // 尝试提取ADLER-32校验和并验证其格式
        // 虽然无法验证校验和值（需要解压后计算），但可以检查其是否为合理的数值
        var adler32Bytes = data.slice(-4);
        if (adler32Bytes.length !== 4) {
            return false;
        }
        // eslint-disable-next-line no-bitwise
        var adler32 = (adler32Bytes[0] << 24) | (adler32Bytes[1] << 16) | (adler32Bytes[2] << 8) | adler32Bytes[3];
        // 有效的ADLER-32值应大于0（除非是空数据）
        if (data.length > 2 && adler32 === 0) {
            return false;
        }
        // 所有检查都通过，数据可能是zlib压缩格式
        return true;
    }

    var VideoManager = /** @class */ (function () {
        function VideoManager(loadMode, options) {
            /**
             * 视频池的当前指针位置
             */
            this.point = 0;
            /**
             * 视频的最大留存数量，其他视频将放在磁盘上缓存
             */
            this.maxRemain = 3;
            /**
             * 留存视频的开始指针位置
             */
            this.remainStart = 0;
            /**
             * 留存视频的结束指针位置
             */
            this.remainEnd = 0;
            /**
             * 视频加载模式
             * - 快速加载模式：可保证当前视频加载完成后，尽快播放；其他请求将使用Promise的方式保存在bucket中，以供后续使用
             * - 完整加载模式：可保证所有视频加载完成，确保播放切换的流畅性
             */
            this.loadMode = "fast";
            /**
             * 视频池的所有数据
             */
            this.buckets = [];
            this.options = {
                /**
                 * 预处理动效数据
                 * @param url
                 * @returns
                 */
                preprocess: function (bucket) { return Parser.download(bucket.origin); },
                /**
                 * 后处理动效数据
                 * @param bucket
                 * @param data
                 * @returns
                 */
                postprocess: function (bucket, data) {
                    return Parser.parseVideo(data, bucket.origin, true);
                },
                /**
                 * 清理数据
                 * @param buckets
                 * @returns
                 */
                cleanup: function (buckets) {
                    platform.globals; var local = platform.local, path = platform.path;
                    buckets.forEach(function (bucket) {
                        if (path.is(bucket.local)) {
                            local.remove(bucket.local);
                        }
                    });
                },
            };
            if (typeof loadMode === "string") {
                this.loadMode = loadMode;
            }
            Object.assign(this.options, options);
        }
        Object.defineProperty(VideoManager.prototype, "size", {
            /**
             * 获取视频池大小
             */
            get: function () {
                return this.buckets.length;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 更新留存指针位置
         */
        VideoManager.prototype.updateRemainRange = function (point, maxRemain, totalCount) {
            if (point < 0) {
                this.point = 0;
            }
            else if (point >= totalCount) {
                this.point = totalCount - 1;
            }
            else {
                this.point = point;
            }
            if (this.loadMode === "whole") {
                this.remainStart = 0;
                this.remainEnd = totalCount;
            }
            else {
                if (maxRemain < 1) {
                    this.maxRemain = 1;
                }
                else if (maxRemain > totalCount) {
                    this.maxRemain = totalCount;
                }
                else {
                    this.maxRemain = maxRemain;
                }
                this.remainStart = this.point - Math.floor(this.maxRemain / 2);
                if (this.remainStart < 0) {
                    this.remainStart = totalCount + this.remainStart;
                }
                this.remainEnd = this.remainStart + this.maxRemain;
                if (this.remainEnd > totalCount) {
                    this.remainEnd = this.remainEnd % totalCount;
                }
            }
        };
        /**
         * 指针是否在留存空间内
         * @param point
         * @returns
         */
        VideoManager.prototype.includeRemainRange = function (point) {
            if (this.remainStart < this.remainEnd) {
                return point >= this.remainStart && point < this.remainEnd;
            }
            if (this.remainStart > this.remainEnd) {
                return point >= this.remainStart || point < this.remainEnd;
            }
            return true;
        };
        VideoManager.prototype.downloadAndParseVideo = function (bucket_1) {
            return __awaiter(this, arguments, void 0, function (bucket, needParse) {
                var options, data;
                if (needParse === void 0) { needParse = false; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options = this.options;
                            return [4 /*yield*/, options.preprocess(bucket)];
                        case 1:
                            data = _a.sent();
                            if (needParse) {
                                return [2 /*return*/, options.postprocess(bucket, data)];
                            }
                            return [2 /*return*/, data];
                    }
                });
            });
        };
        /**
         * 创建bucket
         * @param url 远程地址
         * @param point 指针位置
         * @param needDownloadAndParse 是否需要下载并解析
         * @returns
         */
        VideoManager.prototype.createBucket = function (url, point, needDownloadAndParse) {
            return __awaiter(this, void 0, void 0, function () {
                var path, bucket, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            path = platform.path;
                            bucket = {
                                origin: url,
                                local: path.resolve(path.filename(url)),
                                entity: null,
                                promise: null,
                            };
                            this.buckets[point] = bucket;
                            if (!needDownloadAndParse) return [3 /*break*/, 2];
                            _a = bucket;
                            return [4 /*yield*/, this.downloadAndParseVideo(bucket, true)];
                        case 1:
                            _a.entity = _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            if (this.includeRemainRange(point)) {
                                bucket.promise = this.downloadAndParseVideo(bucket);
                            }
                            _b.label = 3;
                        case 3: return [2 /*return*/, bucket];
                    }
                });
            });
        };
        /**
         * 预加载视频到本地磁盘中
         * @param urls 视频远程地址
         * @param point 当前指针位置
         * @param maxRemain 最大留存数量
         */
        VideoManager.prototype.prepare = function (urls_1) {
            return __awaiter(this, arguments, void 0, function (urls, point, maxRemain) {
                var _a, loadMode, currentPoint, preloadBucket;
                var _this = this;
                if (point === void 0) { point = 0; }
                if (maxRemain === void 0) { maxRemain = 3; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.updateRemainRange(point, maxRemain, urls.length);
                            _a = this, loadMode = _a.loadMode, currentPoint = _a.point;
                            return [4 /*yield*/, this.createBucket(urls[currentPoint], currentPoint, true)];
                        case 1:
                            preloadBucket = _b.sent();
                            return [4 /*yield*/, Promise.all(urls.map(function (url, index) {
                                    // 当前帧的视频已经预加载到内存中
                                    if (index === currentPoint) {
                                        return preloadBucket;
                                    }
                                    return _this.createBucket(url, index, loadMode === "whole");
                                }))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 获取当前帧的bucket
         * @returns
         */
        VideoManager.prototype.get = function () {
            return __awaiter(this, void 0, void 0, function () {
                var bucket, _a, _b;
                var _this = this;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            bucket = this.buckets[this.point];
                            if (!bucket.promise) return [3 /*break*/, 2];
                            _a = bucket;
                            return [4 /*yield*/, bucket.promise.then(function (data) {
                                    return _this.options.postprocess(bucket, data);
                                })];
                        case 1:
                            _a.entity = _c.sent();
                            bucket.promise = null;
                            return [3 /*break*/, 4];
                        case 2:
                            if (!!bucket.entity) return [3 /*break*/, 4];
                            _b = bucket;
                            return [4 /*yield*/, this.downloadAndParseVideo(bucket, true)];
                        case 3:
                            _b.entity = _c.sent();
                            _c.label = 4;
                        case 4: return [2 /*return*/, bucket];
                    }
                });
            });
        };
        /**
         * 获取当前的指针位置
         * @returns
         */
        VideoManager.prototype.getPoint = function () {
            return this.point;
        };
        /**
         * 获取指定位置的bucket
         * @param pos
         * @returns
         */
        VideoManager.prototype.go = function (point) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, size, buckets, loadMode;
                var _this = this;
                return __generator(this, function (_b) {
                    _a = this, size = _a.size, buckets = _a.buckets, loadMode = _a.loadMode;
                    if (point < 0 || point >= size) {
                        return [2 /*return*/, buckets[this.point]];
                    }
                    this.updateRemainRange(point, this.maxRemain, buckets.length);
                    if (loadMode === "fast" && this.maxRemain !== buckets.length) {
                        buckets.forEach(function (bucket, index) {
                            if (_this.includeRemainRange(index)) {
                                if (bucket.entity === null && bucket.promise === null) {
                                    bucket.promise = _this.downloadAndParseVideo(bucket);
                                }
                            }
                            else {
                                bucket.entity = null;
                                bucket.promise = null;
                            }
                        });
                    }
                    return [2 /*return*/, this.get()];
                });
            });
        };
        /**
         * 清理所有的bucket
         * @returns
         */
        VideoManager.prototype.clear = function () {
            return __awaiter(this, arguments, void 0, function (needRemoveFiles) {
                var buckets;
                if (needRemoveFiles === void 0) { needRemoveFiles = true; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            buckets = this.buckets;
                            this.point = 0;
                            this.remainStart = 0;
                            this.remainEnd = 0;
                            this.maxRemain = 3;
                            this.buckets = [];
                            if (!needRemoveFiles) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.options.cleanup(buckets)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        return VideoManager;
    }());

    var VideoEditor = /** @class */ (function () {
        function VideoEditor(painter, resource, entity) {
            this.painter = painter;
            this.resource = resource;
            this.entity = entity;
        }
        VideoEditor.prototype.set = function (key_1, value_1) {
            return __awaiter(this, arguments, void 0, function (key, value, mode) {
                var _a, entity, resource;
                var _b;
                if (mode === void 0) { mode = "R"; }
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = this, entity = _a.entity, resource = _a.resource;
                            if (!(mode === "A")) return [3 /*break*/, 2];
                            return [4 /*yield*/, resource.loadImagesWithRecord((_b = {}, _b[key] = value, _b), entity.filename, "dynamic")];
                        case 1:
                            _c.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            entity.images[key] = value;
                            _c.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 获取自定义编辑器
         * @returns
         */
        VideoEditor.prototype.getContext = function () {
            return this.painter.YC;
        };
        /**
         * 是否是有效的Key
         * @param key
         * @returns
         */
        VideoEditor.prototype.hasValidKey = function (key) {
            var images = this.entity.images;
            if (typeof Object.hasOwn === "function") {
                return Object.hasOwn(images, key);
            }
            return Object.prototype.hasOwnProperty.call(images, key);
        };
        /**
         * 加载并缓存图片
         * @param source
         * @param url
         * @returns
         */
        VideoEditor.prototype.loadImage = function (source, url) {
            return this.resource.loadExtImage(source, platform.path.filename(url));
        };
        /**
         * 创建画布图片
         * @param key
         * @param context
         * @param options
         * @returns
         */
        VideoEditor.prototype.setCanvas = function (key, context, options) {
            return __awaiter(this, void 0, void 0, function () {
                var canvas, width, height, imageData;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (this.entity.locked)
                                return [2 /*return*/];
                            canvas = context.canvas;
                            width = (_a = options === null || options === void 0 ? void 0 : options.width) !== null && _a !== void 0 ? _a : canvas.width;
                            height = (_b = options === null || options === void 0 ? void 0 : options.height) !== null && _b !== void 0 ? _b : canvas.height;
                            imageData = context.getImageData(0, 0, width, height);
                            return [4 /*yield*/, this.set(key, new Uint8Array(getBufferFromImageData(imageData)), options === null || options === void 0 ? void 0 : options.mode)];
                        case 1:
                            _c.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 创建二进制图片
         * @param key
         * @param buff
         * @param options
         * @returns
         */
        VideoEditor.prototype.setImage = function (key, url, options) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (this.entity.locked)
                                return [2 /*return*/];
                            if (!url.startsWith("data:image")) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.set(key, url, options === null || options === void 0 ? void 0 : options.mode)];
                        case 1:
                            _d.sent();
                            return [3 /*break*/, 5];
                        case 2:
                            _a = this.set;
                            _b = [key];
                            _c = Uint8Array.bind;
                            return [4 /*yield*/, Parser.download(url)];
                        case 3: return [4 /*yield*/, _a.apply(this, _b.concat([new (_c.apply(Uint8Array, [void 0, _d.sent()]))(), options === null || options === void 0 ? void 0 : options.mode]))];
                        case 4:
                            _d.sent();
                            _d.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 创建二维码图片
         * @param key
         * @param code
         * @param options
         * @returns
         */
        VideoEditor.prototype.setQRCode = function (key, code, options) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.entity.locked)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.set(key, new Uint8Array(generateImageBufferFromCode(__assign(__assign({}, options), { code: code }))), options === null || options === void 0 ? void 0 : options.mode)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return VideoEditor;
    }());

    var ResourceManager = /** @class */ (function () {
        function ResourceManager(painter) {
            this.painter = painter;
            // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
            this.caches = [];
            /**
             * 动态素材
             */
            this.dynamicMaterials = new Map();
            /**
             * 素材
             */
            this.materials = new Map();
            /**
             * 已清理Image对象的坐标
             */
            this.point = 0;
        }
        /**
         * 判断是否是 ImageBitmap
         * @param img
         * @returns
         */
        ResourceManager.isBitmap = function (img) {
            return platform.globals.env === "h5" && img instanceof ImageBitmap;
        };
        /**
         * 释放内存资源（图片）
         * @param img
         */
        ResourceManager.releaseOne = function (img) {
            if (ResourceManager.isBitmap(img)) {
                img.close();
            }
            else if (img.src !== "") {
                // 【微信】将存在本地的文件删除，防止用户空间被占满
                if (platform.globals.env === "weapp" &&
                    img.src.includes(platform.path.USER_DATA_PATH)) {
                    platform.local.remove(img.src);
                }
                platform.image.release(img);
            }
        };
        /**
         * 创建图片标签
         * @returns
         */
        ResourceManager.prototype.createImage = function () {
            var img = null;
            if (this.point > 0) {
                this.point--;
                img = this.caches.shift();
            }
            if (!img) {
                img = platform.image.create(this.painter.X);
            }
            this.caches.push(img);
            return img;
        };
        /**
         * 将 ImageBitmap 插入到 caches
         * @param img
         */
        ResourceManager.prototype.inertBitmapIntoCaches = function (img) {
            if (ResourceManager.isBitmap(img)) {
                this.caches.push(img);
            }
        };
        /**
         * 加载额外的图片资源
         * @param source 资源内容/地址
         * @param filename 文件名称
         * @returns
         */
        ResourceManager.prototype.loadExtImage = function (source, filename) {
            var _this = this;
            return platform.image
                .load(function () { return _this.createImage(); }, source, platform.path.resolve(filename, "ext"))
                .then(function (img) {
                _this.inertBitmapIntoCaches(img);
                return img;
            });
        };
        /**
         * 加载图片集
         * @param images 图片数据
         * @param filename 文件名称
         * @returns
         */
        ResourceManager.prototype.loadImagesWithRecord = function (images_1, filename_1) {
            return __awaiter(this, arguments, void 0, function (images, filename, type) {
                var imageAwaits, imageFilename;
                var _this = this;
                if (type === void 0) { type = "normal"; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            imageAwaits = [];
                            imageFilename = "".concat(filename.replace(/\.svga$/g, ""), ".png");
                            Object.entries(images).forEach(function (_a) {
                                var name = _a[0], image = _a[1];
                                // 过滤 1px 透明图
                                if (image instanceof Uint8Array && image.byteLength < 70) {
                                    return;
                                }
                                var p = platform.image
                                    .load(function () { return _this.createImage(); }, image, platform.path.resolve(imageFilename, type === "dynamic" ? "dyn_".concat(name) : name))
                                    .then(function (img) {
                                    _this.inertBitmapIntoCaches(img);
                                    if (type === "dynamic") {
                                        _this.dynamicMaterials.set(name, img);
                                    }
                                    else {
                                        _this.materials.set(name, img);
                                    }
                                });
                                imageAwaits.push(p);
                            });
                            return [4 /*yield*/, Promise.all(imageAwaits)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 释放图片资源
         */
        ResourceManager.prototype.release = function () {
            // FIXME: 小程序 image 对象需要手动释放内存，否则可能导致小程序崩溃
            for (var _i = 0, _a = this.caches; _i < _a.length; _i++) {
                var img = _a[_i];
                ResourceManager.releaseOne(img);
            }
            this.materials.clear();
            this.dynamicMaterials.clear();
            // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
            platform.globals.env === "alipay" ? this.cleanup() : this.tidyUp();
        };
        /**
         * 整理图片资源，将重复的图片资源移除
         */
        ResourceManager.prototype.tidyUp = function () {
            // 通过 Set 的去重特性，保持 caches 元素的唯一性
            this.caches = Array.from(new Set(this.caches));
            this.point = this.caches.length;
        };
        /**
         * 清理图片资源
         */
        ResourceManager.prototype.cleanup = function () {
            this.caches.length = 0;
            this.point = 0;
        };
        return ResourceManager;
    }());

    /**
     * SVGA 播放器
     */
    var Player = /** @class */ (function () {
        function Player() {
            /**
             * 当前配置项
             */
            this.config = new Config();
            /**
             * 资源管理器
             */
            this.resource = null;
            /**
             * 刷头实例
             */
            this.painter = new Painter();
            /**
             * 动画实例
             */
            this.animator = new Animator();
            this.renderer = null;
        }
        // private isBeIntersection = true;
        // private intersectionObserver: IntersectionObserver | null = null
        /**
         * 设置配置项
         * @param options 可配置项
         * @property container 主屏，播放动画的 Canvas 元素
         * @property secondary 副屏，播放动画的 Canvas 元素
         * @property loop 循环次数，默认值 0（无限循环）
         * @property fillMode 最后停留的目标模式，类似于 animation-fill-mode，接受值 forwards 和 fallbacks，默认值 forwards。
         * @property playMode 播放模式，接受值 forwards 和 fallbacks ，默认值 forwards。
         * @property startFrame 单个循环周期内开始播放的帧数，默认值 0
         * @property endFrame 单个循环周期内结束播放的帧数，默认值 0
         * @property loopStartFrame 循环播放的开始帧，仅影响第一个周期的开始帧，默认值 0
         */
        Player.prototype.setConfig = function (options, component) {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            config = typeof options === "string" ? { container: options } : options;
                            this.config.register(config);
                            // 监听容器是否处于浏览器视窗内
                            // this.setIntersectionObserver()
                            return [4 /*yield*/, this.painter.register(config.container, config.secondary, component)];
                        case 1:
                            // 监听容器是否处于浏览器视窗内
                            // this.setIntersectionObserver()
                            _a.sent();
                            this.renderer = new Renderer2D(this.painter.YC);
                            this.resource = new ResourceManager(this.painter);
                            this.animator.onAnimate = platform.rAF.bind(null, this.painter.X);
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 更新配置
         * @param key
         * @param value
         */
        Player.prototype.setItem = function (key, value) {
            this.config.setItem(key, value);
        };
        // private setIntersectionObserver (): void {
        //   if (hasIntersectionObserver && this.config.isUseIntersectionObserver) {
        //     this.intersectionObserver = new IntersectionObserver(entries => {
        //       this.isBeIntersection = !(entries[0].intersectionRatio <= 0)
        //     }, {
        //       rootMargin: '0px',
        //       threshold: [0, 0.5, 1]
        //     })
        //     this.intersectionObserver.observe(this.config.container)
        //   } else {
        //     if (this.intersectionObserver !== null) this.intersectionObserver.disconnect()
        //     this.config.isUseIntersectionObserver = false
        //     this.isBeIntersection = true
        //   }
        // }
        /**
         * 装载 SVGA 数据元
         * @param videoEntity SVGA 数据源
         * @returns Promise<void>
         */
        Player.prototype.mount = function (videoEntity) {
            return __awaiter(this, void 0, void 0, function () {
                var images, filename;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!videoEntity)
                                throw new Error("videoEntity undefined");
                            images = videoEntity.images, filename = videoEntity.filename;
                            this.animator.stop();
                            this.painter.clearSecondary();
                            this.resource.release();
                            this.entity = videoEntity;
                            return [4 /*yield*/, this.resource.loadImagesWithRecord(images, filename)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 开始播放
         */
        Player.prototype.start = function () {
            var _a;
            this.startAnimation();
            (_a = this.onStart) === null || _a === void 0 ? void 0 : _a.call(this);
        };
        /**
         * 重新播放
         */
        Player.prototype.resume = function () {
            var _a;
            this.animator.resume();
            (_a = this.onResume) === null || _a === void 0 ? void 0 : _a.call(this);
        };
        /**
         * 暂停播放
         */
        Player.prototype.pause = function () {
            var _a;
            this.animator.pause();
            (_a = this.onPause) === null || _a === void 0 ? void 0 : _a.call(this);
        };
        /**
         * 停止播放
         */
        Player.prototype.stop = function () {
            var _a;
            this.animator.stop();
            this.painter.clearContainer();
            this.painter.clearSecondary();
            (_a = this.onStop) === null || _a === void 0 ? void 0 : _a.call(this);
        };
        /**
         * 销毁实例
         */
        Player.prototype.destroy = function () {
            var _a, _b, _c;
            this.animator.stop();
            this.painter.destroy();
            (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.destroy();
            (_b = this.resource) === null || _b === void 0 ? void 0 : _b.release();
            (_c = this.resource) === null || _c === void 0 ? void 0 : _c.cleanup();
            this.entity = undefined;
        };
        /**
         * 跳转到指定帧
         * @param frame 目标帧
         * @param andPlay 是否立即播放
         */
        Player.prototype.stepToFrame = function (frame, andPlay) {
            if (andPlay === void 0) { andPlay = false; }
            if (!this.entity || frame < 0 || frame >= this.entity.frames)
                return;
            this.pause();
            this.config.loopStartFrame = frame;
            if (andPlay) {
                this.start();
            }
        };
        /**
         * 跳转到指定百分比
         * @param percent 目标百分比
         * @param andPlay 是否立即播放
         */
        Player.prototype.stepToPercentage = function (percent, andPlay) {
            if (andPlay === void 0) { andPlay = false; }
            if (!this.entity)
                return;
            var frames = this.entity.frames;
            var frame = percent < 0 ? 0 : Math.round(percent * frames);
            if (frame >= frames) {
                frame = frames - 1;
            }
            debugger;
            this.stepToFrame(frame, andPlay);
        };
        /**
         * 开始绘制动画
         */
        Player.prototype.startAnimation = function () {
            var _this = this;
            var _a = this, entity = _a.entity, config = _a.config, animator = _a.animator, painter = _a.painter, renderer = _a.renderer, resource = _a.resource;
            var W = painter.W, H = painter.H;
            var fillMode = config.fillMode, playMode = config.playMode, contentMode = config.contentMode;
            var _b = config.getConfig(entity), currFrame = _b.currFrame, startFrame = _b.startFrame, endFrame = _b.endFrame, totalFrame = _b.totalFrame, spriteCount = _b.spriteCount, aniConfig = _b.aniConfig;
            var duration = aniConfig.duration, loopStart = aniConfig.loopStart, loop = aniConfig.loop, fillValue = aniConfig.fillValue;
            var isReverseMode = playMode === "fallbacks" /* PLAYER_PLAY_MODE.FALLBACKS */;
            // 当前帧
            var currentFrame = currFrame;
            // 片段绘制结束位置
            var tail = 0;
            var nextTail;
            // 上一帧
            var latestFrame;
            // 下一帧
            var nextFrame;
            // 精确帧
            var exactFrame;
            // 当前已完成的百分比
            var percent;
            // 是否还有剩余时间
            var hasRemained;
            // 更新动画基础信息
            animator.setConfig(duration, loopStart, loop, fillValue);
            renderer.resize(contentMode, entity.size, { width: W, height: H });
            // 分段渲染函数
            var MAX_DRAW_TIME_PER_FRAME = 8;
            var MAX_ACCELERATE_DRAW_TIME_PER_FRAME = 3;
            var MAX_DYNAMIC_CHUNK_SIZE = 34;
            var MIN_DYNAMIC_CHUNK_SIZE = 1;
            // 动态调整每次绘制的块大小
            var dynamicChunkSize = 4; // 初始块大小
            var startTime;
            var chunk;
            var elapsed;
            // 使用`指数退避算法`平衡渲染速度和流畅度
            var patchDraw = function (before) {
                startTime = platform.now();
                before();
                while (tail < spriteCount) {
                    // 根据当前块大小计算nextTail
                    chunk = Math.min(dynamicChunkSize, spriteCount - tail);
                    nextTail = (tail + chunk) | 0;
                    renderer.render(entity, resource.materials, resource.dynamicMaterials, currentFrame, tail, nextTail);
                    tail = nextTail;
                    // 动态调整块大小
                    elapsed = platform.now() - startTime;
                    if (elapsed < MAX_ACCELERATE_DRAW_TIME_PER_FRAME) {
                        dynamicChunkSize = Math.min(dynamicChunkSize * 2, MAX_DYNAMIC_CHUNK_SIZE); // 加快绘制
                    }
                    else if (elapsed > MAX_DRAW_TIME_PER_FRAME) {
                        dynamicChunkSize = Math.max(dynamicChunkSize / 2, MIN_DYNAMIC_CHUNK_SIZE); // 减慢绘制
                        break;
                    }
                }
            };
            // 动画绘制过程
            animator.onUpdate = function (timePercent) {
                var _a;
                patchDraw(function () {
                    percent = isReverseMode ? 1 - timePercent : timePercent;
                    exactFrame = percent * totalFrame;
                    if (isReverseMode) {
                        nextFrame =
                            (timePercent === 0 ? endFrame : Math.ceil(exactFrame)) - 1;
                        // FIXME: 倒序会有一帧的偏差，需要校准当前帧
                        percent = currentFrame / totalFrame;
                    }
                    else {
                        nextFrame = timePercent === 1 ? startFrame : Math.floor(exactFrame);
                    }
                    hasRemained = currentFrame === nextFrame;
                });
                if (hasRemained)
                    return;
                painter.clearContainer();
                painter.stick();
                painter.clearSecondary();
                latestFrame = currentFrame;
                currentFrame = nextFrame;
                tail = 0;
                (_a = _this.onProcess) === null || _a === void 0 ? void 0 : _a.call(_this, ~~(percent * 100) / 100, latestFrame);
            };
            animator.onStart = function () {
                entity.locked = true;
            };
            animator.onEnd = function () {
                var _a;
                entity.locked = false;
                // 如果不保留最后一帧渲染，则清空画布
                if (fillMode === "none" /* PLAYER_FILL_MODE.NONE */) {
                    painter.clearContainer();
                }
                (_a = _this.onEnd) === null || _a === void 0 ? void 0 : _a.call(_this);
            };
            animator.start();
        };
        return Player;
    }());

    var Poster = /** @class */ (function () {
        function Poster(width, height) {
            /**
             * 海报配置项
             */
            this.config = {
                /**
                 * 主屏，绘制海报的 Canvas 元素
                 */
                container: "",
                /**
                 * 填充模式，类似于 content-mode。
                 */
                contentMode: "fill" /* PLAYER_CONTENT_MODE.FILL */,
                /**
                 * 绘制成海报的帧，默认是0。
                 */
                frame: 0,
            };
            /**
             * 是否配置完成
             */
            this.isConfigured = false;
            /**
             * 资源管理器
             */
            this.resource = null;
            /**
             * 渲染器实例
             */
            this.renderer = null;
            this.painter = new Painter("poster", width, height);
        }
        /**
         * 注册 SVGA 海报
         * @param selector 容器选择器
         * @param component 组件
         */
        Poster.prototype.register = function () {
            return __awaiter(this, arguments, void 0, function (selector, component) {
                if (selector === void 0) { selector = ""; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.painter.register(selector, "", component)];
                        case 1:
                            _a.sent();
                            this.renderer = new Renderer2D(this.painter.YC);
                            this.resource = new ResourceManager(this.painter);
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 设置配置项
         * @param options 可配置项
         */
        Poster.prototype.setConfig = function () {
            return __awaiter(this, arguments, void 0, function (options, component) {
                if (options === void 0) { options = {}; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (typeof options === "string") {
                                this.config.container = options;
                            }
                            else {
                                Object.assign(this.config, options);
                            }
                            this.isConfigured = true;
                            return [4 /*yield*/, this.register(this.config.container, component)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 修改内容模式
         * @param contentMode
         */
        Poster.prototype.setContentMode = function (contentMode) {
            this.config.contentMode = contentMode;
        };
        /**
         * 设置当前帧
         * @param frame
         */
        Poster.prototype.setFrame = function (frame) {
            this.config.frame = frame;
        };
        /**
         * 装载 SVGA 数据元
         * @param videoEntity SVGA 数据源
         * @param currFrame
         * @returns
         */
        Poster.prototype.mount = function (videoEntity) {
            return __awaiter(this, void 0, void 0, function () {
                var images, filename;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!videoEntity) {
                                throw new Error("videoEntity undefined");
                            }
                            if (!!this.isConfigured) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.register()];
                        case 1:
                            _a.sent();
                            this.isConfigured = true;
                            _a.label = 2;
                        case 2:
                            images = videoEntity.images, filename = videoEntity.filename;
                            this.painter.clearContainer();
                            this.resource.release();
                            this.entity = videoEntity;
                            return [4 /*yield*/, this.resource.loadImagesWithRecord(images, filename)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 绘制海报
         */
        Poster.prototype.draw = function () {
            if (!this.entity)
                return;
            var _a = this, painter = _a.painter, renderer = _a.renderer, resource = _a.resource, entity = _a.entity, config = _a.config;
            renderer.resize(config.contentMode, entity.size, painter.X);
            renderer.render(entity, resource.materials, resource.dynamicMaterials, config.frame, 0, entity.sprites.length);
        };
        /**
         * 获取海报的 ImageData 数据
         */
        Poster.prototype.toImageData = function () {
            var _a = this.painter, context = _a.XC, width = _a.W, height = _a.H;
            return context.getImageData(0, 0, width, height);
        };
        /**
         * 销毁海报
         */
        Poster.prototype.destroy = function () {
            var _a, _b, _c;
            this.painter.destroy();
            (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.destroy();
            (_b = this.resource) === null || _b === void 0 ? void 0 : _b.release();
            (_c = this.resource) === null || _c === void 0 ? void 0 : _c.cleanup();
            this.entity = undefined;
        };
        return Poster;
    }());

    exports.Painter = Painter;
    exports.Parser = Parser;
    exports.Player = Player;
    exports.Poster = Poster;
    exports.ResourceManager = ResourceManager;
    exports.VideoEditor = VideoEditor;
    exports.VideoManager = VideoManager;
    exports.generateImageBufferFromCode = generateImageBufferFromCode;
    exports.generateImageFromCode = generateImageFromCode;
    exports.getBufferFromImageData = getBufferFromImageData;
    exports.getDataURLFromImageData = getDataURLFromImageData;
    exports.isZlibCompressed = isZlibCompressed;
    exports.platform = platform;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
