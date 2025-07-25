(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports):typeof define==='function'&&define.amd?define(['exports'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.OctopusSvga={}));})(this,(function(exports){'use strict';function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
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
function _callSuper(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
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
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, _getPrototypeOf(t);
}
function _inherits(t, e) {
  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: true,
      configurable: true
    }
  }), Object.defineProperty(t, "prototype", {
    writable: false
  }), e && _setPrototypeOf(t, e);
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
  } catch (t) {}
  return (_isNativeReflectConstruct = function () {
    return !!t;
  })();
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
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _possibleConstructorReturn(t, e) {
  if (e && ("object" == typeof e || "function" == typeof e)) return e;
  if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
  return _assertThisInitialized(t);
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
    if (r) i ? i(e, r, {
      value: n,
      enumerable: !t,
      configurable: !t,
      writable: !t
    }) : e[r] = n;else {
      function o(r, n) {
        _regeneratorDefine(e, r, function (e) {
          return this._invoke(r, n, e);
        });
      }
      o("next", 0), o("throw", 1), o("return", 2);
    }
  }, _regeneratorDefine(e, r, n, t);
}
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
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
  return (String )(t);
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
}/******************************************************************************
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
};var noop$1 = function noop() {};
function delay(callback, interval) {
  return new Promise(function (resolve) {
    return setTimeout(function () {
      return resolve(callback());
    }, interval);
  });
}
function retry(_x) {
  return _retry.apply(this, arguments);
} // 使用静态缓冲区，避免重复创建
function _retry() {
  _retry = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(fn) {
    var intervals,
      times,
      _args3 = arguments,
      _t4;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          intervals = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : [];
          times = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : 0;
          _context3.p = 1;
          return _context3.a(2, fn());
        case 2:
          _context3.p = 2;
          _t4 = _context3.v;
          if (!(times >= intervals.length)) {
            _context3.n = 3;
            break;
          }
          throw _t4;
        case 3:
          return _context3.a(2, delay(function () {
            return retry(fn, intervals, ++times);
          }, intervals[times]));
      }
    }, _callee3, null, [[1, 2]]);
  }));
  return _retry.apply(this, arguments);
}
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
  if (start < 0 || end > buffer.length) throw new RangeError("Index out of range");
  if (end - start < 1) return "";
  var resultParts = [];
  var bufferPos = 0;
  var appendBuffer = function appendBuffer(parts) {
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
    for (var _i = start; _i < end; _i += BUFFER_SIZE) {
      var chunkEnd = Math.min(_i + BUFFER_SIZE, end);
      var len = chunkEnd - _i;
      // 直接复制到 Uint16Array
      for (var j = 0; j < len; j++) {
        STATIC_BUFFER[j] = buffer[_i + j];
      }
      appendBuffer(STATIC_BUFFER.subarray(0, len));
    }
    return resultParts.join('');
  }
  // 混合内容处理
  for (var _i2 = start; _i2 < end;) {
    var byte = buffer[_i2++];
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
    if ((byte & 0xE0) === 0xC0 && _i2 < end) {
      codePoint = (byte & 0x1F) << 6 | buffer[_i2++] & 0x3F;
    }
    // 3 字节序列: 1110xxxx 10xxxxxx 10xxxxxx
    else if ((byte & 0xF0) === 0xE0 && _i2 + 1 < end) {
      codePoint = (byte & 0x0F) << 12 | (buffer[_i2++] & 0x3F) << 6 | buffer[_i2++] & 0x3F;
    }
    // 4 字节序列: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
    else if ((byte & 0xF8) === 0xF0 && _i2 + 2 < end) {
      codePoint = (byte & 0x07) << 18 | (buffer[_i2++] & 0x3F) << 12 | (buffer[_i2++] & 0x3F) << 6 | buffer[_i2++] & 0x3F;
      // 处理 Unicode 代理对
      if (codePoint > 0xFFFF) {
        codePoint -= 0x10000;
        STATIC_BUFFER[bufferPos++] = 0xD800 + (codePoint >> 10);
        STATIC_BUFFER[bufferPos++] = 0xDC00 + (codePoint & 0x3FF);
        // 检查缓冲区是否需要提交
        if (bufferPos >= BUFFER_SIZE - 2) {
          // 预留空间给下一个可能的代理对
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
      while (_i2 < end && (buffer[_i2] & 0xC0) === 0x80) _i2++;
    }
    STATIC_BUFFER[bufferPos++] = codePoint;
    // 检查缓冲区是否需要提交
    if (bufferPos >= BUFFER_SIZE - 3) {
      // 预留空间给下一个可能的多字节字符
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
var OctopusPlatform = /*#__PURE__*/function () {
  function OctopusPlatform(plugins, version) {
    _classCallCheck(this, OctopusPlatform);
    /**
     * 插件列表
     */
    _defineProperty(this, "plugins", []);
    /**
     * 平台版本
     */
    _defineProperty(this, "platformVersion", "0.1.2");
    /**
     * 应用版本
     */
    _defineProperty(this, "version", "");
    /**
     * 全局变量
     */
    _defineProperty(this, "globals", {
      env: "unknown",
      br: null,
      dpr: 1,
      system: "unknown"
    });
    _defineProperty(this, "noop", noop$1);
    _defineProperty(this, "retry", retry);
    this.version = version || "";
    this.plugins = plugins;
    this.globals.env = this.autoEnv();
  }
  return _createClass(OctopusPlatform, [{
    key: "init",
    value: function init() {
      var globals = this.globals,
        plugins = this.plugins;
      var collection = new Map();
      var names = [];
      var installedPlugins = new Set();
      globals.br = this.useBridge();
      globals.dpr = this.usePixelRatio();
      globals.system = this.useSystem();
      var _iterator = _createForOfIteratorHelper(plugins),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var plugin = _step.value;
          names.push(plugin.name);
          collection.set(plugin.name, plugin);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.usePlugins(collection, names, installedPlugins);
      installedPlugins.clear();
    }
  }, {
    key: "autoEnv",
    value: function autoEnv() {
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
      throw new Error("Unsupported platform！");
    }
  }, {
    key: "useBridge",
    value: function useBridge() {
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
  }, {
    key: "usePixelRatio",
    value: function usePixelRatio() {
      var _this$globals = this.globals,
        env = _this$globals.env,
        br = _this$globals.br;
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
  }, {
    key: "useSystem",
    value: function useSystem() {
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
    }
  }, {
    key: "usePlugins",
    value: function usePlugins(plugins, pluginNames, installedPlugins) {
      var _iterator2 = _createForOfIteratorHelper(pluginNames),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var pluginName = _step2.value;
          if (!plugins.has(pluginName)) {
            throw new Error("Plugin ".concat(pluginName, " not found"));
          }
          if (installedPlugins.has(pluginName)) {
            return;
          }
          var plugin = plugins.get(pluginName);
          // 递归调用依赖
          if (Array.isArray(plugin.dependencies)) {
            var _iterator3 = _createForOfIteratorHelper(plugin.dependencies),
              _step3;
            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var _plugins$get;
                var dependency = _step3.value;
                if (typeof ((_plugins$get = plugins.get(dependency)) === null || _plugins$get === void 0 ? void 0 : _plugins$get.install) !== "function") {
                  throw new Error("Plugin ".concat(pluginName, " depends on plugin ").concat(dependency, ", but ").concat(dependency, " is not found"));
                }
              }
              // 递归加载依赖
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
            this.usePlugins(plugins, plugin.dependencies, installedPlugins);
          }
          this.installPlugin(plugin);
          installedPlugins.add(pluginName);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "switch",
    value: function _switch(env) {
      this.globals.env = env;
      this.init();
    }
  }]);
}();
/**
 * 定义平台插件
 */
var definePlugin = function definePlugin(plugin) {
  return plugin;
};
function installPlugin(platform, plugin) {
  var value = plugin.install.call(platform);
  Object.defineProperty(platform, plugin.name, {
    get: function get() {
      return value;
    },
    enumerable: true,
    configurable: true
  });
}
var pluginSelector = definePlugin({
  name: "getSelector",
  install: function install() {
    var _this$globals2 = this.globals,
      env = _this$globals2.env,
      br = _this$globals2.br;
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
      return query.select(selector).fields({
        node: true,
        size: true
      });
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
  install: function install() {
    var retry = this.retry,
      getSelector = this.getSelector;
    var _this$globals3 = this.globals,
      env = _this$globals3.env;
      _this$globals3.br;
      var dpr = _this$globals3.dpr;
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
      return {
        canvas: canvas,
        context: context
      };
    }
    if (env === "h5") {
      return function (selector) {
        return retry(function () {
          // FIXME: Taro 对 canvas 做了特殊处理，canvas 元素的 id 会被加上 canvas-id 的前缀
          var canvas = getSelector("canvas[canvas-id=".concat(selector.slice(1), "]")) || getSelector(selector);
          return initCanvas(canvas, canvas === null || canvas === void 0 ? void 0 : canvas.clientWidth, canvas === null || canvas === void 0 ? void 0 : canvas.clientHeight);
        }, intervals);
      };
    }
    return function (selector, component) {
      return retry(function () {
        return new Promise(function (resolve, reject) {
          var query = getSelector(selector, component);
          query.exec(function (res) {
            var _ref = res[0] || {},
              node = _ref.node,
              width = _ref.width,
              height = _ref.height;
            try {
              resolve(initCanvas(node, width, height));
            } catch (e) {
              reject(e);
            }
          });
        });
      }, intervals);
    };
  }
});

/**
 * 用于处理数据解码
 * @returns
 */
var pluginDecode = definePlugin({
  name: "decode",
  install: function install() {
    var _this$globals4 = this.globals,
      env = _this$globals4.env,
      br = _this$globals4.br;
    var b64Wrap = function b64Wrap(b64) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "image/png";
      return "data:".concat(type, ";base64,").concat(b64);
    };
    var decode = {
      toBuffer: function toBuffer(data) {
        var buffer = data.buffer,
          byteOffset = data.byteOffset,
          byteLength = data.byteLength;
        if (buffer instanceof ArrayBuffer) {
          return buffer.slice(byteOffset, byteOffset + byteLength);
        }
        var view = new Uint8Array(byteLength);
        view.set(data);
        return view.buffer;
      },
      bytesToString: function bytesToString(data) {
        var chunkSize = 8192; // 安全的块大小
        var result = "";
        for (var i = 0; i < data.length; i += chunkSize) {
          var chunk = data.slice(i, i + chunkSize);
          // 在安全的块上使用 String.fromCharCode
          result += String.fromCharCode.apply(null, Array.from(chunk));
        }
        return result;
      }
    };
    if (env === "h5") {
      var textDecoder = new TextDecoder("utf-8", {
        fatal: true
      });
      return _objectSpread2(_objectSpread2({}, decode), {}, {
        toDataURL: function toDataURL(data) {
          return b64Wrap(btoa(decode.bytesToString(data)));
        },
        utf8: function utf8(data, start, end) {
          return textDecoder.decode(data.subarray(start, end));
        }
      });
    }
    return _objectSpread2(_objectSpread2({}, decode), {}, {
      toDataURL: function toDataURL(data) {
        return b64Wrap(br.arrayBufferToBase64(decode.toBuffer(data)));
      },
      utf8: utf8
    });
  }
});

/**
 * 用于处理远程文件读取
 * @returns
 */
var pluginDownload = definePlugin({
  name: "remote",
  install: function install() {
    var _this$globals5 = this.globals,
      env = _this$globals5.env,
      br = _this$globals5.br;
    var isRemote = function isRemote(url) {
      return /^(blob:)?http(s)?:\/\//.test(url);
    };
    if (env === "h5") {
      return {
        is: isRemote,
        fetch: function (_fetch) {
          function fetch(_x2) {
            return _fetch.apply(this, arguments);
          }
          fetch.toString = function () {
            return _fetch.toString();
          };
          return fetch;
        }(function (url) {
          return fetch(url).then(function (response) {
            if (response.ok) {
              return response.arrayBuffer();
            }
            throw new Error("HTTP error, status=".concat(response.status, ", statusText=").concat(response.statusText));
          });
        })
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
          success: function success(res) {
            return resolve(res.data);
          },
          fail: reject
        });
      }).catch(function (err) {
        var errorMessage = err.errMsg || err.errorMessage || err.message;
        // FIXME: 可能存在写入网络缓存空间失败的情况，此时重新下载
        if (errorMessage.includes("ERR_CACHE_WRITE_FAILURE") || errorMessage.includes("ERR_CACHE_WRITE_FAILED")) {
          return download(url, false);
        }
        throw err;
      });
    }
    return {
      is: isRemote,
      fetch: function fetch(url) {
        return download(url, true);
      }
    };
  }
});

