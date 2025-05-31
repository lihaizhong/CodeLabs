declare namespace OctopusPlatform {
  export interface MiniProgramCanvas extends HTMLCanvasElement {
    createImage(): HTMLImageElement;

    requestAnimationFrame(callback: () => void): number;
  }

  export type PlatformCanvas = MiniProgramCanvas | HTMLCanvasElement;

  export interface MiniProgramOffscreenCanvas extends OffscreenCanvas {
    createImage(): HTMLImageElement;
  }

  export type PlatformOffscreenCanvas =
    | MiniProgramOffscreenCanvas
    | OffscreenCanvas;

  export interface OffscreenCanvasOptions {
    width: number;
    height: number;
    type?: "2d" | "webgl";
  }

  export interface MiniProgramImage extends HTMLImageElement {
    width: number;
    height: number;
  }

  export type PlatformImage = MiniProgramImage | HTMLImageElement;

  export type Bitmap =
    | PlatformImage
    | ImageBitmap
    | HTMLCanvasElement
    | OffscreenCanvas;

  export type RawImage = string | Uint8Array;
}
