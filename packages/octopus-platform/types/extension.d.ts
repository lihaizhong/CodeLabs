declare namespace OctopusPlatform {
  export type MiniProgramCanvas = WechatMiniprogram.Canvas | WechatMiniprogram.OffscreenCanvas;

  export type PlatformCanvas = WechatMiniprogram.Canvas | HTMLCanvasElement;

  export type PlatformOffscreenCanvas =
    | WechatMiniprogram.OffscreenCanvas
    | OffscreenCanvas;

  export type PlatformImage = WechatMiniprogram.Image | HTMLImageElement;

  export type Bitmap =
    | PlatformImage
    | ImageBitmap
    | HTMLCanvasElement
    | OffscreenCanvas;

  export type RawImage = string | Uint8Array;
}
