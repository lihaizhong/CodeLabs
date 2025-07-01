import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";
import del from "rollup-plugin-delete";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

const config = {
  input: "src/index.ts",
  plugins: [
    json({
      include: ["./package.json"],
      compact: true,
    }),
  ],
};

export default defineConfig([
  {
    input: config.input,
    output: [
      {
        file: "es/index.js",
        format: "es",
      },
      {
        file: "es/index.min.js",
        format: "es",
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    external: ["octopus-platform"],
    plugins: [
      ...config.plugins,
      typescript({
        declaration: false,
        declarationDir: undefined,
      }),
    ],
  },
  {
    input: config.input,
    output: [
      {
        file: "index.js",
        format: "umd",
        name: "benchmark",
      },
      {
        file: "index.min.js",
        format: "umd",
        name: "benchmark",
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      ...config.plugins,
      typescript({
        declaration: false,
        declarationDir: undefined,
        target: "ES5",
      }),
    ],
  },
  // 归并 .d.ts 文件
  {
    input: "types/index.d.ts",
    output: {
      file: "index.d.ts",
      format: "es",
    },
    external: ["octopus-platform"],
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
