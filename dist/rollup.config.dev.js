"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var rollup = require('rollup');

var path = require("path");

var resolve = function resolve(dir) {
  return path.join(__dirname, dir);
};

var inputOptions = {
  // 核心参数
  input: resolve("build/index.js") // 唯一必填参数

};
var outputOptions = {
  // 核心参数
  file: resolve("dist/js-highlight.js"),
  // 若有bundle.write，必填
  format: "cjs" // 必填

};

var watchOptions = _objectSpread({}, inputOptions, {
  output: [outputOptions] // watch: {
  //     chokidar,
  //     include,
  //     exclude
  // }

});

var watcher = rollup.watch(watchOptions);
watcher.on('event', function (event) {// event.code 会是下面其中一个：
  //   START        — 监听器正在启动（重启）
  //   BUNDLE_START — 构建单个文件束
  //   BUNDLE_END   — 完成文件束构建
  //   END          — 完成所有文件束构建
  //   ERROR        — 构建时遇到错误
  //   FATAL        — 遇到无可修复的错误
}); // 停止监听

watcher.close();

var _default = _objectSpread({}, inputOptions, {
  output: [outputOptions],
  plugins: [babel({
    exclude: 'node_modules/**'
  })]
});

exports["default"] = _default;