/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./pages/poster/index.css?type=page":
/*!******************************************!*\
  !*** ./pages/poster/index.css?type=page ***!
  \******************************************/
/***/ ((module) => {

eval("module.exports = {\n            segs:[\"q-page {\\n  display: flex;\\n  flex-direction: column;\\n  height: 100vh;\\n  background: #111;\\n}\\n\\n.poster {\\n  margin: 0 auto;\\n}\\n\\n.footer {\\n  position: absolute;\\n  left: 0;\\n  right: 0;\\n  bottom: 0;\\n  z-index: 3;\\n  display: flex;\\n  padding: 0 \",[2,20],\";\\n  padding-bottom: calc(15px + constant(safe-area-inset-bottom)); \\n \\tpadding-bottom: calc(15px + env(safe-area-inset-bottom)); \\n  text-align: center;\\n}\\n\\n.foot-btn {\\n  flex: 1 auto;\\n}\\n\\n.foot-btn+.foot-btn {\\n  margin-left: \",[2,20],\";\\n}\\n\"],\n            info:{path:\"pages/poster/index\", type:\"page\"}\n        }//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9wb3N0ZXIvaW5kZXguY3NzP3R5cGU9cGFnZS5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL21pbmlwcm9ncmFtLXdlYXBwLy4vcGFnZXMvcG9zdGVyL2luZGV4LmNzcz82MWU0Il0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICAgICAgc2VnczpbXCJxLXBhZ2Uge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBoZWlnaHQ6IDEwMHZoO1xcbiAgYmFja2dyb3VuZDogIzExMTtcXG59XFxuXFxuLnBvc3RlciB7XFxuICBtYXJnaW46IDAgYXV0bztcXG59XFxuXFxuLmZvb3RlciB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBsZWZ0OiAwO1xcbiAgcmlnaHQ6IDA7XFxuICBib3R0b206IDA7XFxuICB6LWluZGV4OiAzO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIHBhZGRpbmc6IDAgXCIsWzIsMjBdLFwiO1xcbiAgcGFkZGluZy1ib3R0b206IGNhbGMoMTVweCArIGNvbnN0YW50KHNhZmUtYXJlYS1pbnNldC1ib3R0b20pKTsgXFxuIFxcdHBhZGRpbmctYm90dG9tOiBjYWxjKDE1cHggKyBlbnYoc2FmZS1hcmVhLWluc2V0LWJvdHRvbSkpOyBcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuLmZvb3QtYnRuIHtcXG4gIGZsZXg6IDEgYXV0bztcXG59XFxuXFxuLmZvb3QtYnRuKy5mb290LWJ0biB7XFxuICBtYXJnaW4tbGVmdDogXCIsWzIsMjBdLFwiO1xcbn1cXG5cIl0sXG4gICAgICAgICAgICBpbmZvOntwYXRoOlwicGFnZXMvcG9zdGVyL2luZGV4XCIsIHR5cGU6XCJwYWdlXCJ9XG4gICAgICAgIH0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/poster/index.css?type=page\n");

/***/ }),

