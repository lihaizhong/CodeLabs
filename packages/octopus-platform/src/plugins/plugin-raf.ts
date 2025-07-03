import { MiniProgramCanvas, PlatformCanvas } from "../typings";
import { definePlugin } from "../definePlugin";

// 扩展OctopusPlatformPlugins接口
declare module "../definePlugin" {
  interface OctopusPlatformPlugins {
    rAF: (canvas: PlatformCanvas, callback: () => void) => number;
  }
}

/**
 * 用于处理requestAnimationFrame
 * @returns
 */
export default definePlugin<"rAF">({  
  name: "rAF",
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

      return (_: PlatformCanvas, callback: () => void) => rAF(callback);
    }

    return (canvas: PlatformCanvas, callback: () => void) => {
      // 检查canvas是否存在
      try {
        return (canvas as MiniProgramCanvas).requestAnimationFrame(callback);
      } catch (error: any) {
        console.warn(error.message);
        return requestAnimationFrameImpl()(callback);
      }
    };
  },
});
