import {
  Bitmap,
  PlatformCanvas,
  PlatformOffscreenCanvas,
} from "octopus-platform";
import { PlatformRenderingContext2D } from "@/types";
import { Renderer2D } from "./Renderer2D";

export interface Renderer2DOptions {
  context: PlatformRenderingContext2D;
}

export interface Renderer2DExtensions {
  stick: (
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    bitmap: Bitmap
  ) => () => void;
  clear: (
    type: "CL" | "RE",
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    canvas: PlatformCanvas | PlatformOffscreenCanvas,
    width: number,
    height: number
  ) => () => void;
}

export interface Renderer2DReturn {
  renderer: Renderer2D;
  extensions: Renderer2DExtensions
}

export const create2DRenderer = ({ context }: Renderer2DOptions): Renderer2DReturn => {
  return {
    renderer: new Renderer2D(context),
    extensions: {
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
  }
  };
};

export const detect2DSupport = (): boolean => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  return !!context;
};

export { Renderer2D };
