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

/***/ "./pages/svga2/index.css?type=page":
/*!*****************************************!*\
  !*** ./pages/svga2/index.css?type=page ***!
  \*****************************************/
/***/ ((module) => {

eval("module.exports = {\n            segs:[\"q-page {\\n  display: flex;\\n  flex-direction: column;\\n  height: 100vh;\\n  background: #111;\\n}\\n\\n.animation {\\n  margin: 0 auto;\\n}\\n\\n.footer {\\n  position: absolute;\\n  left: 0;\\n  right: 0;\\n  bottom: 0;\\n  z-index: 3;\\n  display: flex;\\n  padding: 0 \",[2,20],\";\\n  padding-bottom: calc(15px + constant(safe-area-inset-bottom)); \\n \\tpadding-bottom: calc(15px + env(safe-area-inset-bottom)); \\n  text-align: center;\\n}\\n\\n.foot-btn {\\n  flex: 1 auto;\\n}\\n\\n.foot-btn+.foot-btn {\\n  margin-left: \",[2,20],\";\\n}\\n\"],\n            info:{path:\"pages/svga2/index\", type:\"page\"}\n        }//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9zdmdhMi9pbmRleC5jc3M/dHlwZT1wYWdlLmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbWluaXByb2dyYW0td2VhcHAvLi9wYWdlcy9zdmdhMi9pbmRleC5jc3M/Nzg1MSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgICAgIHNlZ3M6W1wicS1wYWdlIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgaGVpZ2h0OiAxMDB2aDtcXG4gIGJhY2tncm91bmQ6ICMxMTE7XFxufVxcblxcbi5hbmltYXRpb24ge1xcbiAgbWFyZ2luOiAwIGF1dG87XFxufVxcblxcbi5mb290ZXIge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgbGVmdDogMDtcXG4gIHJpZ2h0OiAwO1xcbiAgYm90dG9tOiAwO1xcbiAgei1pbmRleDogMztcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBwYWRkaW5nOiAwIFwiLFsyLDIwXSxcIjtcXG4gIHBhZGRpbmctYm90dG9tOiBjYWxjKDE1cHggKyBjb25zdGFudChzYWZlLWFyZWEtaW5zZXQtYm90dG9tKSk7IFxcbiBcXHRwYWRkaW5nLWJvdHRvbTogY2FsYygxNXB4ICsgZW52KHNhZmUtYXJlYS1pbnNldC1ib3R0b20pKTsgXFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbi5mb290LWJ0biB7XFxuICBmbGV4OiAxIGF1dG87XFxufVxcblxcbi5mb290LWJ0bisuZm9vdC1idG4ge1xcbiAgbWFyZ2luLWxlZnQ6IFwiLFsyLDIwXSxcIjtcXG59XFxuXCJdLFxuICAgICAgICAgICAgaW5mbzp7cGF0aDpcInBhZ2VzL3N2Z2EyL2luZGV4XCIsIHR5cGU6XCJwYWdlXCJ9XG4gICAgICAgIH0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/svga2/index.css?type=page\n");

/***/ }),

