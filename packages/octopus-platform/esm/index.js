const noop = (() => { });

async function retry(fn, intervals = []) {
    let times = 0;
    while (true) {
        try {
            return await fn();
        }
        catch (err) {
            if (times >= intervals.length) {
                throw err;
            }
            await new Promise(resolve => setTimeout(resolve, intervals[times]));
            times++;
        }
    }
}

// 使用静态缓冲区，避免重复创建
const BUFFER_SIZE = 4096; // 更大的缓冲区，减少字符串拼接次数
const STATIC_BUFFER = new Uint16Array(BUFFER_SIZE); // 预分配ASCII缓冲区
/**
 * 验证 UTF-8 解码的输入范围
 * @param buffer - 输入的字节数组
 * @param start - 起始位置
 * @param end - 结束位置
 * @throws RangeError 如果范围无效
 */
function validateRange(buffer, start, end) {
    if (start < 0 || end > buffer.length) {
        throw new RangeError("Index out of range");
    }
}
/**
 * 检测指定范围是否全为 ASCII 字符
 * @param buffer - 输入的字节数组
 * @param start - 起始位置
 * @param end - 结束位置
 * @returns true 如果所有字节 <= 0x7F
 */
function isAllAscii(buffer, start, end) {
    for (let i = start; i < end; i++) {
        if (buffer[i] > 0x7F) {
            return false;
        }
    }
    return true;
}
/**
 * 快速解码纯 ASCII 内容
 * @param buffer - 输入的字节数组
 * @param start - 起始位置
 * @param end - 结束位置
 * @returns 解码后的字符串
 */
function decodeAsciiFastPath(buffer, start, end) {
    const resultParts = [];
    // 批量处理，每次处理 BUFFER_SIZE 个字节
    for (let i = start; i < end; i += BUFFER_SIZE) {
        const chunkEnd = Math.min(i + BUFFER_SIZE, end);
        const len = chunkEnd - i;
        // 直接复制到 Uint16Array
        for (let j = 0; j < len; j++) {
            STATIC_BUFFER[j] = buffer[i + j];
        }
        // 将缓冲区转换为字符串
        let str = '';
        for (let k = 0; k < len; k++) {
            str += String.fromCharCode(STATIC_BUFFER[k]);
        }
        resultParts.push(str);
    }
    return resultParts.join('');
}
/**
 * 解码单个 UTF-8 多字节序列
 * @param buffer - 输入的字节数组
 * @param pos - 当前位置（指向第一个字节）
 * @param end - 结束位置
 * @returns { codePoint, nextPos } 解码结果和下一位置
 */
function decodeUTF8Sequence(buffer, pos, end) {
    const byte = buffer[pos];
    let codePoint;
    let nextPos = pos + 1;
    // 2 字节序列: 110xxxxx 10xxxxxx
    if ((byte & 0xE0) === 0xC0 && nextPos < end) {
        codePoint = ((byte & 0x1F) << 6) | (buffer[nextPos++] & 0x3F);
    }
    // 3 字节序列: 1110xxxx 10xxxxxx 10xxxxxx
    else if ((byte & 0xF0) === 0xE0 && nextPos + 1 < end) {
        codePoint = ((byte & 0x0F) << 12) |
            ((buffer[nextPos++] & 0x3F) << 6) |
            (buffer[nextPos++] & 0x3F);
    }
    // 4 字节序列: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
    else if ((byte & 0xF8) === 0xF0 && nextPos + 2 < end) {
        codePoint = ((byte & 0x07) << 18) |
            ((buffer[nextPos++] & 0x3F) << 12) |
            ((buffer[nextPos++] & 0x3F) << 6) |
            (buffer[nextPos++] & 0x3F);
    }
    // 无效的 UTF-8 序列
    else {
        codePoint = 0xFFFD; // Unicode 替换字符
        // 跳过可能的后续字节
        while (nextPos < end && (buffer[nextPos] & 0xC0) === 0x80) {
            nextPos++;
        }
    }
    return { codePoint, nextPos };
}
/**
 * 将码点追加到缓冲区，必要时提交
 * @param staticBuffer - 静态缓冲区
 * @param bufferPos - 当前缓冲区位置
 * @param codePoint - 要追加的码点
 * @param resultParts - 结果字符串数组
 * @param forceCommit - 是否强制提交
 * @returns 新的缓冲区位置
 */
function appendToBuffer(staticBuffer, bufferPos, codePoint, resultParts, forceCommit) {
    staticBuffer[bufferPos++] = codePoint;
    // 检查是否需要提交缓冲区
    if (bufferPos >= BUFFER_SIZE - 3) {
        let str = '';
        for (let i = 0; i < bufferPos; i++) {
            str += String.fromCharCode(staticBuffer[i]);
        }
        resultParts.push(str);
        bufferPos = 0;
    }
    return bufferPos;
}
/**
 * 解码混合内容（ASCII + 多字节 UTF-8）
 * @param buffer - 输入的字节数组
 * @param start - 起始位置
 * @param end - 结束位置
 * @returns 解码后的字符串
 */
