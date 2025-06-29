import { definePlugin } from "../definePlugin";

export default definePlugin<"system">({
  name: "system",
  install() {
    const { env } = this.globals;

    switch (env) {
      case "weapp":
        return (wx.getDeviceInfo().platform as string).toLowerCase();
      case "alipay":
        return (my.getDeviceBaseInfo().platform as string).toLowerCase();
      case "tt":
        return (tt.getDeviceInfoSync().platform as string).toLowerCase();
      default:
        return "unknown";
    }
  },
});