/***/ "./pages/svga2/index.hxml":
/*!********************************!*\
  !*** ./pages/svga2/index.hxml ***!
  \********************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("var render = function () {\n  var _vm = this,\n    _o = _vm._o,\n    _n = _vm._n,\n    _s = _vm._s,\n    _l = _vm._l,\n    _t = _vm._t,\n    _q = _vm._q,\n    _i = _vm._i,\n    _m = _vm._m,\n    _f = _vm._f,\n    _k = _vm._k,\n    _b = _vm._b,\n    _v = _vm._v,\n    _e = _vm._e,\n    _u = _vm._u,\n    _g = _vm._g,\n    _d = _vm._d,\n    _p = _vm._p,\n    _c = _vm._c,\n    $style = _vm.$style,\n    $class = _vm.$class,\n    $slots = _vm.$slots,\n    eventHappen = _vm.eventHappen;\n  return _c('q-page', {\n    attrs: {\n      \"data-internal-update-trigger\": _vm.$dataprops.internal__updateTrigger\n    }\n  }, [_c('q-page-meta'), _c('q-fuck-animation', {\n    staticClass: \"animation\",\n    attrs: {\n      \"url\": _vm.$dataprops.url\n    }\n  }), _c('q-cover-view', {\n    staticClass: \"footer\"\n  }, [_c('q-button', {\n    directives: [{\n      name: \"touch\",\n      rawName: \"v-touch:tap\",\n      value: 'handleSwitchPrev',\n      expression: \"'handleSwitchPrev'\",\n      arg: \"tap\"\n    }],\n    staticClass: \"foot-btn\",\n    attrs: {\n      \"type\": \"primary\"\n    },\n    on: {\n      \"tap\": function ($event) {\n        return eventHappen('handleSwitchPrev', $event);\n      }\n    }\n  }, [_v(\"上一张\")]), _c('q-button', {\n    directives: [{\n      name: \"touch\",\n      rawName: \"v-touch:tap\",\n      value: 'handleSwitchAtRandom',\n      expression: \"'handleSwitchAtRandom'\",\n      arg: \"tap\"\n    }],\n    staticClass: \"foot-btn\",\n    attrs: {\n      \"type\": \"primary\"\n    },\n    on: {\n      \"tap\": function ($event) {\n        return eventHappen('handleSwitchAtRandom', $event);\n      }\n    }\n  }, [_v(\"试一试\")]), _c('q-button', {\n    directives: [{\n      name: \"touch\",\n      rawName: \"v-touch:tap\",\n      value: 'handleSwitchNext',\n      expression: \"'handleSwitchNext'\",\n      arg: \"tap\"\n    }],\n    staticClass: \"foot-btn\",\n    attrs: {\n      \"type\": \"primary\"\n    },\n    on: {\n      \"tap\": function ($event) {\n        return eventHappen('handleSwitchNext', $event);\n      }\n    }\n  }, [_v(\"下一张\")])], 1)], 1);\n};\nvar staticRenderFns = [];\nrender._withStripped = true;\nconst pageConfig = {\n  path: \"pages/svga2/index\",\n  globalComponents: {},\n  components: {\n    \"q-fuck-animation\": __pageComponentInfos['components/animation2/index']\n  },\n  render: render,\n  type: \"page\",\n  staticRenderFns: staticRenderFns,\n  _scopeId: \"data-q-570094e6\",\n  asyncComponents: {},\n  placeholderComponents: {}\n};\nglobal.pageLoaded(pageConfig);\nconst cssData = __webpack_require__(/*! ./pages/svga2/index.css?type=page */ \"./pages/svga2/index.css?type=page\");\ninjectStyle(cssData.segs, cssData.sourcemap, cssData.info);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9zdmdhMi9pbmRleC5oeG1sLmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbWluaXByb2dyYW0td2VhcHAvLi9wYWdlcy9zdmdhMi9pbmRleC5oeG1sPzJhMmIiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF92bSA9IHRoaXMsXG4gICAgX28gPSBfdm0uX28sXG4gICAgX24gPSBfdm0uX24sXG4gICAgX3MgPSBfdm0uX3MsXG4gICAgX2wgPSBfdm0uX2wsXG4gICAgX3QgPSBfdm0uX3QsXG4gICAgX3EgPSBfdm0uX3EsXG4gICAgX2kgPSBfdm0uX2ksXG4gICAgX20gPSBfdm0uX20sXG4gICAgX2YgPSBfdm0uX2YsXG4gICAgX2sgPSBfdm0uX2ssXG4gICAgX2IgPSBfdm0uX2IsXG4gICAgX3YgPSBfdm0uX3YsXG4gICAgX2UgPSBfdm0uX2UsXG4gICAgX3UgPSBfdm0uX3UsXG4gICAgX2cgPSBfdm0uX2csXG4gICAgX2QgPSBfdm0uX2QsXG4gICAgX3AgPSBfdm0uX3AsXG4gICAgX2MgPSBfdm0uX2MsXG4gICAgJHN0eWxlID0gX3ZtLiRzdHlsZSxcbiAgICAkY2xhc3MgPSBfdm0uJGNsYXNzLFxuICAgICRzbG90cyA9IF92bS4kc2xvdHMsXG4gICAgZXZlbnRIYXBwZW4gPSBfdm0uZXZlbnRIYXBwZW47XG4gIHJldHVybiBfYygncS1wYWdlJywge1xuICAgIGF0dHJzOiB7XG4gICAgICBcImRhdGEtaW50ZXJuYWwtdXBkYXRlLXRyaWdnZXJcIjogX3ZtLiRkYXRhcHJvcHMuaW50ZXJuYWxfX3VwZGF0ZVRyaWdnZXJcbiAgICB9XG4gIH0sIFtfYygncS1wYWdlLW1ldGEnKSwgX2MoJ3EtZnVjay1hbmltYXRpb24nLCB7XG4gICAgc3RhdGljQ2xhc3M6IFwiYW5pbWF0aW9uXCIsXG4gICAgYXR0cnM6IHtcbiAgICAgIFwidXJsXCI6IF92bS4kZGF0YXByb3BzLnVybFxuICAgIH1cbiAgfSksIF9jKCdxLWNvdmVyLXZpZXcnLCB7XG4gICAgc3RhdGljQ2xhc3M6IFwiZm9vdGVyXCJcbiAgfSwgW19jKCdxLWJ1dHRvbicsIHtcbiAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgbmFtZTogXCJ0b3VjaFwiLFxuICAgICAgcmF3TmFtZTogXCJ2LXRvdWNoOnRhcFwiLFxuICAgICAgdmFsdWU6ICdoYW5kbGVTd2l0Y2hQcmV2JyxcbiAgICAgIGV4cHJlc3Npb246IFwiJ2hhbmRsZVN3aXRjaFByZXYnXCIsXG4gICAgICBhcmc6IFwidGFwXCJcbiAgICB9XSxcbiAgICBzdGF0aWNDbGFzczogXCJmb290LWJ0blwiLFxuICAgIGF0dHJzOiB7XG4gICAgICBcInR5cGVcIjogXCJwcmltYXJ5XCJcbiAgICB9LFxuICAgIG9uOiB7XG4gICAgICBcInRhcFwiOiBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBldmVudEhhcHBlbignaGFuZGxlU3dpdGNoUHJldicsICRldmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9LCBbX3YoXCLkuIrkuIDlvKBcIildKSwgX2MoJ3EtYnV0dG9uJywge1xuICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICBuYW1lOiBcInRvdWNoXCIsXG4gICAgICByYXdOYW1lOiBcInYtdG91Y2g6dGFwXCIsXG4gICAgICB2YWx1ZTogJ2hhbmRsZVN3aXRjaEF0UmFuZG9tJyxcbiAgICAgIGV4cHJlc3Npb246IFwiJ2hhbmRsZVN3aXRjaEF0UmFuZG9tJ1wiLFxuICAgICAgYXJnOiBcInRhcFwiXG4gICAgfV0sXG4gICAgc3RhdGljQ2xhc3M6IFwiZm9vdC1idG5cIixcbiAgICBhdHRyczoge1xuICAgICAgXCJ0eXBlXCI6IFwicHJpbWFyeVwiXG4gICAgfSxcbiAgICBvbjoge1xuICAgICAgXCJ0YXBcIjogZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICByZXR1cm4gZXZlbnRIYXBwZW4oJ2hhbmRsZVN3aXRjaEF0UmFuZG9tJywgJGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtfdihcIuivleS4gOivlVwiKV0pLCBfYygncS1idXR0b24nLCB7XG4gICAgZGlyZWN0aXZlczogW3tcbiAgICAgIG5hbWU6IFwidG91Y2hcIixcbiAgICAgIHJhd05hbWU6IFwidi10b3VjaDp0YXBcIixcbiAgICAgIHZhbHVlOiAnaGFuZGxlU3dpdGNoTmV4dCcsXG4gICAgICBleHByZXNzaW9uOiBcIidoYW5kbGVTd2l0Y2hOZXh0J1wiLFxuICAgICAgYXJnOiBcInRhcFwiXG4gICAgfV0sXG4gICAgc3RhdGljQ2xhc3M6IFwiZm9vdC1idG5cIixcbiAgICBhdHRyczoge1xuICAgICAgXCJ0eXBlXCI6IFwicHJpbWFyeVwiXG4gICAgfSxcbiAgICBvbjoge1xuICAgICAgXCJ0YXBcIjogZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICByZXR1cm4gZXZlbnRIYXBwZW4oJ2hhbmRsZVN3aXRjaE5leHQnLCAkZXZlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSwgW192KFwi5LiL5LiA5bygXCIpXSldLCAxKV0sIDEpO1xufTtcbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXTtcbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZTtcbmNvbnN0IHBhZ2VDb25maWcgPSB7XG4gIHBhdGg6IFwicGFnZXMvc3ZnYTIvaW5kZXhcIixcbiAgZ2xvYmFsQ29tcG9uZW50czoge30sXG4gIGNvbXBvbmVudHM6IHtcbiAgICBcInEtZnVjay1hbmltYXRpb25cIjogX19wYWdlQ29tcG9uZW50SW5mb3NbJ2NvbXBvbmVudHMvYW5pbWF0aW9uMi9pbmRleCddXG4gIH0sXG4gIHJlbmRlcjogcmVuZGVyLFxuICB0eXBlOiBcInBhZ2VcIixcbiAgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMsXG4gIF9zY29wZUlkOiBcImRhdGEtcS01NzAwOTRlNlwiLFxuICBhc3luY0NvbXBvbmVudHM6IHt9LFxuICBwbGFjZWhvbGRlckNvbXBvbmVudHM6IHt9XG59O1xuZ2xvYmFsLnBhZ2VMb2FkZWQocGFnZUNvbmZpZyk7XG5jb25zdCBjc3NEYXRhID0gcmVxdWlyZShcIi9Vc2Vycy9saWhhaXpob25nL0RvY3VtZW50cy9Qcm9qZWN0L0NvZGVMYWJzL21wLXBsYXRmb3JtL2FzY2YvYXNjZi9hc2NmX3NyYy9wYWdlcy9zdmdhMi9pbmRleC5jc3M/dHlwZT1wYWdlXCIpO1xuaW5qZWN0U3R5bGUoY3NzRGF0YS5zZWdzLCBjc3NEYXRhLnNvdXJjZW1hcCwgY3NzRGF0YS5pbmZvKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/svga2/index.hxml\n");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./pages/svga2/index.hxml");
/******/ 	
/******/ })()
;