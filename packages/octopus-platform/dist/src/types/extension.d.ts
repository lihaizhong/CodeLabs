export type PlatformCanvas = HTMLCanvasElement | WechatMiniprogram.Canvas;

export type PlatformOffscreenCanvas =
  | WechatMiniprogram.OffscreenCanvas
  | OffscreenCanvas;

export type PlatformRenderingContext2D =
  | OffscreenCanvasRenderingContext2D
  | CanvasRenderingContext2D;

export type PlatformImage = HTMLImageElement | WechatMiniprogram.Image;

export type Bitmap =
  | PlatformImage
  | ImageBitmap
  | HTMLCanvasElement
  | OffscreenCanvas;

export type RawImage = string | Uint8Array;
