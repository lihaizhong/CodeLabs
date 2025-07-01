import { OffscreenCanvasOptions, PlatformOffscreenCanvas } from "../typings";
import { definePlugin } from "../definePlugin";

export interface GetOffscreenCanvasResult {
  canvas: PlatformOffscreenCanvas;
  context: OffscreenCanvasRenderingContext2D;
}

// 扩展OctopusPlatformPlugins接口
declare module "../definePlugin" {
  interface OctopusPlatformPlugins {
    getOfsCanvas: (options: OffscreenCanvasOptions) => GetOffscreenCanvasResult;
  }
}

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
        options: OffscreenCanvasOptions
      ) => new OffscreenCanvas(options.width, options.height);
    } else if (env === "alipay") {
      createOffscreenCanvas = (
        options: OffscreenCanvasOptions
      ) => my.createOffscreenCanvas(options);
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
      ) => wx.createOffscreenCanvas(options);
    }

    return (options: OffscreenCanvasOptions) => {
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