function decodeMixedContent(buffer, start, end) {
    const resultParts = [];
    let bufferPos = 0;
    let i = start;
    while (i < end) {
        const byte = buffer[i++];
        // ASCII 字符处理
        if (byte < 0x80) {
            STATIC_BUFFER[bufferPos++] = byte;
            // 如果缓冲区满了，提交并清空
            if (bufferPos === BUFFER_SIZE) {
                let str = '';
                for (let j = 0; j < bufferPos; j++) {
                    str += String.fromCharCode(STATIC_BUFFER[j]);
                }
                resultParts.push(str);
                bufferPos = 0;
            }
            continue;
        }
        // 提交之前的 ASCII 字符
        if (bufferPos > 0) {
            let str = '';
            for (let j = 0; j < bufferPos; j++) {
                str += String.fromCharCode(STATIC_BUFFER[j]);
            }
            resultParts.push(str);
            bufferPos = 0;
        }
        // 解码 UTF-8 多字节序列
        const { codePoint, nextPos } = decodeUTF8Sequence(buffer, i - 1, end);
        i = nextPos;
        // 处理 Unicode 代理对（超过 0xFFFF 的码点）
        if (codePoint > 0xFFFF) {
            const surrogateCodePoint = codePoint - 0x10000;
            STATIC_BUFFER[bufferPos++] = 0xD800 + (surrogateCodePoint >> 10);
            STATIC_BUFFER[bufferPos++] = 0xDC00 + (surrogateCodePoint & 0x3FF);
            // 检查缓冲区是否需要提交（预留空间给下一个可能的代理对）
            if (bufferPos >= BUFFER_SIZE - 2) {
                let str = '';
                for (let j = 0; j < bufferPos; j++) {
                    str += String.fromCharCode(STATIC_BUFFER[j]);
                }
                resultParts.push(str);
                bufferPos = 0;
            }
        }
        else {
            // 普通码点
            bufferPos = appendToBuffer(STATIC_BUFFER, bufferPos, codePoint, resultParts);
        }
    }
    // 提交剩余字符
    if (bufferPos > 0) {
        let str = '';
        for (let j = 0; j < bufferPos; j++) {
            str += String.fromCharCode(STATIC_BUFFER[j]);
        }
        resultParts.push(str);
    }
    return resultParts.join('');
}
/**
 * 优化的 UTF-8 解码函数
 * 主要优化点：
 * 1. 使用静态缓冲区减少内存分配
 * 2. 批量处理 ASCII 字符
 * 3. 优化循环结构和条件判断
 * 4. 使用 Uint16Array 代替普通数组提高性能
 *
 * @param buffer - 输入的 UTF-8 编码字节数组
 * @param start - 起始位置
 * @param end - 结束位置
 * @returns 解码后的字符串
 */
function utf8(buffer, start, end) {
    // 1. 边界验证
    validateRange(buffer, start, end);
    // 2. 处理空输入
    if (end - start < 1) {
        return "";
    }
    // 3. 快速路径：全 ASCII
    if (isAllAscii(buffer, start, end)) {
        return decodeAsciiFastPath(buffer, start, end);
    }
    // 4. 混合内容处理
    return decodeMixedContent(buffer, start, end);
}