/**
 * 用于处理本地文件存储
 * @returns
 */
var pluginFsm = definePlugin({
  name: "local",
  install: function install() {
    var _this$globals6 = this.globals,
      env = _this$globals6.env,
      br = _this$globals6.br;
    if (env === "h5" || env === "tt") {
      return null;
    }
    var fsm = br.getFileSystemManager();
    return {
      exists: function exists(filepath) {
        return new Promise(function (resolve) {
          fsm.access({
            path: filepath,
            success: function success() {
              return resolve(true);
            },
            fail: function fail() {
              return resolve(false);
            }
          });
        });
      },
      write: function write(data, filePath) {
        return new Promise(function (resolve, reject) {
          fsm.writeFile({
            filePath: filePath,
            data: data,
            success: function success() {
              return resolve(filePath);
            },
            fail: reject
          });
        });
      },
      read: function read(filePath) {
        return new Promise(function (resolve, reject) {
          fsm.readFile({
            filePath: filePath,
            success: function success(res) {
              return resolve(res.data);
            },
            fail: reject
          });
        });
      },
      remove: function remove(filePath) {
        return new Promise(function (resolve, reject) {
          fsm.unlink({
            filePath: filePath,
            success: function success() {
              return resolve(filePath);
            },
            fail: reject
          });
        });
      }
    };
  }
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
  install: function install() {
    var local = this.local,
      decode = this.decode;
    var env = this.globals.env;
    var genImageSource = function genImageSource(data, _filepath) {
      return typeof data === "string" ? data : decode.toDataURL(data);
    };
    /**
     * 加载图片
     * @param img
     * @param url
     * @returns
     */
    function loadImage(img, url) {
      return new Promise(function (resolve, reject) {
        img.onload = function () {
          return resolve(img);
        };
        img.onerror = function () {
          return reject(new Error("SVGA LOADING FAILURE: ".concat(url)));
        };
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
        create: function create(_) {
          return new Image();
        },
        load: function load(createImage, data, filepath) {
          // 由于ImageBitmap在图片渲染上有优势，故优先使用
          if (data instanceof Uint8Array && "createImageBitmap" in globalThis) {
            return createImageBitmap(new Blob([decode.toBuffer(data)]));
          }
          if (data instanceof ImageBitmap) {
            return Promise.resolve(data);
          }
          return loadImage(createImage(), genImageSource(data, filepath));
        },
        release: releaseImage
      };
    }
    // FIXME: 支付宝小程序IDE保存临时文件会失败;抖音最大用户文件大小为10M
    if (env === "weapp") {
      genImageSource = /*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(data, filepath) {
          return _regenerator().w(function (_context) {
            while (1) switch (_context.n) {
              case 0:
                if (!(typeof data === "string")) {
                  _context.n = 1;
                  break;
                }
                return _context.a(2, data);
              case 1:
                return _context.a(2, local.write(decode.toBuffer(data), filepath).catch(function (ex) {
                  console.warn("image write fail: ".concat(ex.errorMessage || ex.errMsg || ex.message));
                  return decode.toDataURL(data);
                }));
            }
          }, _callee);
        }));
        return function genImageSource(_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }();
    }
    return {
      create: function create(canvas) {
        return canvas.createImage();
      },
      load: function () {
        var _load = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(createImage, data, filepath) {
          var _t, _t2, _t3;
          return _regenerator().w(function (_context2) {
            while (1) switch (_context2.n) {
              case 0:
                _t = loadImage;
                _t2 = createImage();
                _context2.n = 1;
                return genImageSource(data, filepath);
              case 1:
                _t3 = _context2.v;
                return _context2.a(2, _t(_t2, _t3));
            }
          }, _callee2);
        }));
        function load(_x5, _x6, _x7) {
          return _load.apply(this, arguments);
        }
        return load;
      }(),
      release: releaseImage
    };
  }
});
var pluginNow = definePlugin({
  name: "now",
  install: function install() {
    var _this$globals7 = this.globals,
      env = _this$globals7.env,
      br = _this$globals7.br;
    // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
    var perf = env === "h5" || env === "tt" ? performance : br.getPerformance();
    if (typeof (perf === null || perf === void 0 ? void 0 : perf.now) === "function") {
      // 支付宝小程序的performance.now()获取的是当前时间戳，单位是微秒。
      if (perf.now() - Date.now() > 1) {
        return function () {
          return perf.now() / 1000;
        };
      }
      // H5环境下，performance.now()获取的不是当前时间戳，而是从页面加载开始的时间戳，单位是毫秒。
      return function () {
        return perf.now();
      };
    }
    return function () {
      return Date.now();
    };
  }
});

/**
 * 用于创建离屏canvas
 * @returns
 */
var pluginOfsCanvas = definePlugin({
  name: "getOfsCanvas",
  install: function install() {
    var env = this.globals.env;
    var createOffscreenCanvas;
    if (env === "h5") {
      createOffscreenCanvas = function createOffscreenCanvas(options) {
        return new OffscreenCanvas(options.width, options.height);
      };
    } else if (env === "alipay") {
      createOffscreenCanvas = function createOffscreenCanvas(options) {
        return my.createOffscreenCanvas(options);
      };
    } else if (env === "tt") {
      createOffscreenCanvas = function createOffscreenCanvas(options) {
        var canvas = tt.createOffscreenCanvas();
        canvas.width = options.width;
        canvas.height = options.height;
        return canvas;
      };
    } else {
      createOffscreenCanvas = function createOffscreenCanvas(options) {
        return wx.createOffscreenCanvas(options);
      };
    }
    return function (options) {
      var type = options.type || "2d";
      var canvas = createOffscreenCanvas(_objectSpread2(_objectSpread2({}, options), {}, {
        type: type
      }));
      var context = canvas.getContext(type);
      return {
        canvas: canvas,
        context: context
      };
    };
  }
});

/**
 * 用于处理文件路径
 * @returns
 */
var pluginPath = definePlugin({
  name: "path",
  install: function install() {
    var _this$globals8 = this.globals,
      env = _this$globals8.env,
      br = _this$globals8.br;
    var filename = function filename(path) {
      var filepath = path.split(/\?#/g)[0];
      return filepath.substring(filepath.lastIndexOf("/") + 1);
    };
    if (env === "h5" || env === "tt") {
      return {
        USER_DATA_PATH: "",
        is: function is(_) {
          return false;
        },
        filename: filename,
        resolve: function resolve(filename, prefix) {
          return "";
        }
      };
    }
    var USER_DATA_PATH = br.env.USER_DATA_PATH;
    return {
      USER_DATA_PATH: USER_DATA_PATH,
      is: function is(filepath) {
        return filepath === null || filepath === void 0 ? void 0 : filepath.startsWith(USER_DATA_PATH);
      },
      filename: filename,
      resolve: function resolve(filename, prefix) {
        return "".concat(USER_DATA_PATH, "/").concat(prefix ? "".concat(prefix, "__") : "").concat(filename);
      }
    };
  }
});

/**
 * 用于处理requestAnimationFrame
 * @returns
 */
var pluginRaf = definePlugin({
  name: "rAF",
  install: function install() {
    var env = this.globals.env;
    function requestAnimationFrameImpl() {
      return function (callback) {
        return setTimeout(callback, Math.max(0, 16 - Date.now() % 16));
      };
    }
    if (env === "h5") {
      var rAF = "requestAnimationFrame" in globalThis ? requestAnimationFrame : requestAnimationFrameImpl();
      return function (_, callback) {
        return rAF(callback);
      };
    }
    return function (canvas, callback) {
      // 检查canvas是否存在
      try {
        return canvas.requestAnimationFrame(callback);
      } catch (error) {
        console.warn(error.message);
        return requestAnimationFrameImpl()(callback);
      }
    };
  }
});var EnhancedPlatform = /*#__PURE__*/function (_OctopusPlatform) {
  function EnhancedPlatform() {
    var _this;
    _classCallCheck(this, EnhancedPlatform);
    _this = _callSuper(this, EnhancedPlatform, [[pluginSelector, pluginCanvas, pluginOfsCanvas, pluginDecode, pluginDownload, pluginFsm, pluginImage, pluginNow, pluginPath, pluginRaf], "1.2.0"]);
    _this.init();
    return _this;
  }
  _inherits(EnhancedPlatform, _OctopusPlatform);
  return _createClass(EnhancedPlatform, [{
    key: "installPlugin",
    value: function installPlugin$1(plugin) {
      installPlugin(this, plugin);
    }
  }]);
}(OctopusPlatform);
var platform = new EnhancedPlatform();var ResourceManager = /*#__PURE__*/function () {
  function ResourceManager(painter) {
    _classCallCheck(this, ResourceManager);
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
    value: function loadImagesWithRecord(images_1, filename_1) {
      return __awaiter(this, arguments, void 0, function (images, filename) {
        var _this2 = this;
        var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "normal";
        return /*#__PURE__*/_regenerator().m(function _callee() {
          var imageAwaits, imageFilename;
          return _regenerator().w(function (_context) {
            while (1) switch (_context.n) {
              case 0:
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
        })();
      });
    }
    /**
     * 释放图片资源
     */
  }, {
    key: "release",
    value: function release() {
      // FIXME: 小程序 image 对象需要手动释放内存，否则可能导致小程序崩溃
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
      // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
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
        // 【微信】将存在本地的文件删除，防止用户空间被占满
        if (platform.globals.env === "weapp" && img.src.includes(platform.path.USER_DATA_PATH)) {
          platform.local.remove(img.src);
        }
        platform.image.release(img);
      }
    }
  }]);
}();function readFloatLEImpl() {
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
var readFloatLE = readFloatLEImpl();/**
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
}var Preflight = /*#__PURE__*/function () {
  function Preflight() {
    _classCallCheck(this, Preflight);
    this.caches = new Map();
    this.count = 0;
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
}();var Reader = /*#__PURE__*/function () {
  /**
   * Constructs a new reader instance using the specified buffer.
   * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
   * @constructor
   * @param {Uint8Array} buffer Buffer to read from
   */
  function Reader(buffer) {
    _classCallCheck(this, Reader);
    this.preflight = new Preflight();
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
      var result = platform.decode.utf8(this.buf, start, end);
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
}(); // 添加静态缓存，用于常用的空数组
Reader.EMPTY_UINT8ARRAY = new Uint8Array(0);var Layout = /*#__PURE__*/function () {
  function Layout() {
    _classCallCheck(this, Layout);
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
  return _createClass(Layout, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
}();var Transform = /*#__PURE__*/function () {
  function Transform() {
    _classCallCheck(this, Transform);
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
  return _createClass(Transform, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
}();var ShapeArgs = /*#__PURE__*/function () {
  function ShapeArgs() {
    _classCallCheck(this, ShapeArgs);
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
  return _createClass(ShapeArgs, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
}();var RectArgs = /*#__PURE__*/function () {
  function RectArgs() {
    _classCallCheck(this, RectArgs);
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
  return _createClass(RectArgs, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
}();var EllipseArgs = /*#__PURE__*/function () {
  function EllipseArgs() {
    _classCallCheck(this, EllipseArgs);
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
  return _createClass(EllipseArgs, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
}();var RGBAColor = /*#__PURE__*/function () {
  function RGBAColor() {
    _classCallCheck(this, RGBAColor);
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
  return _createClass(RGBAColor, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
}();var ShapeStyle = /*#__PURE__*/function () {
  function ShapeStyle() {
    _classCallCheck(this, ShapeStyle);
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
  return _createClass(ShapeStyle, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
}();var ShapeEntity = /*#__PURE__*/function () {
  function ShapeEntity() {
    _classCallCheck(this, ShapeEntity);
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
  return _createClass(ShapeEntity, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
}();var FrameEntity = /*#__PURE__*/function () {
  function FrameEntity() {
    _classCallCheck(this, FrameEntity);
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
  return _createClass(FrameEntity, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
FrameEntity.HIDDEN_FRAME = {
  alpha: 0
};var SpriteEntity = /*#__PURE__*/function () {
  function SpriteEntity() {
    _classCallCheck(this, SpriteEntity);
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
  return _createClass(SpriteEntity, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
}();var MovieParams = /*#__PURE__*/function () {
  function MovieParams() {
    _classCallCheck(this, MovieParams);
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
  return _createClass(MovieParams, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
}();var MovieEntity = /*#__PURE__*/function () {
  function MovieEntity() {
    _classCallCheck(this, MovieEntity);
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
  return _createClass(MovieEntity, null, [{
    key: "decode",
    value: function decode(reader, length) {
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
}();
MovieEntity.EMPTY_U8 = new Uint8Array(0);// import benchmark from "octopus-benchmark";
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
}/**
 * CurrentPoint对象池，用于减少对象创建和GC压力
 */
var PointPool = /*#__PURE__*/function () {
  function PointPool() {
    _classCallCheck(this, PointPool);
    this.pool = [];
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
}();var Renderer2D = /*#__PURE__*/function () {
  function Renderer2D(context) {
    _classCallCheck(this, Renderer2D);
    this.context = context;
    this.pointPool = new PointPool();
    this.lastResizeKey = "";
    this.globalTransform = undefined;
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
        var _iterator = _createForOfIteratorHelper(commands),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _step.value,
              command = _step$value.command,
              args = _step$value.args;
            if (Renderer2D.SVG_PATH.has(command)) {
              this.drawBezierElement(this.currentPoint, command, args.split(/[\s,]+/).filter(Boolean));
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
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
      var _a, _b, _c, _d, _e, _f, _g, _h, _j;
      var type = shape.type,
        path = shape.path,
        transform = shape.transform,
        styles = shape.styles;
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
      var _ref = transform !== null && transform !== void 0 ? transform : {},
        _ref$a = _ref.a,
        a = _ref$a === void 0 ? 1 : _ref$a,
        _ref$b = _ref.b,
        b = _ref$b === void 0 ? 0 : _ref$b,
        _ref$c = _ref.c,
        c = _ref$c === void 0 ? 0 : _ref$c,
        _ref$d = _ref.d,
        d = _ref$d === void 0 ? 1 : _ref$d,
        _ref$tx = _ref.tx,
        tx = _ref$tx === void 0 ? 0 : _ref$tx,
        _ref$ty = _ref.ty,
        ty = _ref$ty === void 0 ? 0 : _ref$ty;
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
Renderer2D.SVG_PATH = new Set(["M", "L", "H", "V", "Z", "C", "S", "Q", "m", "l", "h", "v", "z", "c", "s", "q"]);
Renderer2D.SVG_LETTER_REGEXP = /[a-zA-Z]/;/**
 * 动画控制器
 */
var Animator = /*#__PURE__*/function () {
  function Animator() {
    _classCallCheck(this, Animator);
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
     * 动画暂停时的时间偏差
     */
    this.pauseTime = 0;
    /**
     * 循环持续时间
     */
    this.loopDuration = 0;
    this.onAnimate = platform.noop;
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
  return _createClass(Animator, [{
    key: "setConfig",
    value: function setConfig(duration, loopStart, loop, fillValue) {
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
      var _this = this;
      if (this.isRunning) {
        this.doDeltaTime(platform.now() - this.startTime);
        if (this.isRunning) {
          this.onAnimate(function () {
            return _this.doFrame();
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
}();// DEFLATE is a complex format; to read this code, you should probably check the RFC first:
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
  for (var _i = 1; _i < 30; ++_i) {
    for (var j = b[_i]; j < b[_i + 1]; ++j) {
      r[j] = j - b[_i] << 5 | _i;
    }
  }
  return {
    b: b,
    r: r
  };
};
var _freb = freb(fleb, 2),
  fl = _freb.b,
  revfl = _freb.r;
// we can ignore the fact that the other numbers are wrong; they never happen anyway
fl[28] = 258, revfl[258] = 28;
var _freb2 = freb(fdeb, 0),
  fd = _freb2.b,
  revfd = _freb2.r;
// map of value to reverse (assuming 16 bits)
var rev = new u16(32768);
for (var i$1 = 0; i$1 < 32768; ++i$1) {
  // reverse table algorithm from SO
  var x = (i$1 & 0xAAAA) >> 1 | (i$1 & 0x5555) << 1;
  x = (x & 0xCCCC) >> 2 | (x & 0x3333) << 2;
  x = (x & 0xF0F0) >> 4 | (x & 0x0F0F) << 4;
  rev[i$1] = ((x & 0xFF00) >> 8 | (x & 0x00FF) << 8) >> 1;
}
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
for (var _i2$1 = 0; _i2$1 < 144; ++_i2$1) flt[_i2$1] = 8;
for (var _i3 = 144; _i3 < 256; ++_i3) flt[_i3] = 9;
for (var _i4 = 256; _i4 < 280; ++_i4) flt[_i4] = 7;
for (var _i5 = 280; _i5 < 288; ++_i5) flt[_i5] = 8;
// fixed distance tree
var fdt = new u8(32);
for (var _i6 = 0; _i6 < 32; ++_i6) fdt[_i6] = 5;
// fixed length map
var flm = /*#__PURE__*/hMap(flt, 9, 0),
  flrm = /*#__PURE__*/hMap(flt, 9, 1);
// fixed distance map
var fdm = /*#__PURE__*/hMap(fdt, 5, 0),
  fdrm = /*#__PURE__*/hMap(fdt, 5, 1);
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
          var _b2 = fdeb[dsym];
          _dt += bits16(dat, pos) & (1 << _b2) - 1, pos += _b2;
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
// starting at p, write the minimum number of bits that can hold v to d
var wbits = function wbits(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
};
// starting at p, write the minimum number of bits (>8) that can hold v to d
var wbits16 = function wbits16(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
};
// creates code lengths from a frequency table
var hTree = function hTree(d, mb) {
  // Need extra info to make a tree
  var t = [];
  for (var _i1 = 0; _i1 < d.length; ++_i1) {
    if (d[_i1]) t.push({
      s: _i1,
      f: d[_i1]
    });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s) return {
    t: et,
    l: 0
  };
  if (s == 1) {
    var v = new u8(t[0].s + 1);
    v[t[0].s] = 1;
    return {
      t: v,
      l: 1
    };
  }
  t.sort(function (a, b) {
    return a.f - b.f;
  });
  // after i2 reaches last ind, will be stopped
  // freq must be greater than largest possible number of symbols
  t.push({
    s: -1,
    f: 25001
  });
  var l = t[0],
    r = t[1],
    i0 = 0,
    i1 = 1,
    i2 = 2;
  t[0] = {
    s: -1,
    f: l.f + r.f,
    l: l,
    r: r
  };
  // efficient algorithm from UZIP.js
  // i0 is lookbehind, i2 is lookahead - after processing two low-freq
  // symbols that combined have high freq, will start processing i2 (high-freq,
  // non-composite) symbols instead
  // see https://reddit.com/r/photopea/comments/ikekht/uzipjs_questions/
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i2].f ? i0++ : i2++];
    r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
    t[i1++] = {
      s: -1,
      f: l.f + r.f,
      l: l,
      r: r
    };
  }
  var maxSym = t2[0].s;
  for (var _i10 = 1; _i10 < s; ++_i10) {
    if (t2[_i10].s > maxSym) maxSym = t2[_i10].s;
  }
  // code lengths
  var tr = new u16(maxSym + 1);
  // max bits in tree
  var mbt = _ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    // more algorithms from UZIP.js
    // TODO: find out how this code works (debt)
    //  ind    debt
    var _i11 = 0,
      dt = 0;
    //    left            cost
    var lft = mbt - mb,
      cst = 1 << lft;
    t2.sort(function (a, b) {
      return tr[b.s] - tr[a.s] || a.f - b.f;
    });
    for (; _i11 < s; ++_i11) {
      var _i12 = t2[_i11].s;
      if (tr[_i12] > mb) {
        dt += cst - (1 << mbt - tr[_i12]);
        tr[_i12] = mb;
      } else break;
    }
    dt >>= lft;
    while (dt > 0) {
      var _i13 = t2[_i11].s;
      if (tr[_i13] < mb) dt -= 1 << mb - tr[_i13]++ - 1;else ++_i11;
    }
    for (; _i11 >= 0 && dt; --_i11) {
      var _i14 = t2[_i11].s;
      if (tr[_i14] == mb) {
        --tr[_i14];
        ++dt;
      }
    }
    mbt = mb;
  }
  return {
    t: new u8(tr),
    l: mbt
  };
};
// get the max length and assign length codes
var _ln = function ln(n, l, d) {
  return n.s == -1 ? Math.max(_ln(n.l, l, d + 1), _ln(n.r, l, d + 1)) : l[n.s] = d;
};
// length codes generation
var lc = function lc(c) {
  var s = c.length;
  // Note that the semicolon was intentional
  while (s && !c[--s]);
  var cl = new u16(++s);
  //  ind      num         streak
  var cli = 0,
    cln = c[0],
    cls = 1;
  var w = function w(v) {
    cl[cli++] = v;
  };
  for (var _i15 = 1; _i15 <= s; ++_i15) {
    if (c[_i15] == cln && _i15 != s) ++cls;else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138) w(32754);
        if (cls > 2) {
          w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w(cln), --cls;
        for (; cls > 6; cls -= 6) w(8304);
        if (cls > 2) w(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--) w(cln);
      cls = 1;
      cln = c[_i15];
    }
  }
  return {
    c: cl.subarray(0, cli),
    n: s
  };
};
// calculate the length of output from tree, code lengths
var clen = function clen(cf, cl) {
  var l = 0;
  for (var _i16 = 0; _i16 < cl.length; ++_i16) l += cf[_i16] * cl[_i16];
  return l;
};
// writes a fixed block
// returns the new bit pos
var wfblk = function wfblk(out, pos, dat) {
  // no need to write 00 as type: TypedArray defaults to 0
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var _i17 = 0; _i17 < s; ++_i17) out[o + _i17 + 4] = dat[_i17];
  return (o + 4 + s) * 8;
};
// writes a block
var wblk = function wblk(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _hTree = hTree(lf, 15),
    dlt = _hTree.t,
    mlb = _hTree.l;
  var _hTree2 = hTree(df, 15),
    ddt = _hTree2.t,
    mdb = _hTree2.l;
  var _lc = lc(dlt),
    lclt = _lc.c,
    nlc = _lc.n;
  var _lc2 = lc(ddt),
    lcdt = _lc2.c,
    ndc = _lc2.n;
  var lcfreq = new u16(19);
  for (var _i18 = 0; _i18 < lclt.length; ++_i18) ++lcfreq[lclt[_i18] & 31];
  for (var _i19 = 0; _i19 < lcdt.length; ++_i19) ++lcfreq[lcdt[_i19] & 31];
  var _hTree3 = hTree(lcfreq, 7),
    lct = _hTree3.t,
    mlcb = _hTree3.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc);
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen) return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var _i20 = 0; _i20 < nlcc; ++_i20) wbits(out, p + 3 * _i20, lct[clim[_i20]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var _i21 = 0; _i21 < clct.length; ++_i21) {
        var len = clct[_i21] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15) wbits(out, p, clct[_i21] >> 5 & 127), p += clct[_i21] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var _i22 = 0; _i22 < li; ++_i22) {
    var sym = syms[_i22];
    if (sym > 255) {
      var _len = sym >> 18 & 31;
      wbits16(out, p, lm[_len + 257]), p += ll[_len + 257];
      if (_len > 7) wbits(out, p, sym >> 23 & 31), p += fleb[_len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3) wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[sym]), p += ll[sym];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
// deflate options (nice << 13) | chain
var deo = /*#__PURE__*/new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
// empty
var et = /*#__PURE__*/new u8(0);
// compresses data into a raw DEFLATE buffer
var dflt = function dflt(dat, lvl, plvl, pre, post, st) {
  var s = st.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7000)) + post);
  // writing to this writes to the output buffer
  var w = o.subarray(pre, o.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos) w[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13,
      c = opt & 8191;
    var msk = (1 << plvl) - 1;
    //    prev 2-byte val map    curr 2-byte val map
    var prev = st.p || new u16(32768),
      head = st.h || new u16(msk + 1);
    var bs1 = Math.ceil(plvl / 3),
      bs2 = 2 * bs1;
    var hsh = function hsh(i) {
      return (dat[i] ^ dat[i + 1] << bs1 ^ dat[i + 2] << bs2) & msk;
    };
    // 24576 is an arbitrary number of maximum symbols per block
    // 424 buffer for last block
    var syms = new i32(25000);
    // length/literal freq   distance freq
    var lf = new u16(288),
      df = new u16(32);
    //  l/lcnt  exbits  index          l/lind  waitdx          blkpos
    var _lc3 = 0,
      eb = 0,
      _i23 = st.i || 0,
      li = 0,
      wi = st.w || 0,
      bs = 0;
    for (; _i23 + 2 < s; ++_i23) {
      // hash value
      var hv = hsh(_i23);
      // index mod 32768    previous index mod
      var imod = _i23 & 32767,
        pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      // We always should modify head and prev, but only add symbols if
      // this data is not yet processed ("wait" for wait index)
      if (wi <= _i23) {
        // bytes remaining
        var rem = s - _i23;
        if ((_lc3 > 7000 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, _i23 - bs, pos);
          li = _lc3 = eb = 0, bs = _i23;
          for (var j = 0; j < 286; ++j) lf[j] = 0;
          for (var _j = 0; _j < 30; ++_j) df[_j] = 0;
        }
        //  len    dist   chain
        var l = 2,
          d = 0,
          ch = c,
          dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(_i23 - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, _i23);
          // max possible length
          // not capped at dif because decompressors implement "rolling" index population
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch && imod != pimod) {
            if (dat[_i23 + l] == dat[_i23 + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[_i23 + nl] == dat[_i23 + nl - dif]; ++nl);
              if (nl > l) {
                l = nl, d = dif;
                // break out early when we reach "nice" (we are satisfied enough)
                if (nl > maxn) break;
                // now, find the rarest 2-byte sequence within this
                // length of literals and search for that instead.
                // Much faster than just using the start
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var _j2 = 0; _j2 < mmd; ++_j2) {
                  var ti = _i23 - dif + _j2 & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md) md = cd, pimod = ti;
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
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31,
            din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = _i23 + l;
          ++_lc3;
        } else {
          syms[li++] = dat[_i23];
          ++lf[dat[_i23]];
        }
      }
    }
    for (_i23 = Math.max(_i23, wi); _i23 < s; ++_i23) {
      syms[li++] = dat[_i23];
      ++lf[dat[_i23]];
    }
    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, _i23 - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w[pos / 8 | 0] << 3;
      // shft(pos) now 1 less if pos & 7 != 0
      pos -= 7;
      st.h = head, st.p = prev, st.i = _i23, st.w = wi;
    }
  } else {
    for (var _i24 = st.w || 0; _i24 < s + lst; _i24 += 65535) {
      // end
      var e = _i24 + 65535;
      if (e >= s) {
        // write final block
        w[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w, pos + 1, dat.subarray(_i24, e));
    }
    st.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
// Adler32
var adler = function adler() {
  var a = 1,
    b = 0;
  return {
    p: function p(d) {
      // closures have awful performance
      var n = a,
        m = b;
      var l = d.length | 0;
      for (var _i25 = 0; _i25 != l;) {
        var e = Math.min(_i25 + 2655, l);
        for (; _i25 < e; ++_i25) m += n += d[_i25];
        n = (n & 65535) + 15 * (n >> 16), m = (m & 65535) + 15 * (m >> 16);
      }
      a = n, b = m;
    },
    d: function d() {
      a %= 65521, b %= 65521;
      return (a & 255) << 24 | (a & 0xFF00) << 8 | (b & 255) << 8 | b >> 8;
    }
  };
};
// deflate with opts
var dopt = function dopt(dat, opt, pre, post, st) {
  if (!st) {
    st = {
      l: 1
    };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
};
// write bytes
var wbytes = function wbytes(d, b, v) {
  for (; v; ++b) d[b] = v, v >>>= 8;
};
// zlib header
var zlh = function zlh(c, o) {
  var _a, _b;
  var lv = (_a = o.level) !== null && _a !== void 0 ? _a : 0,
    fl = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
  c[0] = 120, c[1] = fl << 6 | (((_b = o.dictionary) !== null && _b !== void 0 ? _b : 0) && 32);
  c[1] |= 31 - (c[0] << 8 | c[1]) % 31;
  if (o.dictionary) {
    var h = adler();
    h.p(o.dictionary);
    wbytes(c, 2, h.d());
  }
};
// zlib start
var zls = function zls(d, dict) {
  if ((d[0] & 15) != 8 || d[0] >> 4 > 7 || (d[0] << 8 | d[1]) % 31) _err(6, 'invalid zlib data');
  if ((d[1] >> 5 & 1) == +!dict) _err(6, 'invalid zlib data: ' + (d[1] & 32 ? 'need' : 'unexpected') + ' dictionary');
  return (d[1] >> 3 & 4) + 2;
};
// before you yell at me for not just using extends, my reason is that TS inheritance is hard to workerize.
/**
 * Compress data with Zlib
 * @param data The data to compress
 * @param opts The compression options
 * @returns The zlib-compressed version of the data
 */
function zlibSync(data) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
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
function unzlibSync(data) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return inflt(data.subarray(zls(data, opts.dictionary), -4), {
    i: 2
  }, opts && opts.out, opts && opts.dictionary);
}var CRC32 = /*#__PURE__*/function () {
  function CRC32() {
    _classCallCheck(this, CRC32);
    this.caches = new Map();
  }
  return _createClass(CRC32, [{
    key: "calculate",
    value: function calculate(buff) {
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
        crc = crc >>> 8 ^ CRC32.table[(crc ^ buff[i]) & 0xff];
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
}();
// CRC32 Table 初始化
CRC32.table = Uint32Array.from(Array(256), function (_, i) {
  var c = i;
  for (var j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1;
  }
  return c >>> 0;
});
CRC32.WHITE_COLOR = 0xffffffff;var PNGEncoder = /*#__PURE__*/function () {
  function PNGEncoder(width, height) {
    _classCallCheck(this, PNGEncoder);
    this.width = width;
    this.height = height;
    this.crc32 = new CRC32();
    this.view = new DataView(new ArrayBuffer(4 * width * height));
  }
  return _createClass(PNGEncoder, [{
    key: "createChunk",
    value: function createChunk(type, data) {
      // 长度（4字节，大端序）
      var length = new Uint8Array(4);
      new DataView(length.buffer).setUint32(0, data.length, false);
      // 块类型（4字节， ASCII）
      var chunkType = Uint8Array.from(type, function (c) {
        return c.charCodeAt(0);
      });
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
    }
  }, {
    key: "createIHDRChunk",
    value: function createIHDRChunk() {
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
    }
  }, {
    key: "createIDATChunk",
    value: function createIDATChunk() {
      var width = this.width,
        height = this.height;
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
    }
  }, {
    key: "setPixel",
    value: function setPixel(x, y, pixel) {
      this.view.setUint32((y * this.width + x) * 4, pixel, false);
    }
  }, {
    key: "write",
    value: function write(pixels) {
      var width = this.width,
        height = this.height;
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
          pixel = (r << 24 | g << 16 | b << 8 | a) >>> 0;
          this.setPixel(x, y, pixel);
        }
      }
      return this;
    }
  }, {
    key: "flush",
    value: function flush() {
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
    }
  }]);
}();// ---------------------------------------------------------------------
// qrBitBuffer
// ---------------------------------------------------------------------
var BitBuffer = /*#__PURE__*/function () {
  function BitBuffer() {
    _classCallCheck(this, BitBuffer);
    this.buffer = [];
    this.lengthInBits = 0;
  }
  return _createClass(BitBuffer, [{
    key: "getAt",
    value: function getAt(i) {
      var bufIndex = ~~(i / 8);
      return (this.buffer[bufIndex] >>> 7 - i % 8 & 1) === 1;
    }
  }, {
    key: "put",
    value: function put(num, length) {
      for (var i = 0; i < length; i++) {
        this.putBit((num >>> length - i - 1 & 1) === 1);
      }
    }
  }, {
    key: "putBit",
    value: function putBit(bit) {
      var len = this.lengthInBits,
        buffer = this.buffer;
      var bufIndex = ~~(len / 8);
      if (buffer.length <= bufIndex) {
        buffer.push(0);
      }
      if (bit) {
        buffer[bufIndex] |= 0x80 >>> len % 8;
      }
      this.lengthInBits += 1;
    }
  }]);
}();// ---------------------------------------------------------------------
// QRMode
// ---------------------------------------------------------------------
var QRMode = {
  MODE_NUMBER: 1 << 0,
  MODE_ALPHA_NUM: 1 << 1,
  MODE_8BIT_BYTE: 1 << 2,
  MODE_KANJI: 1 << 3
};
// ---------------------------------------------------------------------
// QRErrorCorrectLevel
// ---------------------------------------------------------------------
var QRErrorCorrectLevel = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2
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
  PATTERN111: 7
};var BitByte = /*#__PURE__*/function () {
  function BitByte(data) {
    _classCallCheck(this, BitByte);
    var parsedData = [];
    // Added to support UTF-8 Characters
    for (var i = 0; i < data.length; i++) {
      var byteArray = [];
      var code = data.charCodeAt(i);
      if (code > 0x10000) {
        byteArray[0] = 0xf0 | (code & 0x1c0000) >>> 18;
        byteArray[1] = 0x80 | (code & 0x3f000) >>> 12;
        byteArray[2] = 0x80 | (code & 0xfc0) >>> 6;
        byteArray[3] = 0x80 | code & 0x3f;
      } else if (code > 0x800) {
        byteArray[0] = 0xe0 | (code & 0xf000) >>> 12;
        byteArray[1] = 0x80 | (code & 0xfc0) >>> 6;
        byteArray[2] = 0x80 | code & 0x3f;
      } else if (code > 0x80) {
        byteArray[0] = 0xc0 | (code & 0x7c0) >>> 6;
        byteArray[1] = 0x80 | code & 0x3f;
      } else {
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
  return _createClass(BitByte, [{
    key: "mode",
    get: function get() {
      return QRMode.MODE_8BIT_BYTE;
    }
  }, {
    key: "length",
    get: function get() {
      return this.bytes.length;
    }
  }, {
    key: "write",
    value: function write(buff) {
      var bytes = this.bytes;
      for (var i = 0; i < bytes.length; i++) {
        buff.put(bytes[i], 8);
      }
    }
  }]);
}();var RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];
var RSBlock = /*#__PURE__*/function () {
  function RSBlock() {
    _classCallCheck(this, RSBlock);
  }
  return _createClass(RSBlock, [{
    key: "getRSBlockTable",
    value: function getRSBlockTable(typeNumber, errorCorrectLevel) {
      var L = QRErrorCorrectLevel.L,
        M = QRErrorCorrectLevel.M,
        Q = QRErrorCorrectLevel.Q,
        H = QRErrorCorrectLevel.H;
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
    }
  }, {
    key: "getRSBlocks",
    value: function getRSBlocks(typeNumber, errorCorrectLevel) {
      var rsBlock = this.getRSBlockTable(typeNumber, errorCorrectLevel);
      var length = rsBlock.length / 3;
      var list = [];
      for (var i = 0; i < length; i++) {
        var count = rsBlock[i * 3];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];
        for (var j = 0; j < count; j++) {
          list.push({
            totalCount: totalCount,
            dataCount: dataCount
          });
        }
      }
      return list;
    }
  }]);
}();// ---------------------------------------------------------------------
// QRMath
// ---------------------------------------------------------------------
var EXP_TABLE = new Array(256);
var LOG_TABLE = new Array(256);
// initialize tables
for (var i = 0; i < 8; i++) {
  EXP_TABLE[i] = 1 << i;
}
for (var _i = 8; _i < 256; _i++) {
  EXP_TABLE[_i] = EXP_TABLE[_i - 4] ^ EXP_TABLE[_i - 5] ^ EXP_TABLE[_i - 6] ^ EXP_TABLE[_i - 8];
}
for (var _i2 = 0; _i2 < 255; _i2++) {
  LOG_TABLE[EXP_TABLE[_i2]] = _i2;
}
var QRMath = {
  glog: function glog(n) {
    if (n < 1) {
      throw new Error("glog(".concat(n, ")"));
    }
    return LOG_TABLE[n];
  },
  gexp: function gexp(n) {
    if (n < 0) {
      n = 255 + n % 255;
    } else if (n > 255) {
      n %= 255;
    }
    return EXP_TABLE[n];
  }
};var Polynomial = /*#__PURE__*/function () {
  function Polynomial(num, shift) {
    _classCallCheck(this, Polynomial);
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
  return _createClass(Polynomial, [{
    key: "length",
    get: function get() {
      return this.num.length;
    }
  }, {
    key: "getAt",
    value: function getAt(i) {
      return this.num[i];
    }
  }, {
    key: "multiply",
    value: function multiply(e) {
      var glog = QRMath.glog,
        gexp = QRMath.gexp;
      var num = [];
      for (var i = 0; i < this.length; i++) {
        for (var j = 0; j < e.length; j++) {
          num[i + j] ^= gexp(glog(this.getAt(i)) + glog(e.getAt(j)));
        }
      }
      return new Polynomial(num, 0);
    }
  }, {
    key: "mod",
    value: function mod(e) {
      if (this.length - e.length < 0) {
        return this;
      }
      var glog = QRMath.glog,
        gexp = QRMath.gexp;
      var ratio = glog(this.getAt(0)) - glog(e.getAt(0));
      var num = [];
      for (var i = 0; i < this.length; i++) {
        var n = this.getAt(i);
        num[i] = i < e.length ? n ^ gexp(glog(e.getAt(i)) + ratio) : n;
      }
      // recursive call
      return new Polynomial(num, 0).mod(e);
    }
  }]);
}();var PATTERN_POSITION_TABLE = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]];
var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
var genBCHDigit = function genBCHDigit(data) {
  return data === 0 ? 0 : Math.log2(data);
};
var BCH_G15 = genBCHDigit(G15);
var BCH_G18 = genBCHDigit(G18);
// ---------------------------------------------------------------------
// QRUtil
// ---------------------------------------------------------------------
var Util = {
  getBCHTypeInfo: function getBCHTypeInfo(data) {
    var d = data << 10;
    while (genBCHDigit(d) - BCH_G15 >= 0) {
      d ^= G15 << genBCHDigit(d) - BCH_G15;
    }
    return (data << 10 | d) ^ G15_MASK;
  },
  getBCHTypeNumber: function getBCHTypeNumber(data) {
    var d = data << 12;
    while (genBCHDigit(d) - BCH_G18 >= 0) {
      d ^= G18 << genBCHDigit(d) - BCH_G18;
    }
    return data << 12 | d;
  },
  getPatternPosition: function getPatternPosition(typeNumber) {
    return PATTERN_POSITION_TABLE[typeNumber - 1];
  },
  getMaskFunction: function getMaskFunction(maskPattern) {
    var PATTERN000 = QRMaskPattern.PATTERN000,
      PATTERN001 = QRMaskPattern.PATTERN001,
      PATTERN010 = QRMaskPattern.PATTERN010,
      PATTERN011 = QRMaskPattern.PATTERN011,
      PATTERN100 = QRMaskPattern.PATTERN100,
      PATTERN101 = QRMaskPattern.PATTERN101,
      PATTERN110 = QRMaskPattern.PATTERN110,
      PATTERN111 = QRMaskPattern.PATTERN111;
    switch (maskPattern) {
      case PATTERN000:
        return function (i, j) {
          return (i + j) % 2 === 0;
        };
      case PATTERN001:
        return function (i) {
          return i % 2 === 0;
        };
      case PATTERN010:
        return function (_i, j) {
          return j % 3 === 0;
        };
      case PATTERN011:
        return function (i, j) {
          return (i + j) % 3 === 0;
        };
      case PATTERN100:
        return function (i, j) {
          return (~~(i / 2) + ~~(j / 3)) % 2 === 0;
        };
      case PATTERN101:
        return function (i, j) {
          return i * j % 2 + i * j % 3 === 0;
        };
      case PATTERN110:
        return function (i, j) {
          return (i * j % 2 + i * j % 3) % 2 === 0;
        };
      case PATTERN111:
        return function (i, j) {
          return (i * j % 3 + (i + j) % 2) % 2 === 0;
        };
      default:
        throw new Error("bad maskPattern: ".concat(maskPattern));
    }
  },
  getErrorCorrectPolynomial: function getErrorCorrectPolynomial(errorCorrectLength) {
    var a = new Polynomial([1], 0);
    for (var i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new Polynomial([1, QRMath.gexp(i)], 0));
    }
    return a;
  },
  getLengthInBits: function getLengthInBits(mode, type) {
    var MODE_NUMBER = QRMode.MODE_NUMBER,
      MODE_ALPHA_NUM = QRMode.MODE_ALPHA_NUM,
      MODE_8BIT_BYTE = QRMode.MODE_8BIT_BYTE,
      MODE_KANJI = QRMode.MODE_KANJI;
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
  getLostPoint: function getLostPoint(qr) {
    var moduleCount = qr.getModuleCount();
    var lostPoint = 0;
    // LEVEL1
    for (var row = 0; row < moduleCount; row++) {
      for (var col = 0; col < moduleCount; col++) {
        var dark = qr.isDark(row, col);
        var sameCount = 0;
        for (var r = -1; r <= 1; r++) {
          var nRow = row + r;
          if (nRow < 0 || moduleCount <= nRow) continue;
          for (var c = -1; c <= 1; c++) {
            var nCol = col + c;
            if (nCol < 0 || moduleCount <= nCol) continue;
            if (r === 0 && c === 0) continue;
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
    for (var _row = 0; _row < moduleCount - 1; _row++) {
      for (var _col = 0; _col < moduleCount - 1; _col++) {
        var count = 0;
        if (qr.isDark(_row, _col)) count++;
        if (qr.isDark(_row + 1, _col)) count++;
        if (qr.isDark(_row, _col + 1)) count++;
        if (qr.isDark(_row + 1, _col + 1)) count++;
        if (count === 0 || count === 4) {
          lostPoint += 3;
        }
      }
    }
    // LEVEL3
    for (var _row2 = 0; _row2 < moduleCount; _row2++) {
      for (var _col2 = 0; _col2 < moduleCount - 6; _col2++) {
        if (qr.isDark(_row2, _col2) && !qr.isDark(_row2, _col2 + 1) && qr.isDark(_row2, _col2 + 2) && qr.isDark(_row2, _col2 + 3) && qr.isDark(_row2, _col2 + 4) && !qr.isDark(_row2, _col2 + 5) && qr.isDark(_row2, _col2 + 6)) {
          lostPoint += 40;
        }
      }
    }
    for (var _col3 = 0; _col3 < moduleCount; _col3++) {
      for (var _row3 = 0; _row3 < moduleCount - 6; _row3++) {
        if (qr.isDark(_row3, _col3) && !qr.isDark(_row3 + 1, _col3) && qr.isDark(_row3 + 2, _col3) && qr.isDark(_row3 + 3, _col3) && qr.isDark(_row3 + 4, _col3) && !qr.isDark(_row3 + 5, _col3) && qr.isDark(_row3 + 6, _col3)) {
          lostPoint += 40;
        }
      }
    }
    // LEVEL4
    var darkCount = 0;
    for (var _col4 = 0; _col4 < moduleCount; _col4++) {
      for (var _row4 = 0; _row4 < moduleCount; _row4++) {
        if (qr.isDark(_row4, _col4)) {
          darkCount++;
        }
      }
    }
    var ratio = Math.abs(100 * darkCount / Math.pow(moduleCount, 2) - 50) / 5;
    return lostPoint + ratio * 10;
  }
};var PAD0 = 0xec;
var PAD1 = 0x11;
/**
 * QRCode实现
 * https://www.cnblogs.com/leestar54/p/15782929.html
 * @param typeNumber 1 to 40
 * @param errorCorrectLevel 'L','M','Q','H'
 */
var QRCode = /*#__PURE__*/function () {
  function QRCode(typeNumber, errorCorrectLevel) {
    _classCallCheck(this, QRCode);
    this.typeNumber = typeNumber;
    this.modules = [];
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = [];
    this.errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
  }
  return _createClass(QRCode, [{
    key: "makeImpl",
    value: function makeImpl(test, maskPattern) {
      this.moduleCount = this.typeNumber * 4 + 17;
      this.modules = function (moduleCount) {
        var modules = [];
        // 预设一个 moduleCount * moduleCount 的空白矩阵
        for (var row = 0; row < moduleCount; row++) {
          modules[row] = [];
          for (var col = 0; col < moduleCount; col++) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(this.moduleCount);
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
    }
  }, {
    key: "setupPositionProbePattern",
    value: function setupPositionProbePattern(row, col) {
      var modules = this.modules,
        moduleCount = this.moduleCount;
      for (var r = -1; r <= 7; r++) {
        var nr = row + r;
        if (nr <= -1 || moduleCount <= nr) continue;
        for (var c = -1; c <= 7; c++) {
          var nc = col + c;
          if (nc <= -1 || moduleCount <= nc) continue;
          modules[nr][nc] = r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4;
        }
      }
    }
  }, {
    key: "setupPositionAdjustPattern",
    value: function setupPositionAdjustPattern() {
      var typeNumber = this.typeNumber,
        modules = this.modules;
      var pos = Util.getPatternPosition(typeNumber);
      var length = pos.length;
      for (var i = 0; i < length; i++) {
        for (var j = 0; j < length; j++) {
          var row = pos[i];
          var col = pos[j];
          if (modules[row][col] != null) continue;
          for (var r = -2; r <= 2; r++) {
            for (var c = -2; c <= 2; c++) {
              modules[row + r][col + c] = r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0;
            }
          }
        }
      }
    }
  }, {
    key: "setupTimingPattern",
    value: function setupTimingPattern() {
      var moduleCount = this.moduleCount,
        modules = this.modules;
      var count = moduleCount - 8;
      for (var r = 8; r < count; r++) {
        if (modules[r][6] != null) continue;
        modules[r][6] = r % 2 === 0;
      }
      for (var c = 8; c < count; c++) {
        if (modules[6][c] != null) continue;
        modules[6][c] = c % 2 === 0;
      }
    }
  }, {
    key: "setupTypeInfo",
    value: function setupTypeInfo(test, maskPattern) {
      var errorCorrectLevel = this.errorCorrectLevel,
        modules = this.modules,
        moduleCount = this.moduleCount;
      var data = errorCorrectLevel << 3 | maskPattern;
      var bits = Util.getBCHTypeInfo(data);
      // vertical
      for (var i = 0; i < 15; i++) {
        var mod = !test && (bits >> i & 1) === 1;
        if (i < 6) {
          modules[i][8] = mod;
        } else if (i < 8) {
          modules[i + 1][8] = mod;
        } else {
          modules[moduleCount - 15 + i][8] = mod;
        }
      }
      // horizontal
      for (var _i = 0; _i < 15; _i++) {
        var _mod = !test && (bits >> _i & 1) === 1;
        if (_i < 8) {
          modules[8][moduleCount - _i - 1] = _mod;
        } else if (_i < 9) {
          modules[8][15 - _i] = _mod;
        } else {
          modules[8][15 - _i - 1] = _mod;
        }
      }
      // fixed module
      modules[moduleCount - 8][8] = !test;
    }
  }, {
    key: "getBestMaskPattern",
    value: function getBestMaskPattern() {
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
    }
  }, {
    key: "setupTypeNumber",
    value: function setupTypeNumber(test) {
      var typeNumber = this.typeNumber,
        modules = this.modules,
        moduleCount = this.moduleCount;
      var bits = Util.getBCHTypeNumber(typeNumber);
      for (var i = 0; i < 18; i++) {
        var mod = !test && (bits >> i & 1) === 1;
        modules[~~(i / 3)][i % 3 + moduleCount - 8 - 3] = mod;
        modules[i % 3 + moduleCount - 8 - 3][~~(i / 3)] = mod;
      }
    }
  }, {
    key: "createData",
    value: function createData(typeNumber, errorCorrectLevel, dataList) {
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
      for (var _i2 = 0; _i2 < rsBlocks.length; _i2++) {
        totalDataCount += rsBlocks[_i2].dataCount;
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
    }
  }, {
    key: "mapData",
    value: function mapData(data, maskPattern) {
      var modules = this.modules,
        moduleCount = this.moduleCount;
      var maskFunc = Util.getMaskFunction(maskPattern);
      var inc = -1;
      var row = moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      for (var col = row; col > 0; col -= 2) {
        if (col === 6) col -= 1;
        while (true) {
          for (var c = 0; c < 2; c++) {
            if (modules[row][col - c] == null) {
              var dark = false;
              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) === 1;
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
    }
  }, {
    key: "createBytes",
    value: function createBytes(bitBuffer, rsBlocks) {
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
        for (var _i3 = 0; _i3 < ecdata[r].length; _i3++) {
          var modIndex = _i3 + modPoly.length - ecdata[r].length;
          ecdata[r][_i3] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
        }
      }
      var totalCodeCount = 0;
      for (var _i4 = 0; _i4 < rsBlocks.length; _i4++) {
        totalCodeCount += rsBlocks[_i4].totalCount;
      }
      var data = new Array(totalCodeCount);
      var index = 0;
      for (var _i5 = 0; _i5 < maxDcCount; _i5++) {
        for (var _r = 0; _r < rsBlocks.length; _r++) {
          if (_i5 < dcdata[_r].length) {
            data[index++] = dcdata[_r][_i5];
          }
        }
      }
      for (var _i6 = 0; _i6 < maxEcCount; _i6++) {
        for (var _r2 = 0; _r2 < rsBlocks.length; _r2++) {
          if (_i6 < ecdata[_r2].length) {
            data[index++] = ecdata[_r2][_i6];
          }
        }
      }
      return data;
    }
  }, {
    key: "isDark",
    value: function isDark(row, col) {
      var moduleCount = this.moduleCount;
      if (row < 0 || moduleCount <= row || col < 0 || moduleCount <= col) {
        throw new Error("".concat(row, ", ").concat(col));
      }
      return this.modules[row][col];
    }
  }, {
    key: "addData",
    value: function addData(data) {
      this.dataList.push(new BitByte(data));
      this.dataCache = null;
    }
  }, {
    key: "getModuleCount",
    value: function getModuleCount() {
      return this.moduleCount;
    }
  }, {
    key: "make",
    value: function make() {
      this.makeImpl(false, this.getBestMaskPattern());
    }
  }]);
}();/**
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
    value: function download(url) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee() {
        var globals, remote, path, local, env, supportLocal, filepath, buff, _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              globals = platform.globals, remote = platform.remote, path = platform.path, local = platform.local;
              env = globals.env;
              supportLocal = env !== "h5" && env !== "tt";
              filepath = path.is(url) ? url : path.resolve(path.filename(url)); // 本地读取
              if (!supportLocal) {
                _context.n = 2;
                break;
              }
              _context.n = 1;
              return local.exists(filepath);
            case 1:
              if (!_context.v) {
                _context.n = 2;
                break;
              }
              return _context.a(2, local.read(filepath));
            case 2:
              _context.n = 3;
              return remote.fetch(url);
            case 3:
              buff = _context.v;
              if (!supportLocal) {
                _context.n = 7;
                break;
              }
              _context.p = 4;
              _context.n = 5;
              return local.write(buff, filepath);
            case 5:
              _context.n = 7;
              break;
            case 6:
              _context.p = 6;
              _t = _context.v;
              // eslint-disable-next-line no-console
              console.error(_t);
            case 7:
              return _context.a(2, buff);
          }
        }, _callee, null, [[4, 6]]);
      }));
    }
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
  }, {
    key: "load",
    value: function load(url) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee2() {
        var _t2, _t3, _t4;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _t2 = Parser;
              _context2.n = 1;
              return Parser.download(url);
            case 1:
              _t3 = _context2.v;
              _t4 = url;
              return _context2.a(2, _t2.parseVideo.call(_t2, _t3, _t4));
          }
        }, _callee2);
      }));
    }
  }]);
}();var noop = platform.noop;
var Painter = /*#__PURE__*/function () {
  /**
   *
   * @param mode
   *  - poster: 海报模式
   *  - animation: 动画模式
   *  - 默认为 animation
   * @param W 海报模式必须传入
   * @param H 海报模式必须传入
   */
  function Painter() {
    var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "animation";
    var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    _classCallCheck(this, Painter);
    this.mode = mode;
    /**
     * 主屏的 Canvas 元素
     * Front Screen
     */
    this.F = null;
    /**
     * 主屏的 Context 对象
     * Front Context
     */
    this.FC = null;
    /**
     * 副屏的 Canvas 元素
     * Background Screen
     */
    this.B = null;
    /**
     * 副屏的 Context 对象
     * Background Context
     */
    this.BC = null;
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
      if (type === "O" &&
      // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
      env === "h5" && navigator.userAgent.includes("Firefox")) {
        model.clear = "CR";
      } else if (type === "O" && env === "tt" || env === "alipay") {
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
    value: function register(selector, ofsSelector, component) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee() {
        var _this = this;
        var model, mode, getCanvas, getOfsCanvas, env, W, H, _getOfsCanvas, canvas, context, _yield$getCanvas, _canvas, _context, width, height, _W, _H, ofsResult, _t;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              model = this.model, mode = this.mode;
              getCanvas = platform.getCanvas, getOfsCanvas = platform.getOfsCanvas;
              env = platform.globals.env; // #region set main screen implement
              // -------- 创建主屏 ---------
              if (!(mode === "poster" && (env !== "h5" || "OffscreenCanvas" in globalThis))) {
                _context2.n = 1;
                break;
              }
              W = this.W, H = this.H;
              _getOfsCanvas = getOfsCanvas({
                width: W,
                height: H
              }), canvas = _getOfsCanvas.canvas, context = _getOfsCanvas.context;
              this.F = canvas;
              this.FC = context;
              this.setActionModel("O");
              _context2.n = 3;
              break;
            case 1:
              _context2.n = 2;
              return getCanvas(selector, component);
            case 2:
              _yield$getCanvas = _context2.v;
              _canvas = _yield$getCanvas.canvas;
              _context = _yield$getCanvas.context;
              width = _canvas.width, height = _canvas.height; // 添加主屏
              this.F = _canvas;
              this.FC = _context;
              this.setActionModel("C");
              if (mode === "poster") {
                _canvas.width = this.W;
                _canvas.height = this.H;
              } else {
                this.W = width;
                this.H = height;
              }
            case 3:
              // #endregion set main screen implement
              // #region clear main screen implement
              // ------- 生成主屏清理函数 -------
              // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布
              if (model.clear === "CL") {
                this.clearContainer = function () {
                  var W = _this.W,
                    H = _this.H,
                    FC = _this.FC;
                  FC.clearRect(0, 0, W, H);
                };
              } else {
                this.clearContainer = function () {
                  var W = _this.W,
                    H = _this.H,
                    F = _this.F;
                  F.width = W;
                  F.height = H;
                };
              }
              // #endregion clear main screen implement
              if (!(mode === "poster")) {
                _context2.n = 4;
                break;
              }
              this.B = this.F;
              this.BC = this.FC;
              this.clearSecondary = this.stick = noop;
              _context2.n = 11;
              break;
            case 4:
              // #region set secondary screen implement
              // ------- 创建副屏 ---------
              _W = this.W, _H = this.H;
              if (!(typeof ofsSelector === "string" && ofsSelector !== "")) {
                _context2.n = 6;
                break;
              }
              _context2.n = 5;
              return getCanvas(ofsSelector, component);
            case 5:
              ofsResult = _context2.v;
              ofsResult.canvas.width = _W;
              ofsResult.canvas.height = _H;
              this.setActionModel("C");
              _context2.n = 7;
              break;
            case 6:
              ofsResult = getOfsCanvas({
                width: _W,
                height: _H
              });
              this.setActionModel("O");
            case 7:
              this.B = ofsResult.canvas;
              this.BC = ofsResult.context;
              // #endregion set secondary screen implement
              // #region clear secondary screen implement
              // ------- 生成副屏清理函数 --------
              _t = model.clear;
              _context2.n = _t === "CR" ? 8 : _t === "CL" ? 9 : 10;
              break;
            case 8:
              this.clearSecondary = function () {
                var W = _this.W,
                  H = _this.H;
                // FIXME:【支付宝小程序】频繁创建新的 OffscreenCanvas 会出现崩溃现象
                var _getOfsCanvas2 = getOfsCanvas({
                    width: W,
                    height: H
                  }),
                  canvas = _getOfsCanvas2.canvas,
                  context = _getOfsCanvas2.context;
                _this.B = canvas;
                _this.BC = context;
              };
              return _context2.a(3, 11);
            case 9:
              this.clearSecondary = function () {
                var W = _this.W,
                  H = _this.H,
                  BC = _this.BC;
                // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布，无论是Canvas还是OffscreenCanvas
                BC.clearRect(0, 0, W, H);
              };
              return _context2.a(3, 11);
            case 10:
              this.clearSecondary = function () {
                var W = _this.W,
                  H = _this.H,
                  B = _this.B;
                B.width = W;
                B.height = H;
              };
            case 11:
              return _context2.a(2);
          }
        }, _callee, this);
      }));
    }
  }, {
    key: "stick",
    value: function stick() {
      var W = this.W,
        H = this.H,
        FC = this.FC,
        BC = this.BC,
        mode = this.mode;
      if (mode !== "poster") {
        FC.drawImage(BC.canvas, 0, 0, W, H);
      }
    }
    /**
     * 销毁画笔
     */
  }, {
    key: "destroy",
    value: function destroy() {
      this.clearContainer();
      this.clearSecondary();
      this.F = this.FC = this.B = this.BC = null;
      this.clearContainer = this.clearSecondary = this.stick = noop;
    }
  }]);
}();var Config = /*#__PURE__*/function () {
  function Config() {
    _classCallCheck(this, Config);
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
  return _createClass(Config, [{
    key: "register",
    value: function register(config) {
      if (typeof config.loop === "number" && config.loop >= 0) {
        this.loop = config.loop;
      }
      if (config.fillMode && ["forwards" /* PLAYER_FILL_MODE.FORWARDS */, "backwards" /* PLAYER_FILL_MODE.BACKWARDS */, "none" /* PLAYER_FILL_MODE.NONE */].includes(config.fillMode)) {
        this.fillMode = config.fillMode;
      }
      if (config.playMode && ["forwards" /* PLAYER_PLAY_MODE.FORWARDS */, "fallbacks" /* PLAYER_PLAY_MODE.FALLBACKS */].includes(config.playMode)) {
        this.playMode = config.playMode;
      }
      if (typeof config.startFrame === "number" && config.startFrame >= 0) {
        this.startFrame = config.startFrame;
      }
      if (typeof config.endFrame === "number" && config.endFrame >= 0) {
        this.endFrame = config.endFrame;
      }
      if (typeof config.loopStartFrame === "number" && config.loopStartFrame >= 0) {
        this.loopStartFrame = config.loopStartFrame;
      }
      if (typeof config.contentMode === "string") {
        this.contentMode = config.contentMode;
      }
    }
  }, {
    key: "setItem",
    value: function setItem(key, value) {
      this.register(_defineProperty({}, key, value));
    }
  }, {
    key: "getConfig",
    value: function getConfig(entity) {
      var playMode = this.playMode,
        loopStartFrame = this.loopStartFrame,
        startFrame = this.startFrame,
        endFrame = this.endFrame,
        fillMode = this.fillMode,
        loop = this.loop;
      var fps = entity.fps,
        sprites = entity.sprites;
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
      } else if (start > 0) {
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
        loopStart = loopStartFrame > start ? (loopStartFrame - start) * frameDuration : 0;
      } else {
        // 重置为开始帧
        currFrame = Math.min(loopStartFrame, end - 1);
        if (fillMode === "backwards" /* PLAYER_FILL_MODE.BACKWARDS */) {
          extFrame = 1;
        }
        loopStart = loopStartFrame < end ? (end - loopStartFrame) * frameDuration : 0;
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
          fillValue: extFrame * frameDuration
        }
      };
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
    /**
     * 渲染器实例
     */
    this.renderer = null;
  }
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
   * @property enableInObserver 是否启用 IntersectionObserver 监听容器是否处于浏览器视窗内，默认值 false
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
              container = config.container, secondary = config.secondary;
              this.config.register(config);
              // 监听容器是否处于浏览器视窗内
              // this.setIntersectionObserver()
              _context.n = 1;
              return this.painter.register(container, secondary, component);
            case 1:
              this.renderer = new Renderer2D(this.painter.BC);
              this.resource = new ResourceManager(this.painter);
              this.animator.onAnimate = platform.rAF.bind(null, this.painter.F);
            case 2:
              return _context.a(2);
          }
        }, _callee, this);
      }));
    }
    /**
     * 更新配置
     * @param key
     * @param value
     */
  }, {
    key: "setItem",
    value: function setItem(key, value) {
      this.config.setItem(key, value);
    }
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @returns Promise<void>
     */
  }, {
    key: "mount",
    value: function mount(videoEntity) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee2() {
        var images, filename;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              if (videoEntity) {
                _context2.n = 1;
                break;
              }
              throw new Error("videoEntity undefined");
            case 1:
              images = videoEntity.images, filename = videoEntity.filename;
              this.animator.stop();
              this.painter.clearSecondary();
              this.resource.release();
              this.entity = videoEntity;
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
      var _a, _b, _c;
      this.animator.stop();
      this.painter.destroy();
      (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.destroy();
      (_b = this.resource) === null || _b === void 0 ? void 0 : _b.release();
      (_c = this.resource) === null || _c === void 0 ? void 0 : _c.cleanup();
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
     * @param percent 目标百分比
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
      debugger;
      this.stepToFrame(frame, andPlay);
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
        renderer = this.renderer,
        resource = this.resource;
      var W = painter.W,
        H = painter.H;
      var materials = resource.materials,
        dynamicMaterials = resource.dynamicMaterials;
      var fillMode = config.fillMode,
        playMode = config.playMode,
        contentMode = config.contentMode;
      var _config$getConfig = config.getConfig(entity),
        currFrame = _config$getConfig.currFrame,
        startFrame = _config$getConfig.startFrame,
        endFrame = _config$getConfig.endFrame,
        totalFrame = _config$getConfig.totalFrame,
        spriteCount = _config$getConfig.spriteCount,
        aniConfig = _config$getConfig.aniConfig;
      var duration = aniConfig.duration,
        loopStart = aniConfig.loopStart,
        loop = aniConfig.loop,
        fillValue = aniConfig.fillValue;
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
      renderer.resize(contentMode, entity.size, {
        width: W,
        height: H
      });
      // 分段渲染函数
      var MAX_DRAW_TIME_PER_FRAME = 8;
      var MAX_ACCELERATE_DRAW_TIME_PER_FRAME = 3;
      var MAX_DYNAMIC_CHUNK_SIZE = 34;
      var MIN_DYNAMIC_CHUNK_SIZE = 1;
      var render = function render(head, tail) {
        return renderer.render(entity, materials, dynamicMaterials, currentFrame, head, tail);
      };
      // 动态调整每次绘制的块大小
      var dynamicChunkSize = 4; // 初始块大小
      var startTime;
      var chunk;
      var elapsed;
      // 使用`指数退避算法`平衡渲染速度和流畅度
      var patchDraw = function patchDraw(before) {
        startTime = platform.now();
        before();
        while (tail < spriteCount) {
          // 根据当前块大小计算nextTail
          chunk = Math.min(dynamicChunkSize, spriteCount - tail);
          nextTail = tail + chunk | 0;
          render(tail, nextTail);
          tail = nextTail;
          // 动态调整块大小
          elapsed = platform.now() - startTime;
          if (elapsed < MAX_ACCELERATE_DRAW_TIME_PER_FRAME) {
            dynamicChunkSize = Math.min(dynamicChunkSize * 2, MAX_DYNAMIC_CHUNK_SIZE); // 加快绘制
          } else if (elapsed > MAX_DRAW_TIME_PER_FRAME) {
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
            nextFrame = (timePercent === 0 ? endFrame : Math.ceil(exactFrame)) - 1;
            // FIXME: 倒序会有一帧的偏差，需要校准当前帧
            percent = currentFrame / totalFrame;
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
        // 如果不保留最后一帧渲染，则清空画布
        if (fillMode === "none" /* PLAYER_FILL_MODE.NONE */) {
          painter.clearContainer();
        }
        (_a = _this.onEnd) === null || _a === void 0 ? void 0 : _a.call(_this);
      };
      animator.start();
    }
  }]);
}();var Poster = /*#__PURE__*/function () {
  function Poster(width, height) {
    _classCallCheck(this, Poster);
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
      frame: 0
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
  return _createClass(Poster, [{
    key: "register",
    value: function register() {
      return __awaiter(this, arguments, void 0, function () {
        var _this = this;
        var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        var component = arguments.length > 1 ? arguments[1] : undefined;
        return /*#__PURE__*/_regenerator().m(function _callee() {
          return _regenerator().w(function (_context) {
            while (1) switch (_context.n) {
              case 0:
                _context.n = 1;
                return _this.painter.register(selector, "", component);
              case 1:
                _this.renderer = new Renderer2D(_this.painter.BC);
                _this.resource = new ResourceManager(_this.painter);
              case 2:
                return _context.a(2);
            }
          }, _callee);
        })();
      });
    }
    /**
     * 设置配置项
     * @param options 可配置项
     */
  }, {
    key: "setConfig",
    value: function setConfig() {
      return __awaiter(this, arguments, void 0, function () {
        var _this2 = this;
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var component = arguments.length > 1 ? arguments[1] : undefined;
        return /*#__PURE__*/_regenerator().m(function _callee2() {
          return _regenerator().w(function (_context2) {
            while (1) switch (_context2.n) {
              case 0:
                if (typeof options === "string") {
                  _this2.config.container = options;
                } else {
                  Object.assign(_this2.config, options);
                }
                _this2.isConfigured = true;
                _context2.n = 1;
                return _this2.register(_this2.config.container, component);
              case 1:
                return _context2.a(2);
            }
          }, _callee2);
        })();
      });
    }
    /**
     * 修改内容模式
     * @param contentMode
     */
  }, {
    key: "setContentMode",
    value: function setContentMode(contentMode) {
      this.config.contentMode = contentMode;
    }
    /**
     * 设置当前帧
     * @param frame
     */
  }, {
    key: "setFrame",
    value: function setFrame(frame) {
      this.config.frame = frame;
    }
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @param currFrame
     * @returns
     */
  }, {
    key: "mount",
    value: function mount(videoEntity) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee3() {
        var images, filename;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              if (videoEntity) {
                _context3.n = 1;
                break;
              }
              throw new Error("videoEntity undefined");
            case 1:
              if (this.isConfigured) {
                _context3.n = 3;
                break;
              }
              _context3.n = 2;
              return this.register();
            case 2:
              this.isConfigured = true;
            case 3:
              images = videoEntity.images, filename = videoEntity.filename;
              this.painter.clearContainer();
              this.resource.release();
              this.entity = videoEntity;
              _context3.n = 4;
              return this.resource.loadImagesWithRecord(images, filename);
            case 4:
              return _context3.a(2);
          }
        }, _callee3, this);
      }));
    }
    /**
     * 绘制海报
     */
  }, {
    key: "draw",
    value: function draw() {
      if (!this.entity) return;
      var painter = this.painter,
        renderer = this.renderer,
        resource = this.resource,
        entity = this.entity,
        config = this.config;
      renderer.resize(config.contentMode, entity.size, painter.F);
      renderer.render(entity, resource.materials, resource.dynamicMaterials, config.frame, 0, entity.sprites.length);
    }
    /**
     * 获取海报的 ImageData 数据
     */
  }, {
    key: "toImageData",
    value: function toImageData() {
      var _this$painter = this.painter,
        FC = _this$painter.FC,
        width = _this$painter.W,
        height = _this$painter.H;
      return FC.getImageData(0, 0, width, height);
    }
    /**
     * 销毁海报
     */
  }, {
    key: "destroy",
    value: function destroy() {
      var _a, _b, _c;
      this.painter.destroy();
      (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.destroy();
      (_b = this.resource) === null || _b === void 0 ? void 0 : _b.release();
      (_c = this.resource) === null || _c === void 0 ? void 0 : _c.cleanup();
      this.entity = undefined;
    }
  }]);
}();function parseOptions(options) {
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
    backgroundColor: backgroundColor
  };
}
var calcCellSizeAndPadding = function calcCellSizeAndPadding(moduleCount, size) {
  var cellSize = ~~(size / moduleCount);
  return {
    padding: ~~((size - moduleCount * cellSize) / 2),
    cellSize: cellSize || 2
  };
};
function generateImageBufferFromCode(options) {
  var _parseOptions = parseOptions(options),
    code = _parseOptions.code,
    typeNumber = _parseOptions.typeNumber,
    correctLevel = _parseOptions.correctLevel,
    size = _parseOptions.size,
    codeColor = _parseOptions.codeColor,
    backgroundColor = _parseOptions.backgroundColor;
  var qr;
  try {
    qr = new QRCode(typeNumber, correctLevel);
    qr.addData(code);
    qr.make();
  } catch (e) {
    if (typeNumber >= 40) {
      throw new Error("Text too long to encode");
    }
    return arguments.callee({
      code: code,
      size: size,
      correctLevel: correctLevel,
      typeNumber: typeNumber + 1,
      codeColor: codeColor,
      backgroundColor: backgroundColor
    });
  }
  // calc cellsize and margin
  var moduleCount = qr.getModuleCount();
  var _calcCellSizeAndPaddi = calcCellSizeAndPadding(moduleCount, size),
    padding = _calcCellSizeAndPaddi.padding,
    cellSize = _calcCellSizeAndPaddi.cellSize;
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
      } else {
        png.setPixel(x, y, BACKGROUND_COLOR);
      }
    }
  }
  return png.flush();
}
function generateImageFromCode(options) {
  var buff = generateImageBufferFromCode(options);
  return platform.decode.toDataURL(buff);
}function createBufferOfImageData(imageData) {
  var width = imageData.width,
    height = imageData.height,
    data = imageData.data;
  return new PNGEncoder(width, height).write(data).flush();
}
/**
 * @deprecated 请使用 createBufferOfImageData 代替，此方法可能在后续版本中移除
 */
var getBufferFromImageData = createBufferOfImageData;
function createImageDataUrl(imageData) {
  var buff = createBufferOfImageData(imageData);
  return platform.decode.toDataURL(buff);
}
/**
 * @deprecated 请使用 createImageDataUrl 代替，此方法可能在后续版本中移除
 */
var getDataURLFromImageData = createImageDataUrl;/**
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
  if ((cmf * 256 + flg) % 31 !== 0) {
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
  var adler32 = adler32Bytes[0] << 24 | adler32Bytes[1] << 16 | adler32Bytes[2] << 8 | adler32Bytes[3];
  // 有效的ADLER-32值应大于0（除非是空数据）
  if (data.length > 2 && adler32 === 0) {
    return false;
  }
  // 所有检查都通过，数据可能是zlib压缩格式
  return true;
}var VideoManager = /*#__PURE__*/function () {
  function VideoManager(loadMode, options) {
    _classCallCheck(this, VideoManager);
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
      preprocess: function preprocess(bucket) {
        return Parser.download(bucket.origin);
      },
      /**
       * 后处理动效数据
       * @param bucket
       * @param data
       * @returns
       */
      postprocess: function postprocess(bucket, data) {
        return Parser.parseVideo(data, bucket.origin, true);
      },
      /**
       * 清理数据
       * @param buckets
       * @returns
       */
      cleanup: function cleanup(buckets) {
        platform.globals;
          var local = platform.local,
          path = platform.path;
        buckets.forEach(function (bucket) {
          if (path.is(bucket.local)) {
            local.remove(bucket.local);
          }
        });
      }
    };
    if (typeof loadMode === "string") {
      this.loadMode = loadMode;
    }
    Object.assign(this.options, options);
  }
  /**
   * 更新留存指针位置
   */
  return _createClass(VideoManager, [{
    key: "size",
    get:
    /**
     * 获取视频池大小
     */
    function get() {
      return this.buckets.length;
    }
  }, {
    key: "updateRemainRange",
    value: function updateRemainRange(point, maxRemain, totalCount) {
      if (point < 0) {
        this.point = 0;
      } else if (point >= totalCount) {
        this.point = totalCount - 1;
      } else {
        this.point = point;
      }
      if (this.loadMode === "whole") {
        this.remainStart = 0;
        this.remainEnd = totalCount;
      } else {
        if (maxRemain < 1) {
          this.maxRemain = 1;
        } else if (maxRemain > totalCount) {
          this.maxRemain = totalCount;
        } else {
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
    }
    /**
     * 指针是否在留存空间内
     * @param point
     * @returns
     */
  }, {
    key: "includeRemainRange",
    value: function includeRemainRange(point) {
      if (this.remainStart < this.remainEnd) {
        return point >= this.remainStart && point < this.remainEnd;
      }
      if (this.remainStart > this.remainEnd) {
        return point >= this.remainStart || point < this.remainEnd;
      }
      return true;
    }
  }, {
    key: "downloadAndParseVideo",
    value: function downloadAndParseVideo(bucket_1) {
      return __awaiter(this, arguments, void 0, function (bucket) {
        var _this = this;
        var needParse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return /*#__PURE__*/_regenerator().m(function _callee() {
          var options, data;
          return _regenerator().w(function (_context) {
            while (1) switch (_context.n) {
              case 0:
                options = _this.options;
                _context.n = 1;
                return options.preprocess(bucket);
              case 1:
                data = _context.v;
                if (!needParse) {
                  _context.n = 2;
                  break;
                }
                return _context.a(2, options.postprocess(bucket, data));
              case 2:
                return _context.a(2, data);
            }
          }, _callee);
        })();
      });
    }
    /**
     * 创建bucket
     * @param url 远程地址
     * @param point 指针位置
     * @param needDownloadAndParse 是否需要下载并解析
     * @returns
     */
  }, {
    key: "createBucket",
    value: function createBucket(url, point, needDownloadAndParse) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee2() {
        var path, bucket;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              path = platform.path;
              bucket = {
                origin: url,
                local: path.resolve(path.filename(url)),
                entity: null,
                promise: null
              };
              this.buckets[point] = bucket;
              if (!needDownloadAndParse) {
                _context2.n = 2;
                break;
              }
              _context2.n = 1;
              return this.downloadAndParseVideo(bucket, true);
            case 1:
              bucket.entity = _context2.v;
              _context2.n = 3;
              break;
            case 2:
              if (this.includeRemainRange(point)) {
                bucket.promise = this.downloadAndParseVideo(bucket);
              }
            case 3:
              return _context2.a(2, bucket);
          }
        }, _callee2, this);
      }));
    }
    /**
     * 预加载视频到本地磁盘中
     * @param urls 视频远程地址
     * @param point 当前指针位置
     * @param maxRemain 最大留存数量
     */
  }, {
    key: "prepare",
    value: function prepare(urls_1) {
      return __awaiter(this, arguments, void 0, function (urls) {
        var _this2 = this;
        var point = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var maxRemain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
        return /*#__PURE__*/_regenerator().m(function _callee3() {
          var loadMode, currentPoint, preloadBucket;
          return _regenerator().w(function (_context3) {
            while (1) switch (_context3.n) {
              case 0:
                _this2.updateRemainRange(point, maxRemain, urls.length);
                loadMode = _this2.loadMode, currentPoint = _this2.point; // 优先加载当前动效
                _context3.n = 1;
                return _this2.createBucket(urls[currentPoint], currentPoint, true);
              case 1:
                preloadBucket = _context3.v;
                _context3.n = 2;
                return Promise.all(urls.map(function (url, index) {
                  // 当前帧的视频已经预加载到内存中
                  if (index === currentPoint) {
                    return preloadBucket;
                  }
                  return _this2.createBucket(url, index, loadMode === "whole");
                }));
              case 2:
                return _context3.a(2);
            }
          }, _callee3);
        })();
      });
    }
    /**
     * 获取当前帧的bucket
     * @returns
     */
  }, {
    key: "get",
    value: function get() {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee4() {
        var _this3 = this;
        var bucket;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              bucket = this.buckets[this.point];
              if (!bucket.promise) {
                _context4.n = 2;
                break;
              }
              _context4.n = 1;
              return bucket.promise.then(function (data) {
                return _this3.options.postprocess(bucket, data);
              });
            case 1:
              bucket.entity = _context4.v;
              bucket.promise = null;
              _context4.n = 4;
              break;
            case 2:
              if (bucket.entity) {
                _context4.n = 4;
                break;
              }
              _context4.n = 3;
              return this.downloadAndParseVideo(bucket, true);
            case 3:
              bucket.entity = _context4.v;
            case 4:
              return _context4.a(2, bucket);
          }
        }, _callee4, this);
      }));
    }
    /**
     * 获取当前的指针位置
     * @returns
     */
  }, {
    key: "getPoint",
    value: function getPoint() {
      return this.point;
    }
    /**
     * 获取指定位置的bucket
     * @param pos
     * @returns
     */
  }, {
    key: "go",
    value: function go(point) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee5() {
        var _this4 = this;
        var size, buckets, loadMode;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              size = this.size, buckets = this.buckets, loadMode = this.loadMode;
              if (!(point < 0 || point >= size)) {
                _context5.n = 1;
                break;
              }
              return _context5.a(2, buckets[this.point]);
            case 1:
              this.updateRemainRange(point, this.maxRemain, buckets.length);
              if (loadMode === "fast" && this.maxRemain !== buckets.length) {
                buckets.forEach(function (bucket, index) {
                  if (_this4.includeRemainRange(index)) {
                    if (bucket.entity === null && bucket.promise === null) {
                      bucket.promise = _this4.downloadAndParseVideo(bucket);
                    }
                  } else {
                    bucket.entity = null;
                    bucket.promise = null;
                  }
                });
              }
              return _context5.a(2, this.get());
          }
        }, _callee5, this);
      }));
    }
    /**
     * 清理所有的bucket
     * @returns
     */
  }, {
    key: "clear",
    value: function clear() {
      return __awaiter(this, arguments, void 0, function () {
        var _this5 = this;
        var needRemoveFiles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        return /*#__PURE__*/_regenerator().m(function _callee6() {
          var buckets;
          return _regenerator().w(function (_context6) {
            while (1) switch (_context6.n) {
              case 0:
                buckets = _this5.buckets;
                _this5.point = 0;
                _this5.remainStart = 0;
                _this5.remainEnd = 0;
                _this5.maxRemain = 3;
                _this5.buckets = [];
                if (!needRemoveFiles) {
                  _context6.n = 1;
                  break;
                }
                _context6.n = 1;
                return _this5.options.cleanup(buckets);
              case 1:
                return _context6.a(2);
            }
          }, _callee6);
        })();
      });
    }
  }]);
}();var VideoEditor = /*#__PURE__*/function () {
  function VideoEditor(painter, resource, entity) {
    _classCallCheck(this, VideoEditor);
    this.painter = painter;
    this.resource = resource;
    this.entity = entity;
  }
  return _createClass(VideoEditor, [{
    key: "set",
    value: function set(key_1, value_1) {
      return __awaiter(this, arguments, void 0, function (key, value) {
        var _this = this;
        var mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "R";
        return /*#__PURE__*/_regenerator().m(function _callee() {
          var entity, resource;
          return _regenerator().w(function (_context) {
            while (1) switch (_context.n) {
              case 0:
                entity = _this.entity, resource = _this.resource;
                if (!(mode === "A")) {
                  _context.n = 2;
                  break;
                }
                _context.n = 1;
                return resource.loadImagesWithRecord(_defineProperty({}, key, value), entity.filename, "dynamic");
              case 1:
                _context.n = 3;
                break;
              case 2:
                entity.images[key] = value;
              case 3:
                return _context.a(2);
            }
          }, _callee);
        })();
      });
    }
    /**
     * 获取自定义编辑器
     * @returns
     */
  }, {
    key: "getContext",
    value: function getContext() {
      return this.painter.BC;
    }
    /**
     * 是否是有效的Key
     * @param key
     * @returns
     */
  }, {
    key: "hasValidKey",
    value: function hasValidKey(key) {
      var images = this.entity.images;
      if (typeof Object.hasOwn === "function") {
        return Object.hasOwn(images, key);
      }
      return Object.prototype.hasOwnProperty.call(images, key);
    }
    /**
     * 加载并缓存图片
     * @param source
     * @param url
     * @returns
     */
  }, {
    key: "loadImage",
    value: function loadImage(source, url) {
      return this.resource.loadExtImage(source, platform.path.filename(url));
    }
    /**
     * 创建画布图片
     * @param key
     * @param context
     * @param options
     * @returns
     */
  }, {
    key: "setCanvas",
    value: function setCanvas(key, context, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee2() {
        var _a, _b, canvas, width, height, imageData;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              if (!this.entity.locked) {
                _context2.n = 1;
                break;
              }
              return _context2.a(2);
            case 1:
              canvas = context.canvas;
              width = (_a = options === null || options === void 0 ? void 0 : options.width) !== null && _a !== void 0 ? _a : canvas.width;
              height = (_b = options === null || options === void 0 ? void 0 : options.height) !== null && _b !== void 0 ? _b : canvas.height;
              imageData = context.getImageData(0, 0, width, height);
              _context2.n = 2;
              return this.set(key, new Uint8Array(createBufferOfImageData(imageData)), options === null || options === void 0 ? void 0 : options.mode);
            case 2:
              return _context2.a(2);
          }
        }, _callee2, this);
      }));
    }
    /**
     * 创建二进制图片
     * @param key
     * @param buff
     * @param options
     * @returns
     */
  }, {
    key: "setImage",
    value: function setImage(key, url, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee3() {
        var _t, _t2, _t3, _t4, _t5, _t6;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              if (!this.entity.locked) {
                _context3.n = 1;
                break;
              }
              return _context3.a(2);
            case 1:
              if (!url.startsWith("data:image")) {
                _context3.n = 3;
                break;
              }
              _context3.n = 2;
              return this.set(key, url, options === null || options === void 0 ? void 0 : options.mode);
            case 2:
              _context3.n = 5;
              break;
            case 3:
              _t = this;
              _t2 = key;
              _t3 = Uint8Array;
              _context3.n = 4;
              return Parser.download(url);
            case 4:
              _t4 = _context3.v;
              _t5 = new _t3(_t4);
              _t6 = options === null || options === void 0 ? void 0 : options.mode;
              _context3.n = 5;
              return _t.set.call(_t, _t2, _t5, _t6);
            case 5:
              return _context3.a(2);
          }
        }, _callee3, this);
      }));
    }
    /**
     * 创建二维码图片
     * @param key
     * @param code
     * @param options
     * @returns
     */
  }, {
    key: "setQRCode",
    value: function setQRCode(key, code, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee4() {
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              if (!this.entity.locked) {
                _context4.n = 1;
                break;
              }
              return _context4.a(2);
            case 1:
              _context4.n = 2;
              return this.set(key, new Uint8Array(generateImageBufferFromCode(Object.assign(Object.assign({}, options), {
                code: code
              }))), options === null || options === void 0 ? void 0 : options.mode);
            case 2:
              return _context4.a(2);
          }
        }, _callee4, this);
      }));
    }
  }]);
}();exports.Painter=Painter;exports.Parser=Parser;exports.Player=Player;exports.Poster=Poster;exports.VideoEditor=VideoEditor;exports.VideoManager=VideoManager;exports.createBufferOfImageData=createBufferOfImageData;exports.createImageDataUrl=createImageDataUrl;exports.generateImageBufferFromCode=generateImageBufferFromCode;exports.generateImageFromCode=generateImageFromCode;exports.getBufferFromImageData=getBufferFromImageData;exports.getDataURLFromImageData=getDataURLFromImageData;exports.isZlibCompressed=isZlibCompressed;exports.platform=platform;Object.defineProperty(exports,'__esModule',{value:true});}));//# sourceMappingURL=index.js.map
