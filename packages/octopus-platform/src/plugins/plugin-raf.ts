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

    let rAF: ((callback: () => void) => number) | null = null;

    return (callback: () => void) => {
      if (rAF === null) {
        // 检查canvas是否存在
        try {
          const canvas = this.getGlobalCanvas() as OctopusPlatform.MiniProgramCanvas;

          rAF = canvas.requestAnimationFrame.bind(
            canvas
          );
        } catch (error: any) {
          console.warn(error.message);
          rAF = requestAnimationFrameImpl();
        }
      }

      return rAF(callback);
    };
  },
});
