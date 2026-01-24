(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports):typeof define==='function'&&define.amd?define(['exports'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.OctopusSvgaAnimator={}));})(this,(function(exports){'use strict';function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? {
            done: true
          } : {
            done: false,
            value: r[n++]
          };
        },
        e: function (r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o,
    a = true,
    u = false;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return a = r.done, r;
    },
    e: function (r) {
      u = true, o = r;
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    }
  };
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = true,
      o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = true, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _regenerator() {
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
  var e,
    t,
    r = "function" == typeof Symbol ? Symbol : {},
    n = r.iterator || "@@iterator",
    o = r.toStringTag || "@@toStringTag";
  function i(r, n, o, i) {
    var c = n && n.prototype instanceof Generator ? n : Generator,
      u = Object.create(c.prototype);
    return _regeneratorDefine(u, "_invoke", function (r, n, o) {
      var i,
        c,
        u,
        f = 0,
        p = o || [],
        y = false,
        G = {
          p: 0,
          n: 0,
          v: e,
          a: d,
          f: d.bind(e, 4),
          d: function (t, r) {
            return i = t, c = 0, u = e, G.n = r, a;
          }
        };
      function d(r, n) {
        for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
          var o,
            i = p[t],
            d = G.p,
            l = i[2];
          r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
        }
        if (o || r > 1) return a;
        throw y = true, n;
      }
      return function (o, p, l) {
        if (f > 1) throw TypeError("Generator is already running");
        for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
          i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
          try {
            if (f = 2, i) {
              if (c || (o = "next"), t = i[o]) {
                if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                if (!t.done) return t;
                u = t.value, c < 2 && (c = 0);
              } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
              i = e;
            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
          } catch (t) {
            i = e, c = 1, u = t;
          } finally {
            f = 1;
          }
        }
        return {
          value: t,
          done: y
        };
      };
    }(r, o, i), true), u;
  }
  var a = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  t = Object.getPrototypeOf;
  var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
      return this;
    }), t),
    u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
  function f(e) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
    return this;
  }), _regeneratorDefine(u, "toString", function () {
    return "[object Generator]";
  }), (_regenerator = function () {
    return {
      w: i,
      m: f
    };
  })();
}
function _regeneratorDefine(e, r, n, t) {
  var i = Object.defineProperty;
  try {
    i({}, "", {});
  } catch (e) {
    i = 0;
  }
  _regeneratorDefine = function (e, r, n, t) {
    function o(r, n) {
      _regeneratorDefine(e, r, function (e) {
        return this._invoke(r, n, e);
      });
    }
    r ? i ? i(e, r, {
      value: n,
      enumerable: !t,
      configurable: !t,
      writable: !t
    }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
  }, _regeneratorDefine(e, r, n, t);
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}const noop = (() => { });

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
});var platform = createPlatform([pluginSelector, pluginCanvas, pluginOfsCanvas, pluginCodec, pluginDownload, pluginFsm, pluginImage, pluginNow, pluginPath, pluginRaf], "2.0.0");
var ResourceManager = /*#__PURE__*/function () {
  function ResourceManager(painter) {
    _classCallCheck(this, ResourceManager);
    _defineProperty(this, "painter", void 0);
    // 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
    _defineProperty(this, "caches", []);
    /**
     * 动态素材
     */
    _defineProperty(this, "dynamicMaterials", new Map());
    /**
     * 素材
     */
    _defineProperty(this, "materials", new Map());
    /**
     * 已清理Image对象的坐标
     */
    _defineProperty(this, "point", 0);
    this.painter = painter;
  }
  /**
   * 创建图片标签
   * @returns
   */
  return _createClass(ResourceManager, [{
    key: "createImage",
    value: function createImage() {
      var img = null;
      if (this.point > 0) {
        this.point--;
        img = this.caches.shift();
      }
      if (!img) {
        img = platform.image.create(this.painter.F);
      }
      this.caches.push(img);
      return img;
    }
    /**
     * 将 ImageBitmap 插入到 caches
     * @param img
     */
  }, {
    key: "inertBitmapIntoCaches",
    value: function inertBitmapIntoCaches(img) {
      if (ResourceManager.isBitmap(img)) {
        this.caches.push(img);
      }
    }
    /**
     * 加载额外的图片资源
     * @param source 资源内容/地址
     * @param filename 文件名称
     * @returns
     */
  }, {
    key: "loadExtImage",
    value: function loadExtImage(source, filename) {
      var _this = this;
      return platform.image.load(function () {
        return _this.createImage();
      }, source, platform.path.resolve(filename, "ext")).then(function (img) {
        _this.inertBitmapIntoCaches(img);
        return img;
      });
    }
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
  }, {
    key: "loadImagesWithRecord",
    value: (function () {
      var _loadImagesWithRecord = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(images, filename) {
        var _this2 = this;
        var type,
          imageAwaits,
          imageFilename,
          _args = arguments;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              type = _args.length > 2 && _args[2] !== undefined ? _args[2] : "normal";
              imageAwaits = [];
              imageFilename = "".concat(filename.replace(/\.svga$/g, ""), ".png");
              Object.entries(images).forEach(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                  name = _ref2[0],
                  image = _ref2[1];
                // 过滤 1px 透明图
                if (image instanceof Uint8Array && image.byteLength < 70) {
                  return;
                }
                var p = platform.image.load(function () {
                  return _this2.createImage();
                }, image, platform.path.resolve(imageFilename, type === "dynamic" ? "dyn_".concat(name) : name)).then(function (img) {
                  _this2.inertBitmapIntoCaches(img);
                  if (type === "dynamic") {
                    _this2.dynamicMaterials.set(name, img);
                  } else {
                    _this2.materials.set(name, img);
                  }
                });
                imageAwaits.push(p);
              });
              _context.n = 1;
              return Promise.all(imageAwaits);
            case 1:
              return _context.a(2);
          }
        }, _callee);
      }));
      function loadImagesWithRecord(_x, _x2) {
        return _loadImagesWithRecord.apply(this, arguments);
      }
      return loadImagesWithRecord;
    }()
    /**
     * 释放图片资源
     */
    )
  }, {
    key: "release",
    value: function release() {
      // 小程序 image 对象需要手动释放内存，否则可能导致小程序崩溃
      var _iterator = _createForOfIteratorHelper(this.caches),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var img = _step.value;
          ResourceManager.releaseOne(img);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.materials.clear();
      this.dynamicMaterials.clear();
      // 支付宝小程序 image 修改 src 无法触发 onload 事件
      platform.globals.env === "alipay" ? this.cleanup() : this.tidyUp();
    }
    /**
     * 整理图片资源，将重复的图片资源移除
     */
  }, {
    key: "tidyUp",
    value: function tidyUp() {
      // 通过 Set 的去重特性，保持 caches 元素的唯一性
      this.caches = Array.from(new Set(this.caches));
      this.point = this.caches.length;
    }
    /**
     * 清理图片资源
     */
  }, {
    key: "cleanup",
    value: function cleanup() {
      this.caches.length = 0;
      this.point = 0;
    }
  }], [{
    key: "isBitmap",
    value:
    /**
     * 判断是否是 ImageBitmap
     * @param img
     * @returns
     */
    function isBitmap(img) {
      return platform.globals.env === "h5" && img instanceof ImageBitmap;
    }
    /**
     * 释放内存资源（图片）
     * @param img
     */
  }, {
    key: "releaseOne",
    value: function releaseOne(img) {
      if (ResourceManager.isBitmap(img)) {
        img.close();
      } else if (img.src !== "") {
        // 将存在本地的文件删除，防止用户空间被占满
        if (platform.path.is(img.src)) {
          platform.local.remove(img.src);
        }
        platform.image.release(img);
      }
    }
  }]);
}();
function readFloatLEImpl() {
  // 使用静态DataView池
  var DATA_VIEW_POOL_SIZE = 4;
  var dataViewPool = Array(DATA_VIEW_POOL_SIZE).fill(0).map(function () {
    return new DataView(new ArrayBuffer(8));
  }); // 使用8字节支持double
  var currentViewIndex = 0;
  return function readFloatLE(buf, pos) {
    if (pos < 0 || pos + 4 > buf.length) throw new RangeError("Index out of range");
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
var Preflight = /*#__PURE__*/function () {
  function Preflight() {
    _classCallCheck(this, Preflight);
    _defineProperty(this, "caches", new Map());
    _defineProperty(this, "count", 0);
  }
  return _createClass(Preflight, [{
    key: "size",
    get: function get() {
      return this.caches.size;
    }
  }, {
    key: "hitCount",
    get: function get() {
      return this.count;
    }
    // get cache() {
    //   return Object.fromEntries(this.caches);
    // }
    /**
     * 计算二进制数据的哈希值
     * @param reader Reader对象
     * @param end 结束位置
     * @returns 哈希值
     */
  }, {
    key: "calculate",
    value: function calculate(reader, end) {
      // 保存原始位置
      var startPos = reader.pos,
        buf = reader.buf;
      var endPos = Math.min(end, reader.len);
      // 采样数据以加快计算速度，同时保持足够的唯一性
      // 对于大数据，每隔几个字节采样一次
      var step = Math.max(1, Math.floor((endPos - startPos) / 100));
      return calculateHash(buf, startPos, endPos, step);
    }
    /**
     * 检查是否存在缓存数据
     * @param key 键
     * @returns 是否存在
     */
  }, {
    key: "has",
    value: function has(key) {
      var hit = this.caches.has(key);
      if (hit) {
        this.count++;
      }
      return hit;
      // return this.caches.has(key);
    }
    /**
     * 获取缓存数据
     * @param key 键
     * @returns 缓存数据
     */
  }, {
    key: "get",
    value: function get(key) {
      return this.caches.get(key);
    }
    /**
     * 设置缓存数据
     * @param key 键
     * @param value 缓存数据
     */
  }, {
    key: "set",
    value: function set(key, value) {
      this.caches.set(key, value);
    }
    /**
     * 清空所有缓存数据
     */
  }, {
    key: "clear",
    value: function clear() {
      this.count = 0;
      this.caches.clear();
    }
  }]);
}();
var Reader = /*#__PURE__*/function () {
  /**
   * Constructs a new reader instance using the specified buffer.
   * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
   * @constructor
   * @param {Uint8Array} buffer Buffer to read from
   */
  function Reader(buffer) {
    _classCallCheck(this, Reader);
    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    _defineProperty(this, "buf", void 0);
    /**
     * Read buffer length.
     * @type {number}
     */
    _defineProperty(this, "len", void 0);
    /**
     * Read buffer position.
     * @type {number}
     */
    _defineProperty(this, "pos", void 0);
    _defineProperty(this, "preflight", new Preflight());
    this.buf = buffer;
    this.pos = 0;
    this.len = buffer.length;
  }
  return _createClass(Reader, [{
    key: "indexOutOfRange",
    value: function indexOutOfRange(reader, writeLength) {
      return new RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
    }
    /**
     * 将复杂逻辑分离到单独方法
     * @returns
     */
  }, {
    key: "readVarint32Slow",
    value: function readVarint32Slow() {
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
    }
    /**
     * Reads a sequence of bytes preceded by its length as a varint.
     * @param length
     * @returns
     */
  }, {
    key: "end",
    value: function end(length) {
      return length === undefined ? this.len : this.pos + length;
    }
    /**
     * Reads a varint as an unsigned 32 bit value.
     * @function
     * @returns {number} Value read
     */
  }, {
    key: "uint32",
    value: function uint32() {
      // 快速路径：大多数情况下是单字节
      var byte = this.buf[this.pos];
      if (byte < 128) {
        this.pos++;
        return byte;
      }
      // 慢速路径：多字节处理
      return this.readVarint32Slow();
    }
    /**
     * Reads a varint as a signed 32 bit value.
     * @returns {number} Value read
     */
  }, {
    key: "int32",
    value: function int32() {
      return this.uint32() | 0;
    }
    /**
     * Reads a float (32 bit) as a number.
     * @function
     * @returns {number} Value read
     */
  }, {
    key: "float",
    value: function float() {
      var pos = this.pos + 4;
      if (pos > this.len) {
        throw this.indexOutOfRange(this, 4);
      }
      var value = readFloatLE(this.buf, this.pos);
      this.pos = pos;
      return value;
    }
    /**
     * read bytes range
     * @returns
     */
  }, {
    key: "getBytesRange",
    value: function getBytesRange() {
      var length = this.uint32();
      var start = this.pos;
      var end = start + length;
      if (end > this.len) {
        throw this.indexOutOfRange(this, length);
      }
      return [start, end, length];
    }
    /**
     * Reads a sequence of bytes preceded by its length as a varint.
     * @returns {Uint8Array} Value read
     */
  }, {
    key: "bytes",
    value: function bytes() {
      var _this$getBytesRange = this.getBytesRange(),
        _this$getBytesRange2 = _slicedToArray(_this$getBytesRange, 3),
        start = _this$getBytesRange2[0],
        end = _this$getBytesRange2[1],
        length = _this$getBytesRange2[2];
      this.pos += length;
      if (length === 0) {
        return Reader.EMPTY_UINT8ARRAY;
      }
      return this.buf.subarray(start, end);
    }
    /**
     * Reads a string preceeded by its byte length as a varint.
     * @returns {string} Value read
     */
  }, {
    key: "string",
    value: function string() {
      var _this$getBytesRange3 = this.getBytesRange(),
        _this$getBytesRange4 = _slicedToArray(_this$getBytesRange3, 2),
        start = _this$getBytesRange4[0],
        end = _this$getBytesRange4[1];
      // 直接在原始buffer上解码，避免创建中间bytes对象
      var result = platform.codec.utf8(this.buf, start, end);
      this.pos = end;
      return result;
    }
    /**
     * Skips the specified number of bytes if specified, otherwise skips a varint.
     * @param {number} [length] Length if known, otherwise a varint is assumed
     * @returns {Reader} `this`
     */
  }, {
    key: "skip",
    value: function skip(length) {
      if (typeof length === "number") {
        if (this.pos + length > this.len) {
          throw this.indexOutOfRange(this, length);
        }
        this.pos += length;
        return this;
      }
      // 变长整数跳过优化 - 使用位运算
      var buf = this.buf,
        len = this.len;
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
    }
    /**
     * Skips the next element of the specified wire type.
     * @param {number} wireType Wire type received
     * @returns {Reader} `this`
     */
  }, {
    key: "skipType",
    value: function skipType(wireType) {
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
    }
  }]);
}();
// 添加静态缓存，用于常用的空数组
_defineProperty(Reader, "EMPTY_UINT8ARRAY", new Uint8Array(0));
var Layout = /*#__PURE__*/function () {
  function Layout() {
    _classCallCheck(this, Layout);
    /**
     * Layout x.
     * @member {number} x
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    _defineProperty(this, "x", 0);
    /**
     * Layout y.
     * @member {number} y
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    _defineProperty(this, "y", 0);
    /**
     * Layout width.
     * @member {number} width
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    _defineProperty(this, "width", 0);
    /**
     * Layout height.
     * @member {number} height
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    _defineProperty(this, "height", 0);
  }
  return _createClass(Layout, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
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
          case 1:
            {
              message.x = reader.float();
              break;
            }
          case 2:
            {
              message.y = reader.float();
              break;
            }
          case 3:
            {
              message.width = reader.float();
              break;
            }
          case 4:
            {
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
    }
  }, {
    key: "format",
    value: function format(message) {
      var _message$x = message.x,
        x = _message$x === void 0 ? 0 : _message$x,
        _message$y = message.y,
        y = _message$y === void 0 ? 0 : _message$y,
        _message$width = message.width,
        width = _message$width === void 0 ? 0 : _message$width,
        _message$height = message.height,
        height = _message$height === void 0 ? 0 : _message$height;
      return {
        x: x,
        y: y,
        width: width,
        height: height
      };
    }
  }]);
}();
var Transform = /*#__PURE__*/function () {
  function Transform() {
    _classCallCheck(this, Transform);
    /**
     * Transform a.
     * @member {number} a
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    _defineProperty(this, "a", 0);
    /**
     * Transform b.
     * @member {number} b
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    _defineProperty(this, "b", 0);
    /**
     * Transform c.
     * @member {number} c
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    _defineProperty(this, "c", 0);
    /**
     * Transform d.
     * @member {number} d
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    _defineProperty(this, "d", 0);
    /**
     * Transform tx.
     * @member {number} tx
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    _defineProperty(this, "tx", 0);
    /**
     * Transform ty.
     * @member {number} ty
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    _defineProperty(this, "ty", 0);
  }
  return _createClass(Transform, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
      var end = reader.end(length);
      var message = new Transform();
      var tag;
      while (reader.pos < end) {
        tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            {
              message.a = reader.float();
              break;
            }
          case 2:
            {
              message.b = reader.float();
              break;
            }
          case 3:
            {
              message.c = reader.float();
              break;
            }
          case 4:
            {
              message.d = reader.float();
              break;
            }
          case 5:
            {
              message.tx = reader.float();
              break;
            }
          case 6:
            {
              message.ty = reader.float();
              break;
            }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }]);
}();
var ShapeArgs = /*#__PURE__*/function () {
  function ShapeArgs() {
    _classCallCheck(this, ShapeArgs);
    /**
     * ShapeArgs d.
     * @member {string} d
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @instance
     */
    _defineProperty(this, "d", "");
  }
  return _createClass(ShapeArgs, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
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
          case 1:
            {
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
    }
  }]);
}();
var RectArgs = /*#__PURE__*/function () {
  function RectArgs() {
    _classCallCheck(this, RectArgs);
    /**
     * RectArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    _defineProperty(this, "x", 0);
    /**
     * RectArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    _defineProperty(this, "y", 0);
    /**
     * RectArgs width.
     * @member {number} width
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    _defineProperty(this, "width", 0);
    /**
     * RectArgs height.
     * @member {number} height
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    _defineProperty(this, "height", 0);
    /**
     * RectArgs cornerRadius.
     * @member {number} cornerRadius
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    _defineProperty(this, "cornerRadius", 0);
  }
  return _createClass(RectArgs, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
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
          case 1:
            {
              message.x = reader.float();
              break;
            }
          case 2:
            {
              message.y = reader.float();
              break;
            }
          case 3:
            {
              message.width = reader.float();
              break;
            }
          case 4:
            {
              message.height = reader.float();
              break;
            }
          case 5:
            {
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
    }
  }]);
}();
var EllipseArgs = /*#__PURE__*/function () {
  function EllipseArgs() {
    _classCallCheck(this, EllipseArgs);
    /**
     * EllipseArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    _defineProperty(this, "x", 0);
    /**
     * EllipseArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    _defineProperty(this, "y", 0);
    /**
     * EllipseArgs radiusX.
     * @member {number} radiusX
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    _defineProperty(this, "radiusX", 0);
    /**
     * EllipseArgs radiusY.
     * @member {number} radiusY
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    _defineProperty(this, "radiusY", 0);
  }
  return _createClass(EllipseArgs, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
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
          case 1:
            {
              message.x = reader.float();
              break;
            }
          case 2:
            {
              message.y = reader.float();
              break;
            }
          case 3:
            {
              message.radiusX = reader.float();
              break;
            }
          case 4:
            {
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
    }
  }]);
}();
var RGBAColor = /*#__PURE__*/function () {
  function RGBAColor() {
    _classCallCheck(this, RGBAColor);
    /**
     * RGBAColor r.
     * @member {number} r
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    _defineProperty(this, "r", 0);
    /**
     * RGBAColor g.
     * @member {number} g
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    _defineProperty(this, "g", 0);
    /**
     * RGBAColor b.
     * @member {number} b
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    _defineProperty(this, "b", 0);
    /**
     * RGBAColor a.
     * @member {number} a
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    _defineProperty(this, "a", 0);
  }
  return _createClass(RGBAColor, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
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
          case 1:
            {
              message.r = reader.float();
              break;
            }
          case 2:
            {
              message.g = reader.float();
              break;
            }
          case 3:
            {
              message.b = reader.float();
              break;
            }
          case 4:
            {
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
    }
  }, {
    key: "format",
    value: function format(message) {
      var r = message.r,
        g = message.g,
        b = message.b,
        a = message.a;
      return "rgba(".concat(r * 255 | 0, ", ").concat(g * 255 | 0, ", ").concat(b * 255 | 0, ", ").concat(a * 1 | 0, ")");
    }
  }]);
}();
var ShapeStyle = /*#__PURE__*/function () {
  function ShapeStyle() {
    _classCallCheck(this, ShapeStyle);
    /**
     * ShapeStyle fill.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} fill
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    _defineProperty(this, "fill", null);
    /**
     * ShapeStyle stroke.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} stroke
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    _defineProperty(this, "stroke", null);
    /**
     * ShapeStyle strokeWidth.
     * @member {number} strokeWidth
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    _defineProperty(this, "strokeWidth", 0);
    /**
     * ShapeStyle lineCap.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap} lineCap
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    _defineProperty(this, "lineCap", 0);
    /**
     * ShapeStyle lineJoin.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin} lineJoin
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    _defineProperty(this, "lineJoin", 0);
    /**
     * ShapeStyle miterLimit.
     * @member {number} miterLimit
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    _defineProperty(this, "miterLimit", 0);
    /**
     * ShapeStyle lineDashI.
     * @member {number} lineDashI
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    _defineProperty(this, "lineDashI", 0);
    /**
     * ShapeStyle lineDashII.
     * @member {number} lineDashII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    _defineProperty(this, "lineDashII", 0);
    /**
     * ShapeStyle lineDashIII.
     * @member {number} lineDashIII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    _defineProperty(this, "lineDashIII", 0);
  }
  return _createClass(ShapeStyle, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
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
          case 1:
            {
              message.fill = RGBAColor.decode(reader, reader.uint32());
              break;
            }
          case 2:
            {
              message.stroke = RGBAColor.decode(reader, reader.uint32());
              break;
            }
          case 3:
            {
              message.strokeWidth = reader.float();
              break;
            }
          case 4:
            {
              message.lineCap = reader.int32();
              break;
            }
          case 5:
            {
              message.lineJoin = reader.int32();
              break;
            }
          case 6:
            {
              message.miterLimit = reader.float();
              break;
            }
          case 7:
            {
              message.lineDashI = reader.float();
              break;
            }
          case 8:
            {
              message.lineDashII = reader.float();
              break;
            }
          case 9:
            {
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
    }
  }, {
    key: "format",
    value: function format(message) {
      var fill = message.fill,
        stroke = message.stroke,
        strokeWidth = message.strokeWidth,
        miterLimit = message.miterLimit,
        lineDashI = message.lineDashI,
        lineDashII = message.lineDashII,
        lineDashIII = message.lineDashIII;
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
    }
  }]);
}();
var ShapeEntity = /*#__PURE__*/function () {
  function ShapeEntity() {
    _classCallCheck(this, ShapeEntity);
    /**
     * ShapeEntity type.
     * @member {com.opensource.svga.ShapeEntity.ShapeType} type
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    _defineProperty(this, "type", 0);
    /**
     * ShapeEntity shape.
     * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    _defineProperty(this, "shape", null);
    /**
     * ShapeEntity rect.
     * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    _defineProperty(this, "rect", null);
    /**
     * ShapeEntity ellipse.
     * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    _defineProperty(this, "ellipse", null);
    /**
     * ShapeEntity styles.
     * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    _defineProperty(this, "styles", null);
    /**
     * ShapeEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    _defineProperty(this, "transform", null);
  }
  return _createClass(ShapeEntity, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
      var end = reader.end(length);
      var message = new ShapeEntity();
      var tag;
      while (reader.pos < end) {
        tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            {
              message.type = reader.int32();
              break;
            }
          case 2:
            {
              message.shape = ShapeArgs.decode(reader, reader.uint32());
              break;
            }
          case 3:
            {
              message.rect = RectArgs.decode(reader, reader.uint32());
              break;
            }
          case 4:
            {
              message.ellipse = EllipseArgs.decode(reader, reader.uint32());
              break;
            }
          case 10:
            {
              message.styles = ShapeStyle.decode(reader, reader.uint32());
              break;
            }
          case 11:
            {
              message.transform = Transform.decode(reader, reader.uint32());
              break;
            }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return ShapeEntity.format(message);
    }
  }, {
    key: "format",
    value: function format(message) {
      var type = message.type,
        shape = message.shape,
        rect = message.rect,
        ellipse = message.ellipse,
        styles = message.styles,
        transform = message.transform;
      switch (type) {
        case 0 /* PlatformVideo.SHAPE_TYPE_CODE.SHAPE */:
          return {
            type: "shape" /* PlatformVideo.SHAPE_TYPE.SHAPE */,
            path: shape,
            styles: styles,
            transform: transform
          };
        case 1 /* PlatformVideo.SHAPE_TYPE_CODE.RECT */:
          return {
            type: "rect" /* PlatformVideo.SHAPE_TYPE.RECT */,
            path: rect,
            styles: styles,
            transform: transform
          };
        case 2 /* PlatformVideo.SHAPE_TYPE_CODE.ELLIPSE */:
          return {
            type: "ellipse" /* PlatformVideo.SHAPE_TYPE.ELLIPSE */,
            path: ellipse,
            styles: styles,
            transform: transform
          };
      }
      return null;
    }
  }]);
}();
var FrameEntity = /*#__PURE__*/function () {
  function FrameEntity() {
    _classCallCheck(this, FrameEntity);
    /**
     * FrameEntity shapes.
     * @member {Array.<com.opensource.svga.IShapeEntity>} shapes
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    _defineProperty(this, "shapes", []);
    /**
     * FrameEntity alpha.
     * @member {number} alpha
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    _defineProperty(this, "alpha", 0);
    /**
     * FrameEntity layout.
     * @member {com.opensource.svga.ILayout|null|undefined} layout
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    _defineProperty(this, "layout", null);
    /**
     * FrameEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    _defineProperty(this, "transform", null);
    /**
     * FrameEntity clipPath.
     * @member {string} clipPath
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    _defineProperty(this, "clipPath", "");
  }
  return _createClass(FrameEntity, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
      var end = reader.end(length);
      var message = new FrameEntity();
      var tag;
      while (reader.pos < end) {
        tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            {
              message.alpha = reader.float();
              break;
            }
          case 2:
            {
              message.layout = Layout.decode(reader, reader.uint32());
              break;
            }
          case 3:
            {
              message.transform = Transform.decode(reader, reader.uint32());
              break;
            }
          case 4:
            {
              message.clipPath = reader.string();
              break;
            }
          case 5:
            {
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
      } else {
        reader.preflight.set("latest_shapes", message.shapes);
      }
      return FrameEntity.format(message);
    }
  }, {
    key: "format",
    value: function format(message) {
      // alpha值小于 0.05 将不展示，所以不做解析处理
      if (message.alpha < 0.05) {
        return FrameEntity.HIDDEN_FRAME;
      }
      var alpha = message.alpha,
        layout = message.layout,
        transform = message.transform,
        shapes = message.shapes;
      return {
        alpha: alpha,
        layout: layout,
        transform: transform,
        shapes: shapes
      };
    }
  }]);
}();
_defineProperty(FrameEntity, "HIDDEN_FRAME", {
  alpha: 0
});
var SpriteEntity = /*#__PURE__*/function () {
  function SpriteEntity() {
    _classCallCheck(this, SpriteEntity);
    /**
     * SpriteEntity frames.
     * @member {Array.<com.opensource.svga.IFrameEntity>} frames
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    _defineProperty(this, "frames", []);
    /**
     * SpriteEntity imageKey.
     * @member {string} imageKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    _defineProperty(this, "imageKey", "");
    /**
     * SpriteEntity matteKey.
     * @member {string} matteKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    _defineProperty(this, "matteKey", "");
  }
  return _createClass(SpriteEntity, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
      var end = reader.end(length);
      var message = new SpriteEntity();
      var tag;
      reader.preflight.set("latest_shapes", []);
      while (reader.pos < end) {
        tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            {
              message.imageKey = reader.string();
              break;
            }
          case 2:
            {
              if (!(message.frames && message.frames.length)) {
                message.frames = [];
              }
              message.frames.push(FrameEntity.decode(reader, reader.uint32()));
              break;
            }
          case 3:
            {
              message.matteKey = reader.string();
              break;
            }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return SpriteEntity.format(message);
    }
  }, {
    key: "format",
    value: function format(message) {
      return {
        imageKey: message.imageKey,
        frames: message.frames
      };
    }
  }]);
}();
var MovieParams = /*#__PURE__*/function () {
  function MovieParams() {
    _classCallCheck(this, MovieParams);
    /**
     * MovieParams viewBoxWidth.
     * @member {number} viewBoxWidth
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    _defineProperty(this, "viewBoxWidth", 0);
    /**
     * MovieParams viewBoxHeight.
     * @member {number} viewBoxHeight
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    _defineProperty(this, "viewBoxHeight", 0);
    /**
     * MovieParams fps.
     * @member {number} fps
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    _defineProperty(this, "fps", 0);
    /**
     * MovieParams frames.
     * @member {number} frames
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    _defineProperty(this, "frames", 0);
  }
  return _createClass(MovieParams, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
      var end = reader.end(length);
      var message = new MovieParams();
      var tag;
      while (reader.pos < end) {
        tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            {
              message.viewBoxWidth = reader.float();
              break;
            }
          case 2:
            {
              message.viewBoxHeight = reader.float();
              break;
            }
          case 3:
            {
              message.fps = reader.int32();
              break;
            }
          case 4:
            {
              message.frames = reader.int32();
              break;
            }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }]);
}();
var MovieEntity = /*#__PURE__*/function () {
  function MovieEntity() {
    _classCallCheck(this, MovieEntity);
    /**
     * MovieEntity version.
     * @member {string} version
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    _defineProperty(this, "version", "");
    /**
     * MovieEntity params.
     * @member {com.opensource.svga.IMovieParams|null|undefined} params
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    _defineProperty(this, "params", null);
    /**
     * MovieEntity images.
     * @member {Object.<string,Uint8Array>} images
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    _defineProperty(this, "images", {});
    /**
     * MovieEntity sprites.
     * @member {Array.<com.opensource.svga.ISpriteEntity>} sprites
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    _defineProperty(this, "sprites", []);
  }
  return _createClass(MovieEntity, null, [{
    key: "decode",
    value:
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
    function decode(reader, length) {
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
          case 1:
            {
              message.version = reader.string();
              break;
            }
          case 2:
            {
              message.params = MovieParams.decode(reader, reader.uint32());
              break;
            }
          case 3:
            {
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
          case 4:
            {
              message.sprites.push(SpriteEntity.decode(reader, reader.uint32()));
              break;
            }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return MovieEntity.format(message);
    }
  }, {
    key: "format",
    value: function format(message) {
      var version = message.version,
        images = message.images,
        sprites = message.sprites;
      var _message$params = message.params,
        fps = _message$params.fps,
        frames = _message$params.frames,
        viewBoxWidth = _message$params.viewBoxWidth,
        viewBoxHeight = _message$params.viewBoxHeight;
      return {
        version: version,
        filename: "",
        locked: false,
        dynamicElements: {},
        size: {
          width: viewBoxWidth,
          height: viewBoxHeight
        },
        fps: fps,
        frames: frames,
        images: images,
        sprites: sprites
      };
    }
  }]);
}(); // import benchmark from "octopus-benchmark";
_defineProperty(MovieEntity, "EMPTY_U8", new Uint8Array(0));
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
var PointPool = /*#__PURE__*/function () {
  function PointPool() {
    _classCallCheck(this, PointPool);
    _defineProperty(this, "pool", []);
  }
  return _createClass(PointPool, [{
    key: "acquire",
    value: function acquire() {
      var pool = this.pool;
      return pool.length > 0 ? pool.pop() : {
        x: 0,
        y: 0,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
      };
    }
  }, {
    key: "release",
    value: function release(point) {
      // 重置点的属性
      point.x = point.y = point.x1 = point.y1 = point.x2 = point.y2 = 0;
      this.pool.push(point);
    }
  }]);
}();
var Renderer2D = /*#__PURE__*/function () {
  function Renderer2D(context) {
    _classCallCheck(this, Renderer2D);
    _defineProperty(this, "context", void 0);
    _defineProperty(this, "pointPool", new PointPool());
    _defineProperty(this, "currentPoint", void 0);
    _defineProperty(this, "lastResizeKey", "");
    _defineProperty(this, "globalTransform", undefined);
    this.context = context;
    this.currentPoint = this.pointPool.acquire();
  }
  return _createClass(Renderer2D, [{
    key: "setTransform",
    value: function setTransform(transform) {
      if (transform && this.context) {
        this.context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
      }
    }
  }, {
    key: "drawBezier",
    value: function drawBezier(d, transform, styles) {
      var context = this.context,
        pointPool = this.pointPool;
      this.currentPoint = pointPool.acquire();
      context.save();
      Renderer2D.resetShapeStyles(context, styles);
      this.setTransform(transform);
      context.beginPath();
      if (d) {
        // 使用状态机解析器替代正则表达式
        var commands = Renderer2D.parseSVGPath(d);
        var _iterator2 = _createForOfIteratorHelper(commands),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _step2$value = _step2.value,
              command = _step2$value.command,
              args = _step2$value.args;
            if (Renderer2D.SVG_PATH.has(command)) {
              this.drawBezierElement(this.currentPoint, command, args.split(/[\s,]+/).filter(Boolean));
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
      Renderer2D.fillOrStroke(context, styles);
      pointPool.release(this.currentPoint);
      context.restore();
    }
  }, {
    key: "drawBezierElement",
    value: function drawBezierElement(currentPoint, method, args) {
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
          if (currentPoint.x1 !== undefined && currentPoint.y1 !== undefined && currentPoint.x2 !== undefined && currentPoint.y2 !== undefined) {
            currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
            currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
            currentPoint.x2 = +args[0];
            currentPoint.y2 = +args[1];
            currentPoint.x = +args[2];
            currentPoint.y = +args[3];
            context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
          } else {
            currentPoint.x1 = +args[0];
            currentPoint.y1 = +args[1];
            currentPoint.x = +args[2];
            currentPoint.y = +args[3];
            context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
          }
          break;
        case "s":
          if (currentPoint.x1 !== undefined && currentPoint.y1 !== undefined && currentPoint.x2 !== undefined && currentPoint.y2 !== undefined) {
            currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
            currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
            currentPoint.x2 = currentPoint.x + +args[0];
            currentPoint.y2 = currentPoint.y + +args[1];
            currentPoint.x += +args[2];
            currentPoint.y += +args[3];
            context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
          } else {
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
    }
  }, {
    key: "drawEllipse",
    value: function drawEllipse(x, y, radiusX, radiusY, transform, styles) {
      var context = this.context;
      context.save();
      Renderer2D.resetShapeStyles(context, styles);
      this.setTransform(transform);
      x -= radiusX;
      y -= radiusY;
      var w = radiusX * 2;
      var h = radiusY * 2;
      var kappa = 0.5522848;
      var ox = w / 2 * kappa;
      var oy = h / 2 * kappa;
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
    }
  }, {
    key: "drawRect",
    value: function drawRect(x, y, width, height, cornerRadius, transform, styles) {
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
    }
  }, {
    key: "drawShape",
    value: function drawShape(shape) {
      var _path$x, _path$y, _path$radiusX, _path$radiusY, _path$x2, _path$y2, _path$width, _path$height, _path$cornerRadius;
      var type = shape.type,
        path = shape.path,
        transform = shape.transform,
        styles = shape.styles;
      switch (type) {
        case "shape" /* PlatformVideo.SHAPE_TYPE.SHAPE */:
          this.drawBezier(path.d, transform, styles);
          break;
        case "ellipse" /* PlatformVideo.SHAPE_TYPE.ELLIPSE */:
          this.drawEllipse((_path$x = path.x) !== null && _path$x !== void 0 ? _path$x : 0, (_path$y = path.y) !== null && _path$y !== void 0 ? _path$y : 0, (_path$radiusX = path.radiusX) !== null && _path$radiusX !== void 0 ? _path$radiusX : 0, (_path$radiusY = path.radiusY) !== null && _path$radiusY !== void 0 ? _path$radiusY : 0, transform, styles);
          break;
        case "rect" /* PlatformVideo.SHAPE_TYPE.RECT */:
          this.drawRect((_path$x2 = path.x) !== null && _path$x2 !== void 0 ? _path$x2 : 0, (_path$y2 = path.y) !== null && _path$y2 !== void 0 ? _path$y2 : 0, (_path$width = path.width) !== null && _path$width !== void 0 ? _path$width : 0, (_path$height = path.height) !== null && _path$height !== void 0 ? _path$height : 0, (_path$cornerRadius = path.cornerRadius) !== null && _path$cornerRadius !== void 0 ? _path$cornerRadius : 0, transform, styles);
          break;
      }
    }
  }, {
    key: "drawSprite",
    value: function drawSprite(frame, bitmap, dynamicElement) {
      if (frame.alpha === 0) return;
      var context = this.context;
      var alpha = frame.alpha,
        transform = frame.transform,
        layout = frame.layout,
        shapes = frame.shapes;
      var _ref3 = transform !== null && transform !== void 0 ? transform : {},
        _ref3$a = _ref3.a,
        a = _ref3$a === void 0 ? 1 : _ref3$a,
        _ref3$b = _ref3.b,
        b = _ref3$b === void 0 ? 0 : _ref3$b,
        _ref3$c = _ref3.c,
        c = _ref3$c === void 0 ? 0 : _ref3$c,
        _ref3$d = _ref3.d,
        d = _ref3$d === void 0 ? 1 : _ref3$d,
        _ref3$tx = _ref3.tx,
        tx = _ref3$tx === void 0 ? 0 : _ref3$tx,
        _ref3$ty = _ref3.ty,
        ty = _ref3$ty === void 0 ? 0 : _ref3$ty;
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
    }
    /**
     * 调整画布尺寸
     * @param contentMode
     * @param videoSize
     * @param canvasSize
     * @returns
     */
  }, {
    key: "resize",
    value: function resize(contentMode, videoSize, canvasSize) {
      var canvasWidth = canvasSize.width,
        canvasHeight = canvasSize.height;
      var videoWidth = videoSize.width,
        videoHeight = videoSize.height;
      var resizeKey = "".concat(contentMode, "-").concat(videoWidth, "-").concat(videoHeight, "-").concat(canvasWidth, "-").concat(canvasHeight);
      var lastTransform = this.globalTransform;
      if (this.lastResizeKey === resizeKey && lastTransform) {
        return;
      }
      var scale = {
        scaleX: 1,
        scaleY: 1,
        translateX: 0,
        translateY: 0
      };
      if (contentMode === "fill" /* PLAYER_CONTENT_MODE.FILL */) {
        scale.scaleX = canvasWidth / videoWidth;
        scale.scaleY = canvasHeight / videoHeight;
      } else {
        scale = Renderer2D.calculateScale(contentMode, videoSize, canvasSize);
      }
      this.lastResizeKey = resizeKey;
      this.globalTransform = {
        a: scale.scaleX,
        b: 0.0,
        c: 0.0,
        d: scale.scaleY,
        tx: scale.translateX,
        ty: scale.translateY
      };
    }
  }, {
    key: "render",
    value: function render(videoEntity, materials, dynamicMaterials, currentFrame, head, tail) {
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
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.globalTransform = undefined;
      this.lastResizeKey = "";
      this.context = null;
    }
  }], [{
    key: "parseSVGPath",
    value:
    // 在Renderer2D类中添加新的解析方法
    function parseSVGPath(d) {
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
          case 0:
            // 等待命令
            if (SVG_LETTER_REGEXP.test(char)) {
              currentCommand = char;
              state = 1;
            }
            break;
          case 1:
            // 读取参数
            if (SVG_LETTER_REGEXP.test(char)) {
              // 遇到新命令，保存当前命令和参数
              result.push({
                command: currentCommand,
                args: currentArgs.trim()
              });
              currentCommand = char;
              currentArgs = "";
            } else {
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
          args: currentArgs.trim()
        });
      }
      return result;
    }
  }, {
    key: "fillOrStroke",
    value: function fillOrStroke(context, styles) {
      if (styles) {
        if (styles.fill) {
          context.fill();
        }
        if (styles.stroke) {
          context.stroke();
        }
      }
    }
  }, {
    key: "resetShapeStyles",
    value: function resetShapeStyles(context, styles) {
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
    }
    /**
     * 计算缩放比例
     * @param contentMode
     * @param videoSize
     * @param canvasSize
     * @returns
     */
  }, {
    key: "calculateScale",
    value: function calculateScale(contentMode, videoSize, canvasSize) {
      var imageRatio = videoSize.width / videoSize.height;
      var viewRatio = canvasSize.width / canvasSize.height;
      var isAspectFit = contentMode === "aspect-fit" /* PLAYER_CONTENT_MODE.ASPECT_FIT */;
      var shouldUseWidth = imageRatio >= viewRatio && isAspectFit || imageRatio <= viewRatio && !isAspectFit;
      var createTransform = function createTransform(scale, translateX, translateY) {
        return {
          scaleX: scale,
          scaleY: scale,
          translateX: translateX,
          translateY: translateY
        };
      };
      if (shouldUseWidth) {
        var _scale = canvasSize.width / videoSize.width;
        return createTransform(_scale, 0, (canvasSize.height - videoSize.height * _scale) / 2);
      }
      var scale = canvasSize.height / videoSize.height;
      return createTransform(scale, (canvasSize.width - videoSize.width * scale) / 2, 0);
    }
  }]);
}();
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
_defineProperty(Renderer2D, "SVG_PATH", new Set(["M", "L", "H", "V", "Z", "C", "S", "Q", "m", "l", "h", "v", "z", "c", "s", "q"]));
_defineProperty(Renderer2D, "SVG_LETTER_REGEXP", /[a-zA-Z]/);
var create2DRenderer = function create2DRenderer(_ref4) {
  var context = _ref4.context;
  return {
    renderer: new Renderer2D(context),
    extensions: {
      stick: function stick(context, bitmap) {
        return function () {
          return context.drawImage(bitmap, 0, 0);
        };
      },
      clear: function clear(type, context, canvas, width, height) {
        if (type === "CL") {
          return function () {
            // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布，无论是Canvas还是OffscreenCanvas
            context.clearRect(0, 0, width, height);
          };
        }
        return function () {
          canvas.width = width;
          canvas.height = height;
        };
      }
    }
  };
};

/**
 * 动画控制器
 */
var Animator = /*#__PURE__*/function () {
  function Animator() {
    _classCallCheck(this, Animator);
    /**
     * 动画是否执行
     */
    _defineProperty(this, "isRunning", false);
    /**
     * 动画开始时间
     */
    _defineProperty(this, "startTime", 0);
    /**
     * 动画持续时间
     */
    _defineProperty(this, "duration", 0);
    /**
     * 循环播放开始帧与动画开始帧之间的时间偏差
     */
    _defineProperty(this, "loopStart", 0);
    /**
     * 动画暂停时的时间偏差
     */
    _defineProperty(this, "pauseTime", 0);
    /**
     * 循环持续时间
     */
    _defineProperty(this, "loopDuration", 0);
    _defineProperty(this, "onAnimate", platform.noop);
    /* ---- 事件钩子 ---- */
    _defineProperty(this, "onStart", platform.noop);
    _defineProperty(this, "onUpdate", platform.noop);
    _defineProperty(this, "onEnd", platform.noop);
  }
  return _createClass(Animator, [{
    key: "setConfig",
    value:
    /**
     * 设置动画的必要参数
     * @param duration
     * @param loopStart
     * @param loop
     * @param fillValue
     */
    function setConfig(duration, loopStart, loop, fillValue) {
      this.duration = duration;
      this.loopStart = loopStart;
      this.loopDuration = duration * loop + fillValue - loopStart;
    }
  }, {
    key: "start",
    value: function start() {
      this.isRunning = true;
      this.startTime = platform.now();
      this.pauseTime = 0;
      this.onStart();
      this.doFrame();
    }
  }, {
    key: "resume",
    value: function resume() {
      if (this.startTime === 0) {
        return false;
      }
      this.isRunning = true;
      this.doFrame();
      return true;
    }
  }, {
    key: "pause",
    value: function pause() {
      if (this.startTime === 0) {
        return false;
      }
      this.isRunning = false;
      // 设置暂停的位置
      this.pauseTime = (platform.now() - this.startTime) % this.duration;
      return true;
    }
  }, {
    key: "stop",
    value: function stop() {
      this.isRunning = false;
      this.startTime = 0;
    }
  }, {
    key: "doFrame",
    value: function doFrame() {
      var _this4 = this;
      if (this.isRunning) {
        this.doDeltaTime(platform.now() - this.startTime);
        if (this.isRunning) {
          this.onAnimate(function () {
            return _this4.doFrame();
          });
        }
      }
    }
  }, {
    key: "doDeltaTime",
    value: function doDeltaTime(deltaTime) {
      var duration = this.duration,
        loopStart = this.loopStart,
        pauseTime = this.pauseTime,
        loopDuration = this.loopDuration;
      // 本轮动画已消耗的时间比例（Percentage of speed time）
      var percent;
      var ended = false;
      // 运行时间 大于等于 循环持续时间
      if (deltaTime >= loopDuration) {
        // 动画已结束
        percent = 1.0;
        ended = true;
        this.stop();
      } else {
        // 本轮动画已消耗的时间比例 = 本轮动画已消耗的时间 / 动画持续时间
        percent = (deltaTime + loopStart + pauseTime) % duration / duration;
      }
      this.onUpdate(percent);
      if (!this.isRunning && ended) {
        this.onEnd();
      }
    }
  }]);
}(); // DEFLATE is a complex format; to read this code, you should probably check the RFC first:
// https://tools.ietf.org/html/rfc1951
// You may also wish to take a look at the guide I made about this program:
// https://gist.github.com/101arrowz/253f31eb5abc3d9275ab943003ffecad
// Some of the following code is similar to that of UZIP.js:
// https://github.com/photopea/UZIP.js
// However, the vast majority of the codebase has diverged from UZIP.js to increase performance and reduce bundle size.
// Sometimes 0 will appear where -1 would be more appropriate. This is because using a uint
// is better for memory in most engines (I *think*).
// aliases for shorter compressed code (most minifers don't do this)
var u8 = Uint8Array,
  u16 = Uint16Array,
  i32 = Int32Array;
// fixed length extra bits
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */0, 0, /* impossible */0]);
// fixed distance extra bits
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */0, 0]);
// code length index map
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
// get base, reverse index map from extra bits
var freb = function freb(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  // numbers here are at max 18 bits
  var r = new i32(b[30]);
  for (var _i2 = 1; _i2 < 30; ++_i2) {
    for (var j = b[_i2]; j < b[_i2 + 1]; ++j) {
      r[j] = j - b[_i2] << 5 | _i2;
    }
  }
  return {
    b: b,
    r: r
  };
};
var frebResult1 = freb(fleb, 2);
var fl = frebResult1.b;
var revfl = frebResult1.r;
var frebResult2 = freb(fdeb, 0);
var fd = frebResult2.b;
// map of value to reverse (assuming 16 bits)
var rev = new u16(32768);
// 初始化函数
function initZlibTables() {
  // we can ignore the fact that the other numbers are wrong; they never happen anyway
  fl[28] = 258;
  revfl[258] = 28;
  // reverse table algorithm from SO
  for (var i = 0; i < 32768; ++i) {
    var x = (i & 0xAAAA) >> 1 | (i & 0x5555) << 1;
    x = (x & 0xCCCC) >> 2 | (x & 0x3333) << 2;
    x = (x & 0xF0F0) >> 4 | (x & 0x0F0F) << 4;
    rev[i] = ((x & 0xFF00) >> 8 | (x & 0x00FF) << 8) >> 1;
  }
}
// 调用初始化函数
initZlibTables();
// create huffman tree from u8 "map": index -> code length for code index
// mb (max bits) must be at most 15
// TODO: optimize/split up?
var hMap = function hMap(cd, mb, r) {
  var s = cd.length;
  // index
  var i = 0;
  // u16 "map": index -> # of codes with bit length = index
  var l = new u16(mb);
  // length of cd must be 288 (total # of codes)
  for (; i < s; ++i) {
    if (cd[i]) ++l[cd[i] - 1];
  }
  // u16 "map": index -> minimum code for bit length = index
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
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
        var sv = i << 4 | cd[i];
        // free bits
        var _r = mb - cd[i];
        // start value
        var v = le[cd[i] - 1]++ << _r;
        // m is end value
        for (var m = v | (1 << _r) - 1; v <= m; ++v) {
          // every 16 bit value starting with the code yields the same result
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
};
// fixed length tree
var flt = new u8(288);
for (var i = 0; i < 144; ++i) flt[i] = 8;
for (var _i3 = 144; _i3 < 256; ++_i3) flt[_i3] = 9;
for (var _i4 = 256; _i4 < 280; ++_i4) flt[_i4] = 7;
for (var _i5 = 280; _i5 < 288; ++_i5) flt[_i5] = 8;
// fixed distance tree
var fdt = new u8(32);
for (var _i6 = 0; _i6 < 32; ++_i6) fdt[_i6] = 5;
// fixed length map
var flrm = /*#__PURE__*/hMap(flt, 9, 1);
// fixed distance map
var fdrm = /*#__PURE__*/hMap(fdt, 5, 1);
// find max of array
var max = function max(a) {
  var m = a[0];
  for (var _i7 = 1; _i7 < a.length; ++_i7) {
    if (a[_i7] > m) m = a[_i7];
  }
  return m;
};
// read d, starting at bit p and mask with m
var bits = function bits(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
// read d, starting at bit p continuing for at least 16 bits
var bits16 = function bits16(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
// get end of byte
var shft = function shft(p) {
  return (p + 7) / 8 | 0;
};
// typed array slice - allows garbage collector to free original reference,
// while being more compatible than .slice
var slc = function slc(v, s, e) {
  if (e == null || e > v.length) e = v.length;
  // can't use .constructor in case user-supplied
  return new u8(v.subarray(s, e));
};
// error codes
var ec = ['unexpected EOF', 'invalid block type', 'invalid length/literal', 'invalid distance', 'stream finished', 'no stream handler',,
// determined by compression function
'no callback', 'invalid UTF-8 data', 'extra field too long', 'date not in range 1980-2099', 'filename too long', 'stream finishing', 'invalid zip data'
// determined by unknown compression method
];
var _err = function err(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace) Error.captureStackTrace(e, _err);
  if (!nt) throw e;
  return e;
};
// expands raw DEFLATE data
var inflt = function inflt(dat, st, buf, dict) {
  // source length       dict length
  var sl = dat.length,
    dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l) return buf || new u8(0);
  var noBuf = !buf;
  // have to estimate size
  var resize = noBuf || st.i != 2;
  // no state
  var noSt = st.i;
  // Assumes roughly 33% compression ratio average
  if (noBuf) buf = new u8(sl * 3);
  // ensure buffer can fit at least l elements
  var cbuf = function cbuf(l) {
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
  var final = st.f || 0,
    pos = st.p || 0,
    bt = st.b || 0,
    lm = st.l,
    dm = st.d,
    lbt = st.m,
    dbt = st.n;
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
        var s = shft(pos) + 4,
          l = dat[s - 4] | dat[s - 3] << 8,
          t = s + l;
        if (t > sl) {
          if (noSt) _err(0);
          break;
        }
        // ensure size
        if (resize) cbuf(bt + l);
        // Copy over uncompressed data
        buf.set(dat.subarray(s, t), bt);
        // Get new bitpos, update byte count
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1) lm = flrm, dm = fdrm, lbt = 9, dbt = 5;else if (type == 2) {
        //  literal                            lengths
        var hLit = bits(dat, pos, 31) + 257,
          hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        // length+distance tree
        var ldt = new u8(tl);
        // code length tree
        var clt = new u8(19);
        for (var _i8 = 0; _i8 < hcLen; ++_i8) {
          // use index map to get real code
          clt[clim[_i8]] = bits(dat, pos + _i8 * 3, 7);
        }
        pos += hcLen * 3;
        // code lengths bits
        var clb = max(clt),
          clbmsk = (1 << clb) - 1;
        // code lengths map
        var clm = hMap(clt, clb, 1);
        for (var _i9 = 0; _i9 < tl;) {
          var r = clm[bits(dat, pos, clbmsk)];
          // bits read
          pos += r & 15;
          // symbol
          var _s = r >> 4;
          // code length to copy
          if (_s < 16) {
            ldt[_i9++] = _s;
          } else {
            //  copy   count
            var c = 0,
              n = 0;
            if (_s == 16) n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[_i9 - 1];else if (_s == 17) n = 3 + bits(dat, pos, 7), pos += 3;else if (_s == 18) n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--) ldt[_i9++] = c;
          }
        }
        //    length tree                 distance tree
        var lt = ldt.subarray(0, hLit),
          dt = ldt.subarray(hLit);
        // max length bits
        lbt = max(lt);
        // max dist bits
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else _err(1);
      if (pos > tbts) {
        if (noSt) _err(0);
        break;
      }
    }
    // Make sure the buffer can hold this + the largest possible addition
    // Maximum chunk size (practically, theoretically infinite) is 2^17
    if (resize) cbuf(bt + 131072);
    var lms = (1 << lbt) - 1,
      dms = (1 << dbt) - 1;
    var lpos = pos;
    for (;; lpos = pos) {
      // bits read, code
      var _c = lm[bits16(dat, pos) & lms],
        sym = _c >> 4;
      pos += _c & 15;
      if (pos > tbts) {
        if (noSt) _err(0);
        break;
      }
      if (!_c) _err(2);
      if (sym < 256) buf[bt++] = sym;else if (sym == 256) {
        lpos = pos, lm = undefined;
        break;
      } else {
        var add = sym - 254;
        // no extra bits needed if less
        if (sym > 264) {
          // index
          var _i0 = sym - 257,
            b = fleb[_i0];
          add = bits(dat, pos, (1 << b) - 1) + fl[_i0];
          pos += b;
        }
        // dist
        var d = dm[bits16(dat, pos) & dms],
          dsym = d >> 4;
        if (!d) _err(3);
        pos += d & 15;
        var _dt = fd[dsym];
        if (dsym > 3) {
          var _b = fdeb[dsym];
          _dt += bits16(dat, pos) & (1 << _b) - 1, pos += _b;
        }
        if (pos > tbts) {
          if (noSt) _err(0);
          break;
        }
        if (resize) cbuf(bt + 131072);
        var end = bt + add;
        if (bt < _dt) {
          var shift = dl - _dt,
            dend = Math.min(_dt, end);
          if (shift + bt < 0) _err(3);
          for (; bt < dend; ++bt) buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt) buf[bt] = buf[bt - _dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm) final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  // don't reallocate for streams or user buffers
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
// zlib start
var zls = function zls(d, dict) {
  if ((d[0] & 15) != 8 || d[0] >> 4 > 7 || (d[0] << 8 | d[1]) % 31) _err(6, 'invalid zlib data');
  if ((d[1] >> 5 & 1) == +!dict) _err(6, 'invalid zlib data: ' + (d[1] & 32 ? 'need' : 'unexpected') + ' dictionary');
  return (d[1] >> 3 & 4) + 2;
};
/**
 * Expands Zlib data
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
function unzlibSync(data) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return inflt(data.subarray(zls(data, opts.dictionary), -4), {
    i: 2
  }, opts && opts.out, opts && opts.dictionary);
}
var CRC32 = /*#__PURE__*/function () {
  function CRC32() {
    _classCallCheck(this, CRC32);
    _defineProperty(this, "caches", new Map());
  }
  return _createClass(CRC32, [{
    key: "calculate",
    value: function calculate(buff) {
      if (!(buff instanceof Uint8Array)) {
        throw new TypeError('Input must be a Uint8Array');
      }
      var caches = this.caches;
      var key = platform.codec.bytesToString(buff);
      if (caches.has(key)) {
        return caches.get(key);
      }
      var crc = CRC32.WHITE_COLOR;
      // 使用位运算优化
      for (var _i26 = 0; _i26 < buff.length; _i26++) {
        crc = crc >>> 8 ^ CRC32.table[(crc ^ buff[_i26]) & 0xff];
      }
      caches.set(key, (crc ^ CRC32.WHITE_COLOR) >>> 0);
      return caches.get(key);
    }
  }, {
    key: "clear",
    value: function clear() {
      this.caches.clear();
    }
  }]);
}(); // import { zlibSync } from "fflate";
// CRC32 Table 初始化
_defineProperty(CRC32, "table", Uint32Array.from(Array(256), function (_, i) {
  var c = i;
  for (var j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1;
  }
  return c >>> 0;
}));
_defineProperty(CRC32, "WHITE_COLOR", 0xffffffff);
// QRMath
// ---------------------------------------------------------------------
var EXP_TABLE = new Array(256);
var LOG_TABLE = new Array(256);
// initialize tables
for (var _i31 = 0; _i31 < 8; _i31++) {
  EXP_TABLE[_i31] = 1 << _i31;
}
for (var _i32 = 8; _i32 < 256; _i32++) {
  EXP_TABLE[_i32] = EXP_TABLE[_i32 - 4] ^ EXP_TABLE[_i32 - 5] ^ EXP_TABLE[_i32 - 6] ^ EXP_TABLE[_i32 - 8];
}
for (var _i33 = 0; _i33 < 255; _i33++) {
  LOG_TABLE[EXP_TABLE[_i33]] = _i33;
}
/**
 * SVGA 下载解析器
 */
var Parser = /*#__PURE__*/function () {
  function Parser() {
    _classCallCheck(this, Parser);
  }
  return _createClass(Parser, null, [{
    key: "decompress",
    value:
    /**
     * 解压视频源文件
     * @param data
     * @returns
     */
    function decompress(data) {
      return unzlibSync(new Uint8Array(data)).buffer;
    }
    /**
     * 解析视频实体
     * @param data 视频二进制数据
     * @param url 视频地址
     * @param needDecompress 是否解压
     * @returns
     */
  }, {
    key: "parseVideo",
    value: function parseVideo(data, url) {
      var needDecompress = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      return createVideoEntity(new Uint8Array(needDecompress ? this.decompress(data) : data), platform.path.filename(url));
    }
    /**
     * 读取文件资源
     * @param url 文件资源地址
     * @returns
     */
  }, {
    key: "download",
    value: (function () {
      var _download = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(url) {
        var globals, remote, path, local, env, supportLocal, filepath, buff, _t5;
        return _regenerator().w(function (_context9) {
          while (1) switch (_context9.p = _context9.n) {
            case 0:
              globals = platform.globals, remote = platform.remote, path = platform.path, local = platform.local;
              env = globals.env;
              supportLocal = env !== "h5" && env !== "tt";
              filepath = path.is(url) ? url : path.resolve(path.filename(url)); // 本地读取
              if (!supportLocal) {
                _context9.n = 2;
                break;
              }
              _context9.n = 1;
              return local.exists(filepath);
            case 1:
              if (!_context9.v) {
                _context9.n = 2;
                break;
              }
              return _context9.a(2, local.read(filepath));
            case 2:
              _context9.n = 3;
              return remote.fetch(url);
            case 3:
              buff = _context9.v;
              if (!supportLocal) {
                _context9.n = 7;
                break;
              }
              _context9.p = 4;
              _context9.n = 5;
              return local.write(buff, filepath);
            case 5:
              _context9.n = 7;
              break;
            case 6:
              _context9.p = 6;
              _t5 = _context9.v;
              // eslint-disable-next-line no-console
              console.error(_t5);
            case 7:
              return _context9.a(2, buff);
          }
        }, _callee9, null, [[4, 6]]);
      }));
      function download(_x1) {
        return _download.apply(this, arguments);
      }
      return download;
    }()
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    )
  }, {
    key: "load",
    value: (function () {
      var _load = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(url) {
        var _t6;
        return _regenerator().w(function (_context0) {
          while (1) switch (_context0.n) {
            case 0:
              _t6 = Parser;
              _context0.n = 1;
              return Parser.download(url);
            case 1:
              return _context0.a(2, _t6.parseVideo.call(_t6, _context0.v, url));
          }
        }, _callee0);
      }));
      function load(_x10) {
        return _load.apply(this, arguments);
      }
      return load;
    }())
  }]);
}();
var Painter = /*#__PURE__*/function () {
  /**
   *
   * @param mode
   * @param W 海报模式必须传入
   * @param H 海报模式必须传入
   */
  function Painter() {
    var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "dual";
    var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    _classCallCheck(this, Painter);
    _defineProperty(this, "mode", void 0);
    /**
     * 主屏的 Canvas 元素
     * Front Screen
     */
    _defineProperty(this, "F", null);
    /**
     * 主屏的 Context 对象
     * Front Context
     */
    _defineProperty(this, "FC", null);
    /**
     * 副屏的 Canvas 元素
     * Background Screen
     */
    _defineProperty(this, "B", null);
    /**
     * 副屏的 Context 对象
     * Background Context
     */
    _defineProperty(this, "BC", null);
    /**
     * 画布的宽度
     */
    _defineProperty(this, "W", void 0);
    /**
     * 画布的高度
     */
    _defineProperty(this, "H", void 0);
    /**
     * 粉刷模式
     */
    _defineProperty(this, "model", {});
    /**
     * 渲染器实例
     */
    _defineProperty(this, "renderer", null);
    _defineProperty(this, "clearContainer", platform.noop);
    _defineProperty(this, "clearSecondary", platform.noop);
    _defineProperty(this, "resize", platform.noop);
    _defineProperty(this, "draw", platform.noop);
    _defineProperty(this, "stick", platform.noop);
    this.mode = mode;
    var dpr = platform.globals.dpr;
    this.W = width * dpr;
    this.H = height * dpr;
  }
  /**
   * 设置 Canvas 的处理模式
   * - C：代表 Canvas
   * - O：代表 OffscreenCanvas
   */
  return _createClass(Painter, [{
    key: "setActionModel",
    value: function setActionModel(type) {
      var model = this.model;
      var env = platform.globals.env;
      // set type
      model.type = type;
      // set clear
      if (type === "O" && env === "tt" || env === "alipay") {
        model.clear = "CL";
      } else {
        model.clear = "RE";
      }
    }
    /**
     * 注册画笔，根据环境判断生成最优的绘制方式
     * @param selector
     * @param ofsSelector
     * @param component
     */
  }, {
    key: "register",
    value: (function () {
      var _register = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(selector, ofsSelector, component) {
        var _this5 = this;
        var model, mode, getCanvas, getOfsCanvas, env, _W, _H, _getOfsCanvas, canvas, context, _yield$getCanvas, _canvas2, _context1, FC, F, W, H, clearType, tempRendererResult, ofsResult, _BC, _B, tempRendererResult2, B, BC, rendererResult;
        return _regenerator().w(function (_context10) {
          while (1) switch (_context10.n) {
            case 0:
              model = this.model, mode = this.mode;
              getCanvas = platform.getCanvas, getOfsCanvas = platform.getOfsCanvas;
              env = platform.globals.env; // #region set main screen implement
              // -------- 创建主屏 ---------
              if (!(mode === "single" && (env !== "h5" || "OffscreenCanvas" in globalThis))) {
                _context10.n = 1;
                break;
              }
              _W = this.W, _H = this.H;
              _getOfsCanvas = getOfsCanvas({
                type: '2d',
                width: _W,
                height: _H
              }), canvas = _getOfsCanvas.canvas, context = _getOfsCanvas.context; // 添加主屏
              this.F = canvas;
              this.FC = context;
              this.setActionModel("O");
              _context10.n = 3;
              break;
            case 1:
              _context10.n = 2;
              return getCanvas(selector, {
                type: '2d',
                component: component
              });
            case 2:
              _yield$getCanvas = _context10.v;
              _canvas2 = _yield$getCanvas.canvas;
              _context1 = _yield$getCanvas.context;
              // 添加主屏
              this.F = _canvas2;
              this.FC = _context1;
              this.setActionModel("C");
              if (mode === "single") {
                _canvas2.width = this.W;
                _canvas2.height = this.H;
              } else {
                this.W = _canvas2.width;
                this.H = _canvas2.height;
              }
            case 3:
              // #endregion set main screen implement
              FC = this.FC, F = this.F, W = this.W, H = this.H;
              clearType = model.clear; // 创建一个临时的 renderer 来获取 extensions
              tempRendererResult = create2DRenderer({
                context: FC
              });
              this.clearContainer = tempRendererResult.extensions.clear(clearType, FC, F, W, H);
              if (!(mode === "single")) {
                _context10.n = 4;
                break;
              }
              this.B = F;
              this.BC = FC;
              this.clearSecondary = this.clearContainer;
              this.stick = platform.noop;
              _context10.n = 8;
              break;
            case 4:
              if (!(typeof ofsSelector === "string" && ofsSelector !== "")) {
                _context10.n = 6;
                break;
              }
              _context10.n = 5;
              return getCanvas(ofsSelector, {
                type: '2d',
                component: component
              });
            case 5:
              ofsResult = _context10.v;
              ofsResult.canvas.width = W;
              ofsResult.canvas.height = H;
              this.setActionModel("C");
              _context10.n = 7;
              break;
            case 6:
              ofsResult = getOfsCanvas({
                type: '2d',
                width: W,
                height: H
              });
              this.setActionModel("O");
            case 7:
              this.B = ofsResult.canvas;
              this.BC = ofsResult.context;
              // #endregion set secondary screen implement
              _BC = this.BC, _B = this.B; // 创建一个临时的 renderer 来获取 extensions
              tempRendererResult2 = create2DRenderer({
                context: _BC
              });
              this.clearSecondary = tempRendererResult2.extensions.clear(clearType, _BC, _B, W, H);
              this.stick = tempRendererResult2.extensions.stick(FC, _B);
            case 8:
              // #region other methods implement
              // ------- 生成其他方法 --------
              B = this.B, BC = this.BC;
              rendererResult = create2DRenderer({
                context: BC
              });
              this.renderer = rendererResult.renderer;
              this.resize = function (contentMode, videoSize) {
                return _this5.renderer.resize(contentMode, videoSize, B);
              };
              this.draw = function (videoEntity, materials, dynamicMaterials, currentFrame, head, tail) {
                return _this5.renderer.render(videoEntity, materials, dynamicMaterials, currentFrame, head, tail);
              };
              // #endregion other methods implement
            case 9:
              return _context10.a(2);
          }
        }, _callee1, this);
      }));
      function register(_x11, _x12, _x13) {
        return _register.apply(this, arguments);
      }
      return register;
    }())
  }, {
    key: "destroy",
    value:
    /**
     * 销毁画笔
     */
    function destroy() {
      var _this$renderer;
      this.clearContainer();
      this.clearSecondary();
      this.F = this.FC = this.B = this.BC = null;
      this.clearContainer = this.clearSecondary = this.stick = platform.noop;
      (_this$renderer = this.renderer) === null || _this$renderer === void 0 || _this$renderer.destroy();
    }
  }]);
}();/******************************************************************************
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


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};/**
 * 动态元素管理器
 * 提供图片替换、文本添加、二维码生成等功能
 */
var DynamicElementManager = /*#__PURE__*/function () {
  function DynamicElementManager(painter) {
    _classCallCheck(this, DynamicElementManager);
    this.painter = painter;
    /**
     * 动态素材映射
     */
    this.dynamicMaterials = new Map();
  }
  /**
   * 替换指定 key 的图片
   * @param key 动态元素的 key
   * @param source 图片源（URL 或 Uint8Array）
   * @returns Promise<Bitmap>
   */
  return _createClass(DynamicElementManager, [{
    key: "setImage",
    value: function setImage(key, source) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee() {
        var _this = this;
        var img;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              _context.n = 1;
              return platform.image.load(function () {
                var canvas = _this.painter.F;
                if (!canvas) {
                  throw new Error("Canvas not initialized");
                }
                return platform.image.create(canvas);
              }, source, platform.path.resolve(key, "ext"));
            case 1:
              img = _context.v;
              this.dynamicMaterials.set(key, img);
              return _context.a(2, img);
          }
        }, _callee, this);
      }));
    }
    /**
     * 添加动态文本
     * @param key 动态元素的 key
     * @param text 文本内容
     * @param options 文本选项
     * @returns Promise<Bitmap>
     */
  }, {
    key: "setText",
    value: function setText(key, text, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee2() {
        var _ref, _ref$width, width, _ref$height, height, _ref$fontSize, fontSize, _ref$fontFamily, fontFamily, _ref$color, color, _ref$backgroundColor, backgroundColor, _ref$textAlign, textAlign, _ref$textBaseline, textBaseline, canvas, context, x, y, bitmap;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _ref = options || {}, _ref$width = _ref.width, width = _ref$width === void 0 ? 200 : _ref$width, _ref$height = _ref.height, height = _ref$height === void 0 ? 100 : _ref$height, _ref$fontSize = _ref.fontSize, fontSize = _ref$fontSize === void 0 ? 20 : _ref$fontSize, _ref$fontFamily = _ref.fontFamily, fontFamily = _ref$fontFamily === void 0 ? "Arial" : _ref$fontFamily, _ref$color = _ref.color, color = _ref$color === void 0 ? "#000000" : _ref$color, _ref$backgroundColor = _ref.backgroundColor, backgroundColor = _ref$backgroundColor === void 0 ? "transparent" : _ref$backgroundColor, _ref$textAlign = _ref.textAlign, textAlign = _ref$textAlign === void 0 ? "center" : _ref$textAlign, _ref$textBaseline = _ref.textBaseline, textBaseline = _ref$textBaseline === void 0 ? "middle" : _ref$textBaseline; // 创建离屏画布
              canvas = platform.getOfsCanvas({
                type: "2d",
                width: width,
                height: height
              });
              context = canvas.context; // 绘制背景
              if (backgroundColor !== "transparent") {
                context.fillStyle = backgroundColor;
                context.fillRect(0, 0, width, height);
              }
              // 绘制文本
              context.fillStyle = color;
              context.font = "".concat(fontSize, "px ").concat(fontFamily);
              context.textAlign = textAlign;
              context.textBaseline = textBaseline;
              x = textAlign === "left" ? 0 : textAlign === "right" ? width : width / 2;
              y = textBaseline === "top" ? 0 : textBaseline === "bottom" ? height : height / 2;
              context.fillText(text, x, y);
              // 转换为 ImageBitmap
              _context2.n = 1;
              return canvas.canvas.transferToImageBitmap();
            case 1:
              bitmap = _context2.v;
              this.dynamicMaterials.set(key, bitmap);
              return _context2.a(2, bitmap);
          }
        }, _callee2, this);
      }));
    }
    /**
     * 添加二维码
     * @param key 动态元素的 key
     * @param content 二维码内容
     * @param options 二维码选项
     * @returns Promise<Bitmap>
     */
  }, {
    key: "setQRCode",
    value: function setQRCode(key, content, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee3() {
        var _ref2, _ref2$size, size, _ref2$color, color, _ref2$backgroundColor, backgroundColor;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              _ref2 = options || {}, _ref2$size = _ref2.size, size = _ref2$size === void 0 ? 200 : _ref2$size, _ref2$color = _ref2.color, color = _ref2$color === void 0 ? "#000000" : _ref2$color, _ref2$backgroundColor = _ref2.backgroundColor, backgroundColor = _ref2$backgroundColor === void 0 ? "#ffffff" : _ref2$backgroundColor; // TODO: 实现二维码生成逻辑
              // 这里可以使用 qrcode 库或其他二维码生成库
              // 暂时返回一个占位符
              _context3.n = 1;
              return this.setText(key, "QR: " + content, {
                width: size,
                height: size,
                fontSize: 16,
                color: color,
                backgroundColor: backgroundColor
              });
            case 1:
              return _context3.a(2, _context3.v);
          }
        }, _callee3, this);
      }));
    }
    /**
     * 添加自定义画布内容
     * @param key 动态元素的 key
     * @param context 画布上下文
     * @param options 画布选项
     * @returns Promise<Bitmap>
     */
  }, {
    key: "setCanvas",
    value: function setCanvas(key, context, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee4() {
        var _ref3, _ref3$width, width, _ref3$height, height, _ref3$mode, mode, canvas, targetContext, bitmap;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              _ref3 = options || {}, _ref3$width = _ref3.width, width = _ref3$width === void 0 ? 200 : _ref3$width, _ref3$height = _ref3.height, height = _ref3$height === void 0 ? 100 : _ref3$height, _ref3$mode = _ref3.mode, mode = _ref3$mode === void 0 ? "A" : _ref3$mode; // 创建离屏画布
              canvas = platform.getOfsCanvas({
                type: "2d",
                width: width,
                height: height
              });
              targetContext = canvas.context; // 复制画布内容
              if (mode === "A") {
                // 模式 A：直接复制
                targetContext.drawImage(context.canvas, 0, 0, width, height);
              }
              // 转换为 ImageBitmap
              _context4.n = 1;
              return canvas.canvas.transferToImageBitmap();
            case 1:
              bitmap = _context4.v;
              this.dynamicMaterials.set(key, bitmap);
              return _context4.a(2, bitmap);
          }
        }, _callee4, this);
      }));
    }
    /**
     * 获取动态素材
     * @param key 动态元素的 key
     * @returns Bitmap | undefined
     */
  }, {
    key: "get",
    value: function get(key) {
      return this.dynamicMaterials.get(key);
    }
    /**
     * 获取所有动态素材
     * @returns Map<string, Bitmap>
     */
  }, {
    key: "getAll",
    value: function getAll() {
      return this.dynamicMaterials;
    }
    /**
     * 移除动态素材
     * @param key 动态元素的 key
     */
  }, {
    key: "remove",
    value: function remove(key) {
      var bitmap = this.dynamicMaterials.get(key);
      if (bitmap) {
        if (bitmap instanceof ImageBitmap) {
          bitmap.close();
        }
        this.dynamicMaterials.delete(key);
      }
    }
    /**
     * 清空所有动态素材
     */
  }, {
    key: "clear",
    value: function clear() {
      var _iterator = _createForOfIteratorHelper(this.dynamicMaterials),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
            key = _step$value[0],
            bitmap = _step$value[1];
          if (bitmap instanceof ImageBitmap) {
            bitmap.close();
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.dynamicMaterials.clear();
    }
  }]);
}();/**
 * SVGA 播放器
 */