/***/ "./pages/poster/index.hxml":
/*!*********************************!*\
  !*** ./pages/poster/index.hxml ***!
  \*********************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("var render = function () {\n  var _vm = this,\n    _o = _vm._o,\n    _n = _vm._n,\n    _s = _vm._s,\n    _l = _vm._l,\n    _t = _vm._t,\n    _q = _vm._q,\n    _i = _vm._i,\n    _m = _vm._m,\n    _f = _vm._f,\n    _k = _vm._k,\n    _b = _vm._b,\n    _v = _vm._v,\n    _e = _vm._e,\n    _u = _vm._u,\n    _g = _vm._g,\n    _d = _vm._d,\n    _p = _vm._p,\n    _c = _vm._c,\n    $style = _vm.$style,\n    $class = _vm.$class,\n    $slots = _vm.$slots,\n    eventHappen = _vm.eventHappen;\n  return _c('q-page', {\n    attrs: {\n      \"data-internal-update-trigger\": _vm.$dataprops.internal__updateTrigger\n    }\n  }, [_c('q-page-meta'), _c('q-fuck-poster', {\n    staticClass: \"poster\",\n    attrs: {\n      \"current\": _vm.$dataprops.current,\n      \"sources\": _vm.$dataprops.sources,\n      \"frame\": 0\n    }\n  }), _c('q-cover-view', {\n    staticClass: \"footer\"\n  }, [_c('q-button', {\n    directives: [{\n      name: \"touch\",\n      rawName: \"v-touch:tap\",\n      value: 'handleSwitchPrev',\n      expression: \"'handleSwitchPrev'\",\n      arg: \"tap\"\n    }],\n    staticClass: \"foot-btn\",\n    attrs: {\n      \"type\": \"primary\"\n    },\n    on: {\n      \"tap\": function ($event) {\n        return eventHappen('handleSwitchPrev', $event);\n      }\n    }\n  }, [_v(\"上一张\")]), _c('q-button', {\n    directives: [{\n      name: \"touch\",\n      rawName: \"v-touch:tap\",\n      value: 'handleSwitchAtRandom',\n      expression: \"'handleSwitchAtRandom'\",\n      arg: \"tap\"\n    }],\n    staticClass: \"foot-btn\",\n    attrs: {\n      \"type\": \"primary\"\n    },\n    on: {\n      \"tap\": function ($event) {\n        return eventHappen('handleSwitchAtRandom', $event);\n      }\n    }\n  }, [_v(\"试一试\")]), _c('q-button', {\n    directives: [{\n      name: \"touch\",\n      rawName: \"v-touch:tap\",\n      value: 'handleSwitchNext',\n      expression: \"'handleSwitchNext'\",\n      arg: \"tap\"\n    }],\n    staticClass: \"foot-btn\",\n    attrs: {\n      \"type\": \"primary\"\n    },\n    on: {\n      \"tap\": function ($event) {\n        return eventHappen('handleSwitchNext', $event);\n      }\n    }\n  }, [_v(\"下一张\")])], 1)], 1);\n};\nvar staticRenderFns = [];\nrender._withStripped = true;\nconst pageConfig = {\n  path: \"pages/poster/index\",\n  globalComponents: {},\n  components: {\n    \"q-fuck-poster\": __pageComponentInfos['components/poster/index']\n  },\n  render: render,\n  type: \"page\",\n  staticRenderFns: staticRenderFns,\n  _scopeId: \"data-q-8d9764e8\",\n  asyncComponents: {},\n  placeholderComponents: {}\n};\nglobal.pageLoaded(pageConfig);\nconst cssData = __webpack_require__(/*! ./pages/poster/index.css?type=page */ \"./pages/poster/index.css?type=page\");\ninjectStyle(cssData.segs, cssData.sourcemap, cssData.info);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9wb3N0ZXIvaW5kZXguaHhtbC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9taW5pcHJvZ3JhbS13ZWFwcC8uL3BhZ2VzL3Bvc3Rlci9pbmRleC5oeG1sP2EzNWEiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF92bSA9IHRoaXMsXG4gICAgX28gPSBfdm0uX28sXG4gICAgX24gPSBfdm0uX24sXG4gICAgX3MgPSBfdm0uX3MsXG4gICAgX2wgPSBfdm0uX2wsXG4gICAgX3QgPSBfdm0uX3QsXG4gICAgX3EgPSBfdm0uX3EsXG4gICAgX2kgPSBfdm0uX2ksXG4gICAgX20gPSBfdm0uX20sXG4gICAgX2YgPSBfdm0uX2YsXG4gICAgX2sgPSBfdm0uX2ssXG4gICAgX2IgPSBfdm0uX2IsXG4gICAgX3YgPSBfdm0uX3YsXG4gICAgX2UgPSBfdm0uX2UsXG4gICAgX3UgPSBfdm0uX3UsXG4gICAgX2cgPSBfdm0uX2csXG4gICAgX2QgPSBfdm0uX2QsXG4gICAgX3AgPSBfdm0uX3AsXG4gICAgX2MgPSBfdm0uX2MsXG4gICAgJHN0eWxlID0gX3ZtLiRzdHlsZSxcbiAgICAkY2xhc3MgPSBfdm0uJGNsYXNzLFxuICAgICRzbG90cyA9IF92bS4kc2xvdHMsXG4gICAgZXZlbnRIYXBwZW4gPSBfdm0uZXZlbnRIYXBwZW47XG4gIHJldHVybiBfYygncS1wYWdlJywge1xuICAgIGF0dHJzOiB7XG4gICAgICBcImRhdGEtaW50ZXJuYWwtdXBkYXRlLXRyaWdnZXJcIjogX3ZtLiRkYXRhcHJvcHMuaW50ZXJuYWxfX3VwZGF0ZVRyaWdnZXJcbiAgICB9XG4gIH0sIFtfYygncS1wYWdlLW1ldGEnKSwgX2MoJ3EtZnVjay1wb3N0ZXInLCB7XG4gICAgc3RhdGljQ2xhc3M6IFwicG9zdGVyXCIsXG4gICAgYXR0cnM6IHtcbiAgICAgIFwiY3VycmVudFwiOiBfdm0uJGRhdGFwcm9wcy5jdXJyZW50LFxuICAgICAgXCJzb3VyY2VzXCI6IF92bS4kZGF0YXByb3BzLnNvdXJjZXMsXG4gICAgICBcImZyYW1lXCI6IDBcbiAgICB9XG4gIH0pLCBfYygncS1jb3Zlci12aWV3Jywge1xuICAgIHN0YXRpY0NsYXNzOiBcImZvb3RlclwiXG4gIH0sIFtfYygncS1idXR0b24nLCB7XG4gICAgZGlyZWN0aXZlczogW3tcbiAgICAgIG5hbWU6IFwidG91Y2hcIixcbiAgICAgIHJhd05hbWU6IFwidi10b3VjaDp0YXBcIixcbiAgICAgIHZhbHVlOiAnaGFuZGxlU3dpdGNoUHJldicsXG4gICAgICBleHByZXNzaW9uOiBcIidoYW5kbGVTd2l0Y2hQcmV2J1wiLFxuICAgICAgYXJnOiBcInRhcFwiXG4gICAgfV0sXG4gICAgc3RhdGljQ2xhc3M6IFwiZm9vdC1idG5cIixcbiAgICBhdHRyczoge1xuICAgICAgXCJ0eXBlXCI6IFwicHJpbWFyeVwiXG4gICAgfSxcbiAgICBvbjoge1xuICAgICAgXCJ0YXBcIjogZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICByZXR1cm4gZXZlbnRIYXBwZW4oJ2hhbmRsZVN3aXRjaFByZXYnLCAkZXZlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSwgW192KFwi5LiK5LiA5bygXCIpXSksIF9jKCdxLWJ1dHRvbicsIHtcbiAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgbmFtZTogXCJ0b3VjaFwiLFxuICAgICAgcmF3TmFtZTogXCJ2LXRvdWNoOnRhcFwiLFxuICAgICAgdmFsdWU6ICdoYW5kbGVTd2l0Y2hBdFJhbmRvbScsXG4gICAgICBleHByZXNzaW9uOiBcIidoYW5kbGVTd2l0Y2hBdFJhbmRvbSdcIixcbiAgICAgIGFyZzogXCJ0YXBcIlxuICAgIH1dLFxuICAgIHN0YXRpY0NsYXNzOiBcImZvb3QtYnRuXCIsXG4gICAgYXR0cnM6IHtcbiAgICAgIFwidHlwZVwiOiBcInByaW1hcnlcIlxuICAgIH0sXG4gICAgb246IHtcbiAgICAgIFwidGFwXCI6IGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50SGFwcGVuKCdoYW5kbGVTd2l0Y2hBdFJhbmRvbScsICRldmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9LCBbX3YoXCLor5XkuIDor5VcIildKSwgX2MoJ3EtYnV0dG9uJywge1xuICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICBuYW1lOiBcInRvdWNoXCIsXG4gICAgICByYXdOYW1lOiBcInYtdG91Y2g6dGFwXCIsXG4gICAgICB2YWx1ZTogJ2hhbmRsZVN3aXRjaE5leHQnLFxuICAgICAgZXhwcmVzc2lvbjogXCInaGFuZGxlU3dpdGNoTmV4dCdcIixcbiAgICAgIGFyZzogXCJ0YXBcIlxuICAgIH1dLFxuICAgIHN0YXRpY0NsYXNzOiBcImZvb3QtYnRuXCIsXG4gICAgYXR0cnM6IHtcbiAgICAgIFwidHlwZVwiOiBcInByaW1hcnlcIlxuICAgIH0sXG4gICAgb246IHtcbiAgICAgIFwidGFwXCI6IGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50SGFwcGVuKCdoYW5kbGVTd2l0Y2hOZXh0JywgJGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtfdihcIuS4i+S4gOW8oFwiKV0pXSwgMSldLCAxKTtcbn07XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW107XG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWU7XG5jb25zdCBwYWdlQ29uZmlnID0ge1xuICBwYXRoOiBcInBhZ2VzL3Bvc3Rlci9pbmRleFwiLFxuICBnbG9iYWxDb21wb25lbnRzOiB7fSxcbiAgY29tcG9uZW50czoge1xuICAgIFwicS1mdWNrLXBvc3RlclwiOiBfX3BhZ2VDb21wb25lbnRJbmZvc1snY29tcG9uZW50cy9wb3N0ZXIvaW5kZXgnXVxuICB9LFxuICByZW5kZXI6IHJlbmRlcixcbiAgdHlwZTogXCJwYWdlXCIsXG4gIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zLFxuICBfc2NvcGVJZDogXCJkYXRhLXEtOGQ5NzY0ZThcIixcbiAgYXN5bmNDb21wb25lbnRzOiB7fSxcbiAgcGxhY2Vob2xkZXJDb21wb25lbnRzOiB7fVxufTtcbmdsb2JhbC5wYWdlTG9hZGVkKHBhZ2VDb25maWcpO1xuY29uc3QgY3NzRGF0YSA9IHJlcXVpcmUoXCIvVXNlcnMvbGloYWl6aG9uZy9Eb2N1bWVudHMvUHJvamVjdC9Db2RlTGFicy9tcC1wbGF0Zm9ybS9hc2NmL2FzY2YvYXNjZl9zcmMvcGFnZXMvcG9zdGVyL2luZGV4LmNzcz90eXBlPXBhZ2VcIik7XG5pbmplY3RTdHlsZShjc3NEYXRhLnNlZ3MsIGNzc0RhdGEuc291cmNlbWFwLCBjc3NEYXRhLmluZm8pOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/poster/index.hxml\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./pages/poster/index.hxml");
/******/ 	
/******/ })()
;