const rollup = require('rollup');
const path = require("path");
const resolve = dir => {
    return path.join(__dirname, dir);
};
const inputOptions = {
    // 核心参数
    input: resolve("build/index.js") // 唯一必填参数

};
const outputOptions = {
    // 核心参数
    file: resolve("dist/js-highlight.js"), // 若有bundle.write，必填
    format: "cjs" // 必填
};

const watchOptions = {
    ...inputOptions,
    output: [outputOptions],
    // watch: {
    //     chokidar,
    //     include,
    //     exclude
    // }
};
const watcher = rollup.watch(watchOptions);

watcher.on('event', event => {
    // event.code 会是下面其中一个：
    //   START        — 监听器正在启动（重启）
    //   BUNDLE_START — 构建单个文件束
    //   BUNDLE_END   — 完成文件束构建
    //   END          — 完成所有文件束构建
    //   ERROR        — 构建时遇到错误
    //   FATAL        — 遇到无可修复的错误
});

// 停止监听
watcher.close()

export default {
    ...inputOptions,
    output: [outputOptions],
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
    ]
}