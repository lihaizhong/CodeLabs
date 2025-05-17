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
      ) => my.createOffscreenCanvas(options);
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
      const type = options.type || "2d";
      const canvas = createOffscreenCanvas({ ...options, type });
      const context = canvas.getContext(type);

      return {
        canvas,
        context,
      };
    };
  },
});
