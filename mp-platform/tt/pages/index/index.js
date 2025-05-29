const app = getApp();

Page({
  data: {
    btnList: [
      {
        text: "跳转SVGA动画(官方版)",
        path: "/pages/svga2/index",
      },
      {
        text: "跳转SVGA动画(自研版)",
        path: "/pages/svga/index",
      },
      {
        text: "跳转Webview",
        path: "/pages/webview/index",
      },
      {
        text: "跳转SVGA分析",
        path: "/pages/svga-analyze/index",
      },
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
