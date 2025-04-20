import { OffscreenCanvasOptions, PlatformPlugin } from "octopus-platform";
import { definePlugin } from "../definePlugin";

/**
 * 用于创建离屏canvas
 * @returns
 */
export default definePlugin<"getOfsCanvas", PlatformPlugin.getOfsCanvas>({
  name: "getOfsCanvas",
  install() {
    const { env } = this.global;
    let createOffscreenCanvas;

    if (env === "h5") {
      createOffscreenCanvas = (
        options: OffscreenCanvasOptions
      ) => new OffscreenCanvas(
        options.width,
        options.height
      );
    } else if (env === "alipay") {
      createOffscreenCanvas = (
        options: OffscreenCanvasOptions
      ) => my.createOffscreenCanvas({
        width: options.width,
        height: options.height,
      });
    } else if (env === "tt") {
      createOffscreenCanvas = (
        options: OffscreenCanvasOptions
      ) => {
        const canvas = tt.createOffscreenCanvas();

        canvas.width = options.width;
        canvas.height = options.height;

        return canvas;
      };
    } else {
      createOffscreenCanvas = (
        options: OffscreenCanvasOptions
      ) => wx.createOffscreenCanvas({
        ...options,
        type: "2d",
      });
    }

    return (options: OffscreenCanvasOptions) => {
      const canvas = createOffscreenCanvas(options);
      const context = canvas.getContext("2d");

      return {
        canvas,
        context,
      };
    };
  },
});
