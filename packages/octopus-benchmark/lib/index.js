(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports):typeof define==='function'&&define.amd?define(['exports'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.benchmark={}));})(this,(function(exports){'use strict';function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
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
  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
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
};var noop = function noop() {};
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
    _defineProperty(this, "platformVersion", "0.1.0");
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
    _defineProperty(this, "noop", noop);
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
      throw new Error("Unsupported app");
    }
  }, {
    key: "useBridge",
    value: function useBridge() {
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
});var EnhancedPlatform = /*#__PURE__*/function (_OctopusPlatform) {
  function EnhancedPlatform() {
    var _this;
    _classCallCheck(this, EnhancedPlatform);
    _this = _callSuper(this, EnhancedPlatform, [[pluginNow], "1.0.0"]);
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
var platform = new EnhancedPlatform();var logBadge = ["%cBENCHMARK", "padding: 2px 4px; background: #68B984; color: #FFFFFF; border-radius: 4px;"];
var infoBadge = ["%cBENCHMARK", "padding: 2px 4px; background: #89CFF0; color: #FFFFFF; border-radius: 4px;"];
var Stopwatch = /*#__PURE__*/function () {
  function Stopwatch() {
    _classCallCheck(this, Stopwatch);
    this.timeLabels = new Map();
    this.markLabels = new Map();
  }
  return _createClass(Stopwatch, [{
    key: "start",
    value: function start(label) {
      this.timeLabels.set(label, platform.now());
    }
  }, {
    key: "stop",
    value: function stop(label) {
      var nowTime = platform.now();
      var timeLabels = this.timeLabels;
      if (timeLabels.has(label)) {
        console.log("".concat(label, ": ").concat(nowTime - timeLabels.get(label), " ms"));
        timeLabels.delete(label);
      }
    }
  }, {
    key: "mark",
    value: function mark(label) {
      var nowTime = platform.now();
      var markLabels = this.markLabels;
      if (markLabels.has(label)) {
        console.log("".concat(label, ": ").concat(nowTime - markLabels.get(label), " ms"));
      }
      markLabels.set(label, nowTime);
    }
  }, {
    key: "reset",
    value: function reset(label) {
      this.markLabels.delete(label);
    }
  }, {
    key: "clear",
    value: function clear() {
      this.timeLabels.clear();
      this.markLabels.clear();
    }
  }]);
}();
var stopwatch = new Stopwatch();
var benchmark = Object.create(stopwatch);
benchmark.now = function () {
  return platform.now();
};
benchmark.time = function (label, callback) {
  return __awaiter(void 0, void 0, void 0, /*#__PURE__*/_regenerator().m(function _callee() {
    var result;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          stopwatch.start(label);
          _context.n = 1;
          return callback();
        case 1:
          result = _context.v;
          stopwatch.stop(label);
          return _context.a(2, result);
      }
    }, _callee);
  }));
};
benchmark.line = function () {
  var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 40;
  console.log("-".repeat(size));
};
benchmark.log = function () {
  var _console;
  for (var _len = arguments.length, message = new Array(_len), _key = 0; _key < _len; _key++) {
    message[_key] = arguments[_key];
  }
  (_console = console).log.apply(_console, logBadge.concat(message));
};
benchmark.info = function () {
  var _console2;
  for (var _len2 = arguments.length, message = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    message[_key2] = arguments[_key2];
  }
  (_console2 = console).info.apply(_console2, infoBadge.concat(message));
};exports.benchmark=benchmark;Object.defineProperty(exports,'__esModule',{value:true});}));//# sourceMappingURL=index.js.map
