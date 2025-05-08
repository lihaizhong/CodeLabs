import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    json({
      include: ["./package.json"],
      compact: true,
    }),
    copy({
      targets: [
        { src: "src/types", dest: "dist/src" },
      ],
    }),
    typescript({ tsconfig: "./tsconfig.build.json" }),
    terser(),
  ],
};
