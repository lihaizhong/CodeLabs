import { definePlugin } from "../definePlugin";

/**
 * 用于处理requestAnimationFrame
 * @returns
 */
export default definePlugin<"rAF">({
  name: "rAF",
  dependencies: ["now"],
  install() {
    const { env } = this.globals;

    function requestAnimationFrameImpl(): (callback: () => void) => number {
      return (callback: () => void) =>
        setTimeout(
          callback,
          Math.max(0, 16 - (Date.now() % 16))
        ) as unknown as number;
    }

    if (env === "h5") {
      const rAF =
        "requestAnimationFrame" in globalThis
          ? globalThis.requestAnimationFrame
          : requestAnimationFrameImpl();

      return (callback: () => void) => rAF(callback);
    }

    let canvas:
      | OctopusPlatform.PlatformCanvas
      | OctopusPlatform.PlatformOffscreenCanvas
      | null = null;
    return (callback: () => void) => {
      // 检查canvas是否存在
      if (!canvas) {
        canvas = this.getGlobalCanvas();

        if (canvas === null) {
          throw new Error(
            "requestAnimationFrame is not ready, please call `platform.setGlobalCanvas` first"
          );
        }
      }

      return (canvas as WechatMiniprogram.Canvas).requestAnimationFrame?.(
        callback
      );
    };
  },
});
