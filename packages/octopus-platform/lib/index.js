(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.OctopusPlatform = {}));
})(this, (function (exports) { 'use strict';

    var noop = (function () { });

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

    function delay(callback, interval) {
        return new Promise(function (resolve) {
            return setTimeout(function () { return resolve(callback()); }, interval);
        });
    }
    function retry(fn_1) {
        return __awaiter(this, arguments, void 0, function (fn, intervals, 
        /*
         * @private 不建议外部传入
         */
        times) {
            if (intervals === void 0) { intervals = []; }
            if (times === void 0) { times = 0; }
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, fn()];
                }
                catch (err) {
                    if (times >= intervals.length) {
                        throw err;
                    }
                    return [2 /*return*/, delay(function () { return retry(fn, intervals, ++times); }, intervals[times])];
                }
                return [2 /*return*/];
            });
        });
    }

    // 使用静态缓冲区，避免重复创建
    var BUFFER_SIZE = 4096; // 更大的缓冲区，减少字符串拼接次数
    var STATIC_BUFFER = new Uint16Array(BUFFER_SIZE); // 预分配ASCII缓冲区
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
        var resultParts = [];
        var bufferPos = 0;
        var appendBuffer = function (parts) {
            resultParts.push(String.fromCharCode.apply(null, Array.from(parts)));
        };
        // 快速路径：检查是否全是 ASCII
        var allAscii = true;
        for (var i = start; i < end; i++) {
            if (buffer[i] > 0x7F) {
                allAscii = false;
                break;
            }
        }
        // 全 ASCII 优化路径
        if (allAscii) {
            for (var i = start; i < end; i += BUFFER_SIZE) {
                var chunkEnd = Math.min(i + BUFFER_SIZE, end);
                var len = chunkEnd - i;
                // 直接复制到 Uint16Array
                for (var j = 0; j < len; j++) {
                    STATIC_BUFFER[j] = buffer[i + j];
                }
                appendBuffer(STATIC_BUFFER.subarray(0, len));
            }
            return resultParts.join('');
        }
        // 混合内容处理
        for (var i = start; i < end;) {
            var byte = buffer[i++];
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
            var codePoint = void 0;
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

    var OctopusPlatform = /** @class */ (function () {
        function OctopusPlatform(plugins, version) {
            /**
             * 插件列表
             */
            this.plugins = [];
            /**
             * 平台版本
             */
            this.platformVersion = "0.1.0";
            /**
             * 应用版本
             */
            this.version = "";
            /**
             * 全局变量
             */
            this.globals = {
                env: "unknown",
                br: null,
                dpr: 1,
                system: "unknown",
            };
            this.noop = noop;
            this.retry = retry;
            this.version = version || "";
            this.plugins = plugins;
            this.globals.env = this.autoEnv();
        }
        OctopusPlatform.prototype.init = function () {
            var _a = this, globals = _a.globals, plugins = _a.plugins;
            var collection = new Map();
            var names = [];
            var installedPlugins = new Set();
            globals.br = this.useBridge();
            globals.dpr = this.usePixelRatio();
            globals.system = this.useSystem();
            for (var _i = 0, plugins_1 = plugins; _i < plugins_1.length; _i++) {
                var plugin = plugins_1[_i];
                names.push(plugin.name);
                collection.set(plugin.name, plugin);
            }
            this.usePlugins(collection, names, installedPlugins);
            installedPlugins.clear();
        };
        OctopusPlatform.prototype.autoEnv = function () {
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
        };
        OctopusPlatform.prototype.useBridge = function () {
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
        };
        OctopusPlatform.prototype.usePixelRatio = function () {
            var _a = this.globals, env = _a.env, br = _a.br;
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
        };
        OctopusPlatform.prototype.useSystem = function () {
            var env = this.globals.env;
            var system;
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
        };
        OctopusPlatform.prototype.usePlugins = function (plugins, pluginNames, installedPlugins) {
            var _a;
            for (var _i = 0, pluginNames_1 = pluginNames; _i < pluginNames_1.length; _i++) {
                var pluginName = pluginNames_1[_i];
                if (!plugins.has(pluginName)) {
                    throw new Error("Plugin ".concat(pluginName, " not found"));
                }
                if (installedPlugins.has(pluginName)) {
                    return;
                }
                var plugin = plugins.get(pluginName);
                // 递归调用依赖
                if (Array.isArray(plugin.dependencies)) {
                    for (var _b = 0, _c = plugin.dependencies; _b < _c.length; _b++) {
                        var dependency = _c[_b];
                        if (typeof ((_a = plugins.get(dependency)) === null || _a === void 0 ? void 0 : _a.install) !== "function") {
                            throw new Error("Plugin ".concat(pluginName, " depends on plugin ").concat(dependency, ", but ").concat(dependency, " is not found"));
                        }
                    }
                    // 递归加载依赖
                    this.usePlugins(plugins, plugin.dependencies, installedPlugins);
                }
                this.installPlugin(plugin);
                installedPlugins.add(pluginName);
            }
        };
        OctopusPlatform.prototype.switch = function (env) {
            this.globals.env = env;
            this.init();
        };
        return OctopusPlatform;
    }());

    /**
     * 定义平台插件
     */
    var definePlugin = function (plugin) { return plugin; };

    function installPlugin(platform, plugin) {
        var value = plugin.install.call(platform);
        Object.defineProperty(platform, plugin.name, {
            get: function () { return value; },
            enumerable: true,
            configurable: true,
        });
    }

    var pluginSelector = definePlugin({
        name: "getSelector",
        install: function () {
            var _a = this.globals, env = _a.env, br = _a.br;
            if (env === "h5") {
                return function (selector) {
                    return document.querySelector(selector);
                };
            }
            return function (selector, component) {
                var query = br.createSelectorQuery();
                if (component) {
                    query = query.in(component);
                }
                return query
                    .select(selector)
                    .fields({ node: true, size: true });
            };
        }
    });

    /**
     * 通过选择器匹配获取canvas实例
     * @returns
     */
    var pluginCanvas = definePlugin({
        name: "getCanvas",
        dependencies: ["getSelector"],
        install: function () {
            var _a = this, retry = _a.retry, getSelector = _a.getSelector;
            var _b = this.globals, env = _b.env; _b.br; var dpr = _b.dpr;
            var intervals = [50, 100, 100];
            function initCanvas(canvas, width, height) {
                if (!canvas) {
                    throw new Error("canvas not found.");
                }
                // const MAX_SIZE = 1365;
                var context = canvas.getContext("2d");
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
                return { canvas: canvas, context: context };
            }
            if (env === "h5") {
                return function (selector) {
                    return retry(function () {
                        // FIXME: Taro 对 canvas 做了特殊处理，canvas 元素的 id 会被加上 canvas-id 的前缀
                        var canvas = (getSelector("canvas[canvas-id=".concat(selector.slice(1), "]")) || getSelector(selector));
                        return initCanvas(canvas, canvas === null || canvas === void 0 ? void 0 : canvas.clientWidth, canvas === null || canvas === void 0 ? void 0 : canvas.clientHeight);
                    }, intervals);
                };
            }
            return function (selector, component) {
                return retry(function () {
                    return new Promise(function (resolve, reject) {
                        var query = getSelector(selector, component);
                        query.exec(function (res) {
                            var _a = res[0] || {}, node = _a.node, width = _a.width, height = _a.height;
                            try {
                                resolve(initCanvas(node, width, height));
                            }
                            catch (e) {
                                reject(e);
                            }
                        });
                    });
                }, intervals);
            };
        },
    });

    /**
     * 用于处理数据解码
     * @returns
     */
    var pluginDecode = definePlugin({
        name: "decode",
        install: function () {
            var _a = this.globals, env = _a.env, br = _a.br;
            var b64Wrap = function (b64, type) {
                if (type === void 0) { type = "image/png"; }
                return "data:".concat(type, ";base64,").concat(b64);
            };
            var decode = {
                toBuffer: function (data) {
                    var buffer = data.buffer, byteOffset = data.byteOffset, byteLength = data.byteLength;
                    if (buffer instanceof ArrayBuffer) {
                        return buffer.slice(byteOffset, byteOffset + byteLength);
                    }
                    var view = new Uint8Array(byteLength);
                    view.set(data);
                    return view.buffer;
                },
                bytesToString: function (data) {
                    var chunkSize = 8192; // 安全的块大小
                    var result = "";
                    for (var i = 0; i < data.length; i += chunkSize) {
                        var chunk = data.slice(i, i + chunkSize);
                        // 在安全的块上使用 String.fromCharCode
                        result += String.fromCharCode.apply(null, Array.from(chunk));
                    }
                    return result;
                },
            };
            if (env === "h5") {
                var textDecoder_1 = new TextDecoder("utf-8", { fatal: true });
                return __assign(__assign({}, decode), { toDataURL: function (data) {
                        return b64Wrap(btoa(decode.bytesToString(data)));
                    }, utf8: function (data, start, end) {
                        return textDecoder_1.decode(data.subarray(start, end));
                    } });
            }
            return __assign(__assign({}, decode), { toDataURL: function (data) {
                    return b64Wrap(br.arrayBufferToBase64(decode.toBuffer(data)));
                }, utf8: utf8 });
        },
    });

    /**
     * 用于处理远程文件读取
     * @returns
     */
    var pluginDownload = definePlugin({
        name: "remote",
        install: function () {
            var _a = this.globals, env = _a.env, br = _a.br;
            var isRemote = function (url) { return /^(blob:)?http(s)?:\/\//.test(url); };
            if (env === "h5") {
                return {
                    is: isRemote,
                    fetch: function (url) {
                        return fetch(url).then(function (response) {
                            if (response.ok) {
                                return response.arrayBuffer();
                            }
                            throw new Error("HTTP error, status=".concat(response.status, ", statusText=").concat(response.statusText));
                        });
                    },
                };
            }
            function download(url, enableCache) {
                return new Promise(function (resolve, reject) {
                    br.request({
                        url: url,
                        // @ts-ignore 支付宝小程序必须有该字段
                        dataType: "arraybuffer",
                        responseType: "arraybuffer",
                        enableCache: enableCache,
                        success: function (res) { return resolve(res.data); },
                        fail: reject,
                    });
                }).catch(function (err) {
                    var errorMessage = err.errMsg || err.errorMessage || err.message;
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
                fetch: function (url) { return download(url, true); },
            };
        },
    });

    /**
     * 用于处理本地文件存储
     * @returns
     */
    var pluginFsm = definePlugin({
        name: "local",
        install: function () {
            var _a = this.globals, env = _a.env, br = _a.br;
            if (env === "h5" || env === "tt") {
                return null;
            }
            var fsm = br.getFileSystemManager();
            return {
                exists: function (filepath) {
                    return new Promise(function (resolve) {
                        fsm.access({
                            path: filepath,
                            success: function () { return resolve(true); },
                            fail: function () { return resolve(false); },
                        });
                    });
                },
                write: function (data, filePath) {
                    return new Promise(function (resolve, reject) {
                        fsm.writeFile({
                            filePath: filePath,
                            data: data,
                            success: function () { return resolve(filePath); },
                            fail: reject,
                        });
                    });
                },
                read: function (filePath) {
                    return new Promise(function (resolve, reject) {
                        fsm.readFile({
                            filePath: filePath,
                            success: function (res) { return resolve(res.data); },
                            fail: reject,
                        });
                    });
                },
                remove: function (filePath) {
                    return new Promise(function (resolve, reject) {
                        fsm.unlink({
                            filePath: filePath,
                            success: function () { return resolve(filePath); },
                            fail: reject,
                        });
                    });
                },
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
        install: function () {
            var _this = this;
            var _a = this, local = _a.local, decode = _a.decode;
            var env = this.globals.env;
            var genImageSource = function (data, _filepath) { return (typeof data === "string" ? data : decode.toDataURL(data)); };
            /**
             * 加载图片
             * @param img
             * @param url
             * @returns
             */
            function loadImage(img, url) {
                return new Promise(function (resolve, reject) {
                    img.onload = function () { return resolve(img); };
                    img.onerror = function () { return reject(new Error("SVGA LOADING FAILURE: ".concat(url))); };
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
                    create: function (_) { return new Image(); },
                    load: function (createImage, data, filepath) {
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
                genImageSource = function (data, filepath) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (typeof data === "string") {
                            return [2 /*return*/, data];
                        }
                        // FIXME: IOS设备 微信小程序 Uint8Array转base64 时间较长，使用图片缓存形式速度会更快
                        return [2 /*return*/, local
                                .write(decode.toBuffer(data), filepath)
                                .catch(function (ex) {
                                console.warn("image write fail: ".concat(ex.errorMessage || ex.errMsg || ex.message));
                                return decode.toDataURL(data);
                            })];
                    });
                }); };
            }
            return {
                create: function (canvas) {
                    return canvas.createImage();
                },
                load: function (createImage, data, filepath) { return __awaiter(_this, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _a = loadImage;
                                _b = [createImage()];
                                return [4 /*yield*/, genImageSource(data, filepath)];
                            case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent()]))];
                        }
                    });
                }); },
                release: releaseImage,
            };
        },
    });

    var pluginNow = definePlugin({
        name: "now",
        install: function () {
            var _a = this.globals, env = _a.env, br = _a.br;
            // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
            var perf = env === "h5" || env === "tt" ? performance : br.getPerformance();
            if (typeof (perf === null || perf === void 0 ? void 0 : perf.now) === "function") {
                // 支付宝小程序的performance.now()获取的是当前时间戳，单位是微秒。
                if (perf.now() - Date.now() > 1) {
                    return function () { return perf.now() / 1000; };
                }
                // H5环境下，performance.now()获取的不是当前时间戳，而是从页面加载开始的时间戳，单位是毫秒。
                return function () { return perf.now(); };
            }
            return function () { return Date.now(); };
        },
    });

    /**
     * 用于创建离屏canvas
     * @returns
     */
    var pluginOfsCanvas = definePlugin({
        name: "getOfsCanvas",
        install: function () {
            var env = this.globals.env;
            var createOffscreenCanvas;
            if (env === "h5") {
                createOffscreenCanvas = function (options) { return new OffscreenCanvas(options.width, options.height); };
            }
            else if (env === "alipay") {
                createOffscreenCanvas = function (options) { return my.createOffscreenCanvas(options); };
            }
            else if (env === "tt") {
                createOffscreenCanvas = function (options) {
                    var canvas = tt.createOffscreenCanvas();
                    canvas.width = options.width;
                    canvas.height = options.height;
                    return canvas;
                };
            }
            else {
                createOffscreenCanvas = function (options) { return wx.createOffscreenCanvas(options); };
            }
            return function (options) {
                var type = options.type || "2d";
                var canvas = createOffscreenCanvas(__assign(__assign({}, options), { type: type }));
                var context = canvas.getContext(type);
                return {
                    canvas: canvas,
                    context: context,
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
        install: function () {
            var _a = this.globals, env = _a.env, br = _a.br;
            var filename = function (path) {
                var filepath = path.split(/\?#/g)[0];
                return filepath.substring(filepath.lastIndexOf("/") + 1);
            };
            if (env === "h5" || env === "tt") {
                return {
                    USER_DATA_PATH: "",
                    is: function (_) { return false; },
                    filename: filename,
                    resolve: function (filename, prefix) { return ""; },
                };
            }
            var USER_DATA_PATH = br.env.USER_DATA_PATH;
            return {
                USER_DATA_PATH: USER_DATA_PATH,
                is: function (filepath) { return filepath === null || filepath === void 0 ? void 0 : filepath.startsWith(USER_DATA_PATH); },
                filename: filename,
                resolve: function (filename, prefix) {
                    return "".concat(USER_DATA_PATH, "/").concat(prefix ? "".concat(prefix, "__") : "").concat(filename);
                },
            };
        },
    });

    /**
     * 用于处理requestAnimationFrame
     * @returns
     */
    var pluginRaf = definePlugin({
        name: "rAF",
        install: function () {
            var env = this.globals.env;
            function requestAnimationFrameImpl() {
                return function (callback) {
                    return setTimeout(callback, Math.max(0, 16 - (Date.now() % 16)));
                };
            }
            if (env === "h5") {
                var rAF_1 = "requestAnimationFrame" in globalThis
                    ? requestAnimationFrame
                    : requestAnimationFrameImpl();
                return function (_, callback) { return rAF_1(callback); };
            }
            return function (canvas, callback) {
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

    exports.OctopusPlatform = OctopusPlatform;
    exports.definePlugin = definePlugin;
    exports.installPlugin = installPlugin;
    exports.pluginCanvas = pluginCanvas;
    exports.pluginDecode = pluginDecode;
    exports.pluginDownload = pluginDownload;
    exports.pluginFsm = pluginFsm;
    exports.pluginImage = pluginImage;
    exports.pluginNow = pluginNow;
    exports.pluginOfsCanvas = pluginOfsCanvas;
    exports.pluginPath = pluginPath;
    exports.pluginRAF = pluginRaf;
    exports.pluginSelector = pluginSelector;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
