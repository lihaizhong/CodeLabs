import { definePlugin } from "../definePlugin";

/**
 * 用于处理requestAnimationFrame
 * @returns
 */
export default definePlugin<"rAF">({
  name: "rAF",
  install() {
    const { env } = this.global;

    if (env === "h5") {
      return (_: PlatformCanvas, callback: () => void) =>
        globalThis.requestAnimationFrame(callback);
    }

    return (canvas: PlatformCanvas, callback: () => void) =>
      (canvas as WechatMiniprogram.Canvas).requestAnimationFrame(callback);
  },
});
