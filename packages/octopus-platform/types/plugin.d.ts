declare namespace OctopusPlatform {
  export interface GetCanvasResult {
    canvas: PlatformCanvas;
    context: CanvasRenderingContext2D;
  }
  
  export interface OffscreenCanvasOptions {
    width: number;
    height: number;
  }
  
  export interface GetOffscreenCanvasResult {
    canvas: PlatformOffscreenCanvas;
    context: OffscreenCanvasRenderingContext2D;
  }
  
  export interface PlatformPlugin {
    getCanvas: (
      selector: string,
      component?: WechatMiniprogram.Component.TrivialInstance | null
    ) => Promise<GetCanvasResult>;
  
    getOfsCanvas: (options: OffscreenCanvasOptions) => GetOffscreenCanvasResult;
  
    rAF: (callback: () => void) => void;
  
    now: () => number;
  
    remote: {
      is: (url: string) => boolean;
      fetch: (url: string) => Promise<ArrayBuffer>;
    };
  
    path: {
      USER_DATA_PATH: string;
      filename: (path: string) => string;
      resolve: (name: string, prefix?: string) => string;
    };
  
    local: {
      write: (data: ArrayBuffer, path: string) => Promise<string>;
      read: (path: string) => Promise<ArrayBuffer>;
      remove: (path: string) => Promise<string>;
    } | null;
  
    decode: {
      toDataURL: (data: Uint8Array) => string;
      toBuffer: (data: Uint8Array) => ArrayBuffer;
      bytesToString: (data: Uint8Array) => string;
      utf8: (data: Uint8Array, start: number, end: number) => string;
    };
  
    image: {
      isImage: (data: unknown) => boolean;
      isImageBitmap: (data: unknown) => boolean;
      create: () => PlatformImage;
      load: (
        data: ImageBitmap | Uint8Array | string,
        filename: string,
        prefix?: string
      ) => Promise<ImageBitmap | PlatformImage>;
    };
  }
}
