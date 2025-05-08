import { definePlugin } from "../definePlugin";

/**
 * 用于处理requestAnimationFrame
 * @returns
 */
export default definePlugin<"rAF">({
  name: "rAF",
  dependencies: ["now"],
  install() {
    const { env, canvas } = this.globals;

    function requestAnimationFrameImpl(): (callback: () => void) => number {
      return (callback: () => void) => {
        const currentTime = Date.now();
        const timeToCall = Math.max(0, 16 - (currentTime % 16));

        return setTimeout(callback, timeToCall) as unknown as number;
      };
    }

    if (env === "h5") {
      const rAF = "requestAnimationFrame" in globalThis? globalThis.requestAnimationFrame : requestAnimationFrameImpl();

      return (callback: () => void) => rAF(callback);
    }

    const rAF = "requestAnimationFrame" in canvas ? canvas.requestAnimationFrame : requestAnimationFrameImpl();

    return (callback: () => void) => rAF(callback);
  },
});
