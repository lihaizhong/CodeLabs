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
  type?: "2d" | "webgl" | "webgl2" | "webgpu";
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

export interface GetOffscreenCanvas2DResult {
  canvas: PlatformOffscreenCanvas;
  context: OffscreenCanvasRenderingContext2D;
}

export interface GetOffscreenCanvasGLResult {
  canvas: PlatformOffscreenCanvas;
  context: WebGLRenderingContext;
}

export interface GetOffscreenCanvasGL2Result {
  canvas: PlatformOffscreenCanvas;
  context: WebGL2RenderingContext;
}

export interface GetOffscreenCanvasGPUResult {
  canvas: PlatformOffscreenCanvas;
  context: any;
}

export interface GetOffscreenCanvasResult {
  "2d": GetOffscreenCanvas2DResult;
  webgl: GetOffscreenCanvasGLResult;
  webgl2: GetOffscreenCanvasGL2Result;
  webgpu: GetOffscreenCanvasGPUResult;
}

export interface GetCanvas2DResult {
  canvas: PlatformCanvas;
  context: CanvasRenderingContext2D;
}

export interface GetCanvasGLResult {
  canvas: PlatformCanvas;
  context: WebGLRenderingContext;
}

export interface GetCanvasGL2Result {
  canvas: PlatformCanvas;
  context: WebGL2RenderingContext;
}

export interface GetCanvasGPUResult {
  canvas: PlatformCanvas;
  context: any;
}

export interface GetCanvasResult {
  "2d": GetCanvas2DResult;
  webgl: GetCanvasGLResult;
  webgl2: GetCanvasGL2Result;
  webgpu: GetCanvasGPUResult;
}

export interface MiniProgramIntersectionObserver {
  relativeTo: (selector: string) => void;
  relativeToViewport: () => void;
  observe: (selector: string, callback: (res: any) => void) => void;
  disconnect: () => void;
}

export interface WalkInOptions {
  root?: string;
  observeAll?: boolean;
  component?: any;
}

/**
 * 平台插件接口
 * 各个插件通过 declare module 语法扩展此接口
 */
export interface OctopusPlatformPlugins {
  getSelector: (selector: string, component?: any) => any;

  getCanvas: <T extends keyof GetCanvasResult = "2d">(
    selector: string,
    options?: any
  ) => Promise<GetCanvasResult[T]>;

  getOfsCanvas: <T extends keyof GetOffscreenCanvasResult = "2d">(
    options: OffscreenCanvasOptions
  ) => GetOffscreenCanvasResult[T];

  now: () => number;

  rAF: (canvas: PlatformCanvas, callback: () => void) => number;

  walkIn: (
    callback: (isBeIntersection: boolean) => void,
    selector: string,
    options: WalkInOptions
  ) => () => void;

  codec: {
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
      filepath: string
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
