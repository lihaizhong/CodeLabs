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
          ? requestAnimationFrame
          : requestAnimationFrameImpl();

      return (callback: () => void) => rAF(callback);
    }

    return (callback: () => void) => {
      // 检查canvas是否存在
      try {
        return (
          this.getGlobalCanvas() as OctopusPlatform.MiniProgramCanvas
        ).requestAnimationFrame(callback);
      } catch (error: any) {
        console.warn(error.message);
        return requestAnimationFrameImpl()(callback);
      }
    };
  },
});
