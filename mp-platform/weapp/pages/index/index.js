Page({
  data: {
    btnList: [
      {
        text: "跳转SVGA动画库(自研版)",
        path: "/pages/svga/index",
      },
      {
        text: "跳转SVGA动画库(官方版)",
        path: "/pages/svga2/index",
      },
      {
        text: "跳转SVGA海报(自研版)",
        path: "/pages/poster/index",
      },
      {
        text: "跳转Webview",
        path: "/pages/webview/index",
      },
      {
        text: "跳转APNG动画",
        path: "/pages/apng/index"
      }
    ],
  },
  handleNavigateTo(e) {
    const { url } = e.currentTarget.dataset;

    if (url) {
      wx.navigateTo({ url });
    } else {
      console.error("未获取到跳转路径", e);
    }
  },
});