var Player = /*#__PURE__*/function () {
  function Player() {
    _classCallCheck(this, Player);
    /**
     * 当前配置项
     */
    this.config = {
      loop: 0,
      fillMode: "forwards" /* PLAYER_FILL_MODE.FORWARDS */,
      playMode: "forwards" /* PLAYER_PLAY_MODE.FORWARDS */,
      contentMode: "aspect-fit" /* PLAYER_CONTENT_MODE.ASPECT_FIT */,
      startFrame: 0,
      endFrame: 0,
      loopStartFrame: 0
    };
    /**
     * 资源管理器
     */
    this.resource = null;
    /**
     * 画布渲染器
     */
    this.painter = new Painter();
    /**
     * 动画控制器
     */
    this.animator = new Animator();
    /**
       * 动态元素管理器
       */
    this.dynamicElementManager = null;
  }
  /**
   * 设置配置项
   * @param options 可配置项
   * @param component 组件对象（小程序中使用）
   */
  return _createClass(Player, [{
    key: "setConfig",
    value: function setConfig(options, component) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee() {
        var config, container, secondary;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              config = typeof options === "string" ? {
                container: options
              } : options;
              container = config.container, secondary = config.secondary; // 合并配置
              Object.assign(this.config, config);
              // 注册画布
              _context.n = 1;
              return this.painter.register(container, secondary, component);
            case 1:
              // 创建资源管理器
              this.resource = new ResourceManager(this.painter);
              // 创建动态元素管理器
              this.dynamicElementManager = new DynamicElementManager(this.painter);
              // 设置动画帧回调
              this.animator.onAnimate = platform.rAF.bind(null, this.painter.F);
            case 2:
              return _context.a(2);
          }
        }, _callee, this);
      }));
    }
    /**
     * 更新配置项
     * @param key 配置项键
     * @param value 配置项值
     */
  }, {
    key: "setItem",
    value: function setItem(key, value) {
      this.config[key] = value;
    }
    /**
     * 装载 SVGA 数据
     * @param videoEntity SVGA 数据源
     * @returns Promise<void>
     */
  }, {
    key: "mount",
    value: function mount(videoEntity) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee2() {
        var _a, images, filename;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              if (videoEntity) {
                _context2.n = 1;
                break;
              }
              throw new Error("videoEntity undefined");
            case 1:
              images = videoEntity.images, filename = videoEntity.filename; // 停止动画
              this.animator.stop();
              // 清空画布
              this.painter.clearSecondary();
              // 释放资源
              (_a = this.resource) === null || _a === void 0 ? void 0 : _a.release();
              // 保存实体
              this.entity = videoEntity;
              // 加载图片资源
              if (!this.resource) {
                _context2.n = 2;
                break;
              }
              _context2.n = 2;
              return this.resource.loadImagesWithRecord(images, filename);
            case 2:
              return _context2.a(2);
          }
        }, _callee2, this);
      }));
    }
    /**
     * 开始播放
     */
  }, {
    key: "start",
    value: function start() {
      var _a;
      this.startAnimation();
      (_a = this.onStart) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    /**
     * 重新播放
     */
  }, {
    key: "resume",
    value: function resume() {
      var _a;
      if (this.animator.resume()) {
        (_a = this.onResume) === null || _a === void 0 ? void 0 : _a.call(this);
      }
    }
    /**
     * 暂停播放
     */
  }, {
    key: "pause",
    value: function pause() {
      var _a;
      if (this.animator.pause()) {
        (_a = this.onPause) === null || _a === void 0 ? void 0 : _a.call(this);
      }
    }
    /**
     * 停止播放
     */
  }, {
    key: "stop",
    value: function stop() {
      var _a;
      this.animator.stop();
      this.painter.clearContainer();
      this.painter.clearSecondary();
      (_a = this.onStop) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    /**
     * 销毁实例
     */
  }, {
    key: "destroy",
    value: function destroy() {
      var _a, _b;
      this.animator.stop();
      this.painter.destroy();
      (_a = this.resource) === null || _a === void 0 ? void 0 : _a.release();
      (_b = this.resource) === null || _b === void 0 ? void 0 : _b.cleanup();
      this.entity = undefined;
    }
    /**
     * 跳转到指定帧
     * @param frame 目标帧
     * @param andPlay 是否立即播放
     */
  }, {
    key: "stepToFrame",
    value: function stepToFrame(frame) {
      var andPlay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!this.entity || frame < 0 || frame >= this.entity.frames) return;
      this.pause();
      this.config.loopStartFrame = frame;
      if (andPlay) {
        this.start();
      }
    }
    /**
     * 跳转到指定百分比
     * @param percent 目标百分比 (0-1)
     * @param andPlay 是否立即播放
     */
  }, {
    key: "stepToPercentage",
    value: function stepToPercentage(percent) {
      var andPlay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!this.entity) return;
      var frames = this.entity.frames;
      var frame = percent < 0 ? 0 : Math.round(percent * frames);
      if (frame >= frames) {
        frame = frames - 1;
      }
      this.stepToFrame(frame, andPlay);
    }
    /**
     * 替换指定 key 的图片
     * @param key 动态元素的 key
     * @param source 图片源（URL 或 Uint8Array）
     * @returns Promise<Bitmap>
     */
  }, {
    key: "setImage",
    value: function setImage(key, source) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee3() {
        var bitmap;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              if (this.dynamicElementManager) {
                _context3.n = 1;
                break;
              }
              throw new Error("Dynamic element manager not initialized");
            case 1:
              _context3.n = 2;
              return this.dynamicElementManager.setImage(key, source);
            case 2:
              bitmap = _context3.v;
              // 将动态素材添加到 ResourceManager
              if (this.resource) {
                this.resource.dynamicMaterials.set(key, bitmap);
              }
              return _context3.a(2, bitmap);
          }
        }, _callee3, this);
      }));
    }
    /**
     * 添加动态文本
     * @param key 动态元素的 key
     * @param text 文本内容
     * @param options 文本选项
     * @returns Promise<Bitmap>
     */
  }, {
    key: "setText",
    value: function setText(key, text, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee4() {
        var bitmap;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              if (this.dynamicElementManager) {
                _context4.n = 1;
                break;
              }
              throw new Error("Dynamic element manager not initialized");
            case 1:
              _context4.n = 2;
              return this.dynamicElementManager.setText(key, text, options);
            case 2:
              bitmap = _context4.v;
              // 将动态素材添加到 ResourceManager
              if (this.resource) {
                this.resource.dynamicMaterials.set(key, bitmap);
              }
              return _context4.a(2, bitmap);
          }
        }, _callee4, this);
      }));
    }
    /**
     * 添加二维码
     * @param key 动态元素的 key
     * @param content 二维码内容
     * @param options 二维码选项
     * @returns Promise<Bitmap>
     */
  }, {
    key: "setQRCode",
    value: function setQRCode(key, content, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee5() {
        var bitmap;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              if (this.dynamicElementManager) {
                _context5.n = 1;
                break;
              }
              throw new Error("Dynamic element manager not initialized");
            case 1:
              _context5.n = 2;
              return this.dynamicElementManager.setQRCode(key, content, options);
            case 2:
              bitmap = _context5.v;
              // 将动态素材添加到 ResourceManager
              if (this.resource) {
                this.resource.dynamicMaterials.set(key, bitmap);
              }
              return _context5.a(2, bitmap);
          }
        }, _callee5, this);
      }));
    }
    /**
     * 添加自定义画布内容
     * @param key 动态元素的 key
     * @param context 画布上下文
     * @param options 画布选项
     * @returns Promise<Bitmap>
     */
  }, {
    key: "setCanvas",
    value: function setCanvas(key, context, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee6() {
        var bitmap;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              if (this.dynamicElementManager) {
                _context6.n = 1;
                break;
              }
              throw new Error("Dynamic element manager not initialized");
            case 1:
              _context6.n = 2;
              return this.dynamicElementManager.setCanvas(key, context, options);
            case 2:
              bitmap = _context6.v;
              // 将动态素材添加到 ResourceManager
              if (this.resource) {
                this.resource.dynamicMaterials.set(key, bitmap);
              }
              return _context6.a(2, bitmap);
          }
        }, _callee6, this);
      }));
    }
    /**
     * 移除动态素材
     * @param key 动态元素的 key
     */
  }, {
    key: "removeDynamicElement",
    value: function removeDynamicElement(key) {
      if (!this.dynamicElementManager) {
        return;
      }
      this.dynamicElementManager.remove(key);
      if (this.resource) {
        this.resource.dynamicMaterials.delete(key);
      }
    }
    /**
     * 清空所有动态素材
     */
  }, {
    key: "clearDynamicElements",
    value: function clearDynamicElements() {
      if (!this.dynamicElementManager) {
        return;
      }
      this.dynamicElementManager.clear();
      if (this.resource) {
        this.resource.dynamicMaterials.clear();
      }
    }
    /**
     * 开始绘制动画
     */
  }, {
    key: "startAnimation",
    value: function startAnimation() {
      var _this = this;
      var entity = this.entity,
        config = this.config,
        animator = this.animator,
        painter = this.painter,
        resource = this.resource;
      if (!entity || !resource) return;
      var materials = resource.materials,
        dynamicMaterials = resource.dynamicMaterials;
      var fillMode = config.fillMode,
        playMode = config.playMode,
        contentMode = config.contentMode;
      // 计算帧范围
      var totalFrames = entity.frames;
      var startFrame = config.startFrame || 0;
      var endFrame = config.endFrame || totalFrames - 1;
      var loopStartFrame = config.loopStartFrame || 0;
      // 计算有效帧数
      var effectiveFrames = endFrame - startFrame + 1;
      var spriteCount = entity.sprites.length;
      // 计算动画时长（毫秒）
      var duration = effectiveFrames / entity.fps * 1000;
      config.loop === 0 ? Infinity : duration * config.loop;
      var loopStartOffset = loopStartFrame / totalFrames * duration;
      // 当前帧
      var currentFrame = startFrame;
      // 片段绘制结束位置
      var tail = 0;
      // 上一帧
      var latestFrame;
      // 下一帧
      var nextFrame;
      // 精确帧
      var exactFrame;
      // 当前百分比
      var percent;
      // 是否还有剩余时间
      var hasRemained;
      // 更新动画配置
      animator.setConfig(duration, loopStartOffset, config.loop, 0);
      painter.resize(contentMode, entity.size);
      // 分段渲染函数
      var MAX_DRAW_TIME_PER_FRAME = 8;
      var MAX_ACCELERATE_DRAW_TIME_PER_FRAME = 3;
      var MAX_DYNAMIC_CHUNK_SIZE = 34;
      var MIN_DYNAMIC_CHUNK_SIZE = 1;
      var render = function render(head, tail) {
        return painter.draw(entity, materials, dynamicMaterials, currentFrame, head, tail);
      };
      // 动态调整每次绘制的块大小
      var dynamicChunkSize = 4;
      var startTime;
      var chunk;
      var elapsed;
      // 使用指数退避算法平衡渲染速度和流畅度
      var patchDraw = function patchDraw(before) {
        startTime = platform.now();
        before();
        while (tail < spriteCount) {
          chunk = Math.min(dynamicChunkSize, spriteCount - tail);
          var nextTail = tail + chunk | 0;
          render(tail, nextTail);
          tail = nextTail;
          elapsed = platform.now() - startTime;
          if (elapsed < MAX_ACCELERATE_DRAW_TIME_PER_FRAME) {
            dynamicChunkSize = Math.min(dynamicChunkSize * 2, MAX_DYNAMIC_CHUNK_SIZE);
          } else if (elapsed > MAX_DRAW_TIME_PER_FRAME) {
            dynamicChunkSize = Math.max(dynamicChunkSize / 2, MIN_DYNAMIC_CHUNK_SIZE);
            break;
          }
        }
      };
      // 动画绘制过程
      animator.onUpdate = function (timePercent) {
        var _a;
        patchDraw(function () {
          percent = playMode === "fallbacks" /* PLAYER_PLAY_MODE.FALLBACKS */ ? 1 - timePercent : timePercent;
          exactFrame = percent * effectiveFrames;
          if (playMode === "fallbacks" /* PLAYER_PLAY_MODE.FALLBACKS */) {
            nextFrame = (timePercent === 0 ? endFrame : Math.ceil(exactFrame)) - 1;
            percent = currentFrame / totalFrames;
          } else {
            nextFrame = timePercent === 1 ? startFrame : Math.floor(exactFrame);
          }
          hasRemained = currentFrame === nextFrame;
        });
        if (hasRemained) return;
        if (tail < spriteCount) {
          render(tail, spriteCount);
        }
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
        if (fillMode === "none" /* PLAYER_FILL_MODE.NONE */) {
          painter.clearContainer();
        }
        (_a = _this.onEnd) === null || _a === void 0 ? void 0 : _a.call(_this);
      };
      animator.start();
    }
  }]);
}();exports.DynamicElementManager=DynamicElementManager;exports.Painter=Painter;exports.Parser=Parser;exports.Player=Player;exports.platform=platform;Object.defineProperty(exports,'__esModule',{value:true});}));//# sourceMappingURL=index.js.map