class OctopusPlatform {
    /**
     * 插件列表
     */
    plugins = [];
    /**
     * 平台版本
     */
    platformVersion = "0.2.0";
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
        system: "",
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
        const envs = [
            { name: 'h5', check: () => typeof window !== 'undefined' },
            { name: 'tt', check: () => typeof tt !== 'undefined' },
            { name: 'alipay', check: () => typeof my !== 'undefined' },
            { name: 'weapp', check: () => typeof wx !== 'undefined' },
            { name: 'harmony', check: () => typeof has !== 'undefined' },
        ];
        for (const env of envs) {
            if (env.check())
                return env.name;
        }
        throw new Error(`Unsupported platform! Available: ${envs.map(e => e.name).join(', ')}`);
    }
    useBridge() {
        switch (this.globals.env) {
            case "alipay":
                return my;
            case "tt":
                return tt;
            case "weapp":
                return wx;
        }
        return globalThis;
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
            case "harmony":
                system = has.getSystemInfoSync().platform;
                break;
            case "h5":
                if ("userAgentData" in navigator) {
                    // @ts-ignore
                    system = navigator.userAgentData.platform;
                }
                else {
                    const UA = navigator.userAgent;
                    if (/(Android|Adr)/i.test(UA)) {
                        system = "android";
                    }
                    else if (/\(i[^;]+;( U;)? CPU.+Mac OS X/i.test(UA)) {
                        system = "ios";
                    }
                    else if (/HarmonyOS/i.test(UA)) {
                        system = "harmony";
                    }
                    else {
                        system = "unknown";
                    }
                }
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

function installPlugin(self, plugin) {
    const value = plugin.install.call(self);
    Object.defineProperty(self, plugin.name, {
        get: () => value,
        enumerable: true,
        configurable: true,
    });
}

/**
 * 创建平台实例的工厂函数
 *
 * 通过工厂函数创建平台实例，无需继承。
 * TypeScript 会根据插件列表自动推断实例的属性类型。
 *
 * @param plugins - 插件列表
 * @param version - 应用版本
 * @returns 平台实例，自动推断插件属性类型
 */
function createPlatform(plugins, version) {
    // 内部类：继承 OctopusPlatform 并实现 installPlugin
    class InternalPlatform extends OctopusPlatform {
        constructor() {
            super(plugins, version);
            this.init(); // 在基类中调用 init
        }
        installPlugin(plugin) {
            // 使用 installPlugin.ts 中的实现（包含类型断言）
            installPlugin(this, plugin);
        }
    }
    return new InternalPlatform();
}

var pluginSelector = definePlugin({
    name: "getSelector",
    install() {
        const { env, br } = this.globals;
        if (env === "h5") {
            return (selector) => document.querySelector(selector);
        }
        return (selector, component) => (component || br)
            .createSelectorQuery()
            .select(selector)
            .fields({ node: true, size: true });
    },
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
        const { env, dpr } = this.globals;
        const intervals = [50, 100, 100];
        function initCanvas(canvas, width, height, type) {
            if (!canvas) {
                throw new Error("canvas not found.");
            }
            // const MAX_SIZE = 1365;
            const context = canvas.getContext(type);
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
            return (selector, options) => {
                const type = options?.type || "2d";
                return retry(() => {
                    // FIXME: Taro 对 canvas 做了特殊处理，canvas 元素的 id 会被加上 canvas-id 的前缀
                    const canvas = (getSelector(`canvas[canvas-id=${selector.slice(1)}]`) || getSelector(selector));
                    return initCanvas(canvas, canvas?.clientWidth, canvas?.clientHeight, type);
                }, intervals);
            };
        }
        return (selector, options) => {
            let type;
            let component;
            if (options) {
                // 如果是小程序组件对象
                if (typeof options.setData === "function") {
                    type = "2d";
                    component = options;
                }
                else {
                    type = options.type || "2d";
                    component = options.component || null;
                }
            }
            else {
                type = "2d";
                component = null;
            }
            return retry(() => new Promise((resolve, reject) => {
                let query = getSelector(selector, component);
                query.exec((res) => {
                    const { node, width, height } = res[0] || {};
                    try {
                        resolve(initCanvas(node, width, height, type));
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }), intervals);
        };
    },
});

/**
 * 用于处理数据解码
 * @returns
 */
var pluginCodec = definePlugin({
    name: "codec",
    install() {
        const { env, br } = this.globals;
        const b64Wrap = (b64, type = "image/png") => `data:${type};base64,${b64}`;
        const codec = {
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
                ...codec,
                toDataURL: (data) => b64Wrap(btoa(codec.bytesToString(data))),
                utf8: (data, start, end) => textDecoder.decode(data.subarray(start, end)),
            };
        }
        return {
            ...codec,
            toDataURL: (data) => b64Wrap(br.arrayBufferToBase64(codec.toBuffer(data))),
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
                fetch: (url) => fetch(url, { priority: "low" }).then((response) => {
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
 * @package plugin-codec 解码能力
 */
var pluginImage = definePlugin({
    name: "image",
    dependencies: ["local", "codec"],
    install() {
        const { local, codec } = this;
        const { env } = this.globals;
        const printError = (msg) => console.error(`image error: ${msg}`);
        let genImageSource = (data, _filepath) => (typeof data === "string" ? data : codec.toDataURL(data));
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
                img.crossOrigin = "anonymous";
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
                load: async (createImage, data, filepath) => {
                    // 由于ImageBitmap在图片渲染上有优势，故优先使用
                    if (data instanceof Uint8Array && "createImageBitmap" in globalThis) {
                        try {
                            data = await createImageBitmap(new Blob([codec.toBuffer(data)]));
                        }
                        catch (ex) {
                            printError(ex.message);
                        }
                    }
                    if (data instanceof ImageBitmap) {
                        return data;
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
                    .write(codec.toBuffer(data), filepath)
                    .catch((ex) => {
                    printError(ex.errorMessage || ex.errMsg || ex.message);
                    return codec.toDataURL(data);
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

export { OctopusPlatform, createPlatform, definePlugin, installPlugin, pluginCanvas, pluginCodec, pluginDownload, pluginFsm, pluginImage, pluginIntersectionObserver, pluginNow, pluginOfsCanvas, pluginPath, pluginRaf as pluginRAF, pluginSelector };
//# sourceMappingURL=index.js.map
