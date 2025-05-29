Page({
  data: {
    btnList: [
      {
        text: "跳转SVGA动画库(官方版)",
        path: "/pages/svga2/index",
      },
      {
        text: "跳转SVGA动画库(自研版)",
        path: "/pages/svga/index",
      },
      {
        text: "跳转表单",
        path: "/pages/webview/index",
      },
    ],
  },

  handleNavigateTo(e) {
    const { url } = e.currentTarget.dataset;

    if (url) {
      my.navigateTo({ url });
    } else {
      console.error("未获取到跳转路径", e);
    }
  },
});
