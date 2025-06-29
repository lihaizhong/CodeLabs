declare namespace OctopusPlatform {
  export interface GetCanvasResult {
    canvas: PlatformCanvas;
    context: CanvasRenderingContext2D;
  }

  export interface GetOffscreenCanvasResult {
    canvas: PlatformOffscreenCanvas;
    context: OffscreenCanvasRenderingContext2D;
  }

  export interface PlatformPlugin {
    getCanvas: (selector: string, component?: any) => Promise<GetCanvasResult>;

    getOfsCanvas: (options: OffscreenCanvasOptions) => GetOffscreenCanvasResult;

    rAF: (canvas: PlatformCanvas, callback: () => void) => number;

    now: () => number;

    system: string;

    remote: {
      is: (url: string) => boolean;
      fetch: (url: string) => Promise<ArrayBuffer>;
    };

    path: {
      USER_DATA_PATH: string;
      is: (filepath: string) => boolean;
      filename: (filepath: string) => string;
      resolve: (name: string, prefix?: string) => string;
    };

    local: {
      write: (data: ArrayBufferLike, filepath: string) => Promise<string>;
      read: (filepath: string) => Promise<ArrayBuffer>;
      remove: (filepath: string) => Promise<string>;
    } | null;

    decode: {
      toDataURL: (data: Uint8Array) => string;
      toBuffer: (data: Uint8Array) => ArrayBuffer;
      bytesToString: (data: Uint8Array) => string;
      utf8: (data: Uint8Array, start: number, end: number) => string;
    };

    image: {
      create: (_: PlatformCanvas | PlatformOffscreenCanvas) => PlatformImage;
      load: (
        createImage: () => HTMLImageElement,
        data: ImageBitmap | Uint8Array | string,
        filepath: string,
      ) => Promise<ImageBitmap | PlatformImage>;
      release: (img: PlatformImage) => void;
    };
  }
}
