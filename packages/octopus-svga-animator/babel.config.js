export default {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { ie: "11" },
        modules: false,
        useBuiltIns: false,
        corejs: false,
        // debug: true, // 🔥 开启后会打印所有启用的插件
      },
    ],
  ],
};
