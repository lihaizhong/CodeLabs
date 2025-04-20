declare module "fuck-platform" {
  export interface IGetCanvasResult {
    canvas: PlatformCanvas;
    context: CanvasRenderingContext2D;
  }

  export interface OffscreenCanvasOptions {
    width: number;
    height: number;
  }
  
  export interface IGetOffscreenCanvasResult {
    canvas: PlatformOffscreenCanvas;
    context: OffscreenCanvasRenderingContext2D;
  }

  export namespace PlatformPlugin {
    export type getCanvas = (
      selector: string,
      component?: WechatMiniprogram.Component.TrivialInstance | null
    ) => Promise<IGetCanvasResult>;
  
    export type getOfsCanvas = (
      options: OffscreenCanvasOptions
    ) => IGetOffscreenCanvasResult;
  
    export type rAF = (canvas: WechatMiniprogram.Canvas, callback: () => void) => void;
  
    export type now = () => number;
  
    export interface remote {
      is: (url: string) => boolean;
      fetch: (url: string) => Promise<ArrayBuffer>;
    }
  
    export interface path {
      USER_DATA_PATH: string;
      filename: (path: string) => string;
      resolve: (name: string, prefix?: string) => string;
    }
  
    export interface local {
      write: (data: ArrayBuffer, path: string) => Promise<string>;
      read: (path: string) => Promise<ArrayBuffer>;
      remove: (path: string) => Promise<string>;
    };
  
    export interface decode {
      toBitmap?: (data: Uint8Array) => Promise<ImageBitmap>;
      toDataURL: (data: Uint8Array) => string;
      toBuffer: (data: Uint8Array) => ArrayBuffer;
      utf8: (data: Uint8Array, start: number, end: number) => string;
    }
  
    export type CreateImageInstance = { createImage: () => PlatformImage };
  
    export interface image {
      isImage: (data: unknown) => boolean;
      isImageBitmap: (data: unknown) => boolean;
      create: (canvas?: PlatformCreateImageInstance) => PlatformImage;
      load: (
        canvas: PlatformCreateImageInstance,
        data: ImageBitmap | Uint8Array | string,
        filename: string,
        prefix?: string
      ) => Promise<ImageBitmap | PlatformImage>;
    }
  }
}
