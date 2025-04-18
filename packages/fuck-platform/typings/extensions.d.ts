type PlatformCanvas = HTMLCanvasElement | WechatMiniprogram.Canvas;

type PlatformOffscreenCanvas =
  | WechatMiniprogram.OffscreenCanvas
  | OffscreenCanvas;

type PlatformRenderingContext2D =
  | OffscreenCanvasRenderingContext2D
  | CanvasRenderingContext2D;

type PlatformImage = HTMLImageElement | WechatMiniprogram.Image;

type Bitmap = PlatformImage | ImageBitmap | HTMLCanvasElement | OffscreenCanvas;

type RawImage = string | Uint8Array;
