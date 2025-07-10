import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import commonjs from "vite-plugin-commonjs";
import { globSync } from "tinyglobby";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __root = path.resolve(__dirname, "mp-platform/www");
/**
 * 获取所有页面入口文件
 */
const findAllEntries = () => {
  const entries = globSync("pages/**/index.html", {
    cwd: __root,
    absolute: true,
    onlyFiles: true,
  });

  const inputEntries = entries.reduce((entries, entry) => {
    // pages/index/index.html => pages/index
    const dirname = path.dirname(entry);
    // pages/index => index
    let basename = path.basename(dirname);

    if (basename === "pages") {
      // pages/index/index.html => index
      basename = path.basename(entry, ".html");
      entries["index"] = entry;
    }

    entries[basename] = entry;

    return entries;
  }, {});

  // console.log("inputEntries", inputEntries);

  return inputEntries;
};

/**
 * vite 配置
 * https://cn.vite.dev/config/
 */
export default defineConfig({
  root: __root,

  publicDir: path.resolve(__dirname, "public"),

  plugins: [commonjs()],

  resolve: {
    alias: {
      "@utils": path.resolve(__dirname, "mp-platform/www/utils"),
    },
  },

  css: {
    transformer: "lightningcss",
  },

  appType: "mpa",

  build: {
    rollupOptions: {
      input: findAllEntries(),
    },
  },

  server: {
    open: "/pages/index.html",
    // headers: {
    //   // SharedArrayBuffer 支持
    //   "Cross-Origin-Opener-Policy": "same-origin",
    //   "Cross-Origin-Embedder-Policy": "require-corp",
    //   "Cross-Origin-Resource-Policy": "same-origin",
    // },
  },
});
