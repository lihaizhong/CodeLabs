import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

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
    typescript({
      baseUrl: "src",
      declaration: true,
      // rootDirs: ["src", "types"],
      include: ["src/**", "types/**"],
    }),
    terser()
  ],
};
