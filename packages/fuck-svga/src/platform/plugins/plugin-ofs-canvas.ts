import { definePlugin } from "../definePlugin";

/**
 * 用于创建离屏canvas
 * @returns
 */
export default definePlugin<"getOfsCanvas">({
  name: "getOfsCanvas",
  install() {
    const { env } = this.global;
    let createOffscreenCanvas;

    if (env === "h5") {
      createOffscreenCanvas = (
        options: WechatMiniprogram.CreateOffscreenCanvasOption
      ) => new OffscreenCanvas(
        options.width as number,
        options.height as number
      );
    } else if (env === "alipay") {
      createOffscreenCanvas = (
        options: WechatMiniprogram.CreateOffscreenCanvasOption
      ) => my.createOffscreenCanvas({
        width: options.width,
        height: options.height,
      });
    } else if (env === "tt") {
      createOffscreenCanvas = (
        options: WechatMiniprogram.CreateOffscreenCanvasOption
      ) => {
        const canvas = tt.createOffscreenCanvas();

        canvas.width = options.width;
        canvas.height = options.height;

        return canvas;
      };
    } else {
      createOffscreenCanvas = (
        options: WechatMiniprogram.CreateOffscreenCanvasOption
      ) => wx.createOffscreenCanvas({
        ...options,
        type: "2d",
      });
    }

    return (options: WechatMiniprogram.CreateOffscreenCanvasOption) => {
      const canvas = createOffscreenCanvas(options);
      const context = canvas.getContext("2d");

      return {
        canvas,
        context,
      };
    };
  },
});
