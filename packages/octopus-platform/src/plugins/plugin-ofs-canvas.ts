import { definePlugin } from "../definePlugin";

/**
 * 用于创建离屏canvas
 * @returns
 */
export default definePlugin<"getOfsCanvas">({
  name: "getOfsCanvas",
  install() {
    const { env } = this.globals;
    let createOffscreenCanvas;

    if (env === "h5") {
      createOffscreenCanvas = (
        options: OctopusPlatform.OffscreenCanvasOptions
      ) => new OffscreenCanvas(
        options.width,
        options.height
      );
    } else if (env === "alipay") {
      createOffscreenCanvas = (
        options: OctopusPlatform.OffscreenCanvasOptions
      ) => my.createOffscreenCanvas({
        width: options.width,
        height: options.height,
      });
    } else if (env === "tt") {
      createOffscreenCanvas = (
        options: OctopusPlatform.OffscreenCanvasOptions
      ) => {
        const canvas = tt.createOffscreenCanvas();

        canvas.width = options.width;
        canvas.height = options.height;

        return canvas;
      };
    } else {
      createOffscreenCanvas = (
        options: OctopusPlatform.OffscreenCanvasOptions
      ) => wx.createOffscreenCanvas(options);
    }

    return (options: OctopusPlatform.OffscreenCanvasOptions) => {
      const canvas = createOffscreenCanvas(options);
      const context = canvas.getContext("2d");

      return {
        canvas,
        context,
      };
    };
  },
});
