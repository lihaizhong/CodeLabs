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
    platformVersion = "0.1.1";
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

var pluginSelector = definePlugin({
    name: "getSelector",
    install() {
        const { env, br } = this.globals;
        if (env === "h5") {
            return (selector) => document.querySelector(selector);
        }
        return (selector, component) => {
            let query = br.createSelectorQuery();
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
    install() {
        const { retry, getSelector } = this;
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
            return (selector) => retry(() => {
                // FIXME: Taro 对 canvas 做了特殊处理，canvas 元素的 id 会被加上 canvas-id 的前缀
                const canvas = (getSelector(`canvas[canvas-id=${selector.slice(1)}]`) || getSelector(selector));
                return initCanvas(canvas, canvas?.clientWidth, canvas?.clientHeight);
            }, intervals);
        }
        return (selector, component) => retry(() => new Promise((resolve, reject) => {
            let query = getSelector(selector, component);
            query.exec((res) => {
                const { node, width, height } = res[0] || {};
                try {
                    resolve(initCanvas(node, width, height));
                }
                catch (e) {
                    reject(e);
                }
            });
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

var pluginIntersectionObserver = definePlugin({
    name: "walkIn",
    install() {
        const { env, br } = this.globals;
        const thresholds = [0, 0.5, 1];
        if (env === "h5") {
            return (callback, selector, options = {}) => {
                let observer = new IntersectionObserver((entries) => callback(entries[0].intersectionRatio > 0), {
                    threshold: thresholds,
                    root: options.root ? document.querySelector(options.root) : null,
                });
                if (options.observeAll) {
                    document.querySelectorAll(selector)?.forEach((element) => observer.observe(element));
                }
                else {
                    const element = document.querySelector(selector);
                    if (element) {
                        observer.observe(element);
                    }
                }
                return () => {
                    observer.disconnect();
                    observer = null;
                };
            };
        }
        return (callback, selector, options = {}) => {
            let observer = br.createIntersectionObserver(options.component, {
                thresholds,
                initialRatio: 0,
                observeAll: options.observeAll,
                // nativeMode: true,
            });
            if (options.root) {
                observer.relativeTo(options.root);
            }
            else {
                observer.relativeToViewport();
            }
            observer.observe(selector, (res) => callback(res.intersectionRatio > 0));
            return () => {
                observer.disconnect();
                observer = null;
            };
        };
    },
});

export { OctopusPlatform, definePlugin, installPlugin, pluginCanvas, pluginDecode, pluginDownload, pluginFsm, pluginImage, pluginIntersectionObserver, pluginNow, pluginOfsCanvas, pluginPath, pluginRaf as pluginRAF, pluginSelector };
//# sourceMappingURL=index.js.map
