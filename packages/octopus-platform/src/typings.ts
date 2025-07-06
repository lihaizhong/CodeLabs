// 模拟小程序Canvas
export interface MiniProgramCanvas extends HTMLCanvasElement {
  createImage(): HTMLImageElement;
  requestAnimationFrame(callback: () => void): number;
}

export type PlatformCanvas = MiniProgramCanvas | HTMLCanvasElement;

// 模拟小程序OffscreenCanvas
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

export interface GetCanvasResult {
  canvas: PlatformCanvas;
  context: CanvasRenderingContext2D;
}

export interface GetOffscreenCanvasResult {
  canvas: PlatformOffscreenCanvas;
  context: OffscreenCanvasRenderingContext2D;
}

/**
 * 平台插件接口
 * 各个插件通过 declare module 语法扩展此接口
 */
export interface OctopusPlatformPlugins {
  getCanvas: (selector: string, component?: any) => Promise<GetCanvasResult>;

  getOfsCanvas: (options: OffscreenCanvasOptions) => GetOffscreenCanvasResult;

  now: () => number;

  rAF: (canvas: PlatformCanvas, callback: () => void) => number;

  decode: {
    toDataURL: (data: Uint8Array) => string;
    toBuffer: (data: Uint8Array) => ArrayBuffer;
    bytesToString: (data: Uint8Array) => string;
    utf8: (data: Uint8Array, start: number, end: number) => string;
  };

  remote: {
    is: (url: string) => boolean;
    fetch: (url: string) => Promise<ArrayBuffer>;
  };

  local: {
    exists: (filepath: string) => Promise<boolean>;
    write: (data: ArrayBufferLike, filepath: string) => Promise<string>;
    read: (filepath: string) => Promise<ArrayBuffer>;
    remove: (filepath: string) => Promise<string>;
  } | null;

  image: {
    create: (canvas: PlatformCanvas | PlatformOffscreenCanvas) => PlatformImage;
    load: (
      createImage: () => HTMLImageElement,
      data: ImageBitmap | Uint8Array | string,
      filepath: string,
    ) => Promise<ImageBitmap | PlatformImage>;
    release: (img: PlatformImage) => void;
  };

  path: {
    USER_DATA_PATH: string;
    is: (filepath: string) => boolean;
    filename: (filepath: string) => string;
    resolve: (name: string, prefix?: string) => string;
  };
}
