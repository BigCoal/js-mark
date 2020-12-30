const rollup = require('rollup');
const path = require("path");
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser'
const resolve = dir => {
    return path.join(__dirname, dir);
};
const inputOptions = {
    // 核心参数
    input: resolve("build/index.js") // 唯一必填参数

};
const outputOptions = {
    // 核心参数
    file: resolve("dist/js-mark.js"), // 若有bundle.write，必填
    format: "umd", // 必填
    name: "textSelector"
};


export default {
    ...inputOptions,
    output: [outputOptions],
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
        terser({
            output: {
              ascii_only: true // 仅输出ascii字符
            },
            compress: {
              pure_funcs: ['console.log'] // 去掉console.log函数
            }
          })
    ]
}