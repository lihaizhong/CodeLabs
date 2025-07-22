import { defineConfig } from "rollup";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";
import del from "rollup-plugin-delete";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import pkg from "./package.json" with { type: "json" };

function minifyFileName(fileName) {
  return fileName.replace(/\.js$/, ".min.js");
}

const config = {
  input: "src/index.ts",
  plugins: [
    nodeResolve(),
    commonjs(),
    replace({
      preventAssignment: true,
      include: ["./src/**/*.ts"],
      values: {
        __VERSION__: JSON.stringify(pkg.version),
      },
    }),
  ],
};

export default defineConfig([
  {
    input: config.input,
    output: [
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
      {
        file: minifyFileName(pkg.module),
        format: "esm",
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      ...config.plugins,
      typescript({
        declaration: false,
        emitDeclarationOnly: false,
        declarationDir: undefined,
      }),
    ],
  },
  {
    input: config.input,
    output: [
      {
        file: pkg.main,
        format: "umd",
        name: "OctopusPlatform",
        esModule: true,
        compact: true,
        sourcemap: true,
      },
      {
        file: minifyFileName(pkg.main),
        format: "umd",
        name: "OctopusPlatform",
        esModule: true,
        compact: true,
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      ...config.plugins,
      typescript({
        target: "ES5",
        declaration: false,
        emitDeclarationOnly: false,
        declarationDir: undefined,
      }),
    ],
  },
  // 归并 .d.ts 文件
  {
    input: "types/index.d.ts",
    output: {
      file: pkg.types,
      format: "es",
    },
    plugins: [
      // 将类型文件全部集中到一个文件中
      dts(),
      // 在构建完成后，删除 types 文件夹
      del({
        targets: "types",
        hook: "buildEnd",
      }),
    ],
  },
]);
