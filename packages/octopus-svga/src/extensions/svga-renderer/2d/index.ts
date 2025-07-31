import {
  Bitmap,
  PlatformCanvas,
  PlatformOffscreenCanvas,
} from "octopus-platform";
export * from "./Renderer2D";

export const Renderer2DExtension = {
  stick:
    (
      context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
      bitmap: Bitmap
    ) =>
    () =>
      context.drawImage(bitmap, 0, 0),
  clear: (
    type: "CL" | "RE",
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    canvas: PlatformCanvas | PlatformOffscreenCanvas,
    width: number,
    height: number
  ) => {
    if (type === "CL") {
      return () => {
        // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布，无论是Canvas还是OffscreenCanvas
        context!.clearRect(0, 0, width, height);
      };
    }

    return () => {
      canvas!.width = width;
      canvas!.height = height;
    };
  },
};
