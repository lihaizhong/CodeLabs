import {
  MiniProgramCanvas,
  MiniProgramOffscreenCanvas,
  PlatformCanvas,
  PlatformImage,
  PlatformOffscreenCanvas,
} from "../typings";
import { definePlugin, OctopusPlatformPlugins } from "../definePlugin";

// 扩展OctopusPlatformPlugins接口
declare module "../definePlugin" {
  interface OctopusPlatformPlugins {
    image: {
      create: (canvas: PlatformCanvas | PlatformOffscreenCanvas) => PlatformImage;
      load: (
        createImage: () => HTMLImageElement,
        data: ImageBitmap | Uint8Array | string,
        filepath: string
      ) => Promise<ImageBitmap | PlatformImage>;
      release: (img: PlatformImage) => void;
    };
  }
}

/**
 * 图片加载插件
 * @package plugin-fsm 本地文件存储能力
 * @package plugin-path 路径处理能力
 * @package plugin-decode 解码能力
 */
export default definePlugin<"image", "local" | "decode">({  
  name: "image",
  dependencies: ["local", "decode"],
  install() {
    const { local, decode } = this as any;
    const { env } = this.globals;
    let genImageSource: (
      data: Uint8Array | string,
      filepath: string
    ) => Promise<string> | string = (
      data: Uint8Array | string,
      _filepath: string
    ) => (typeof data === "string" ? data : decode.toDataURL(data));

    /**
     * 加载图片
     * @param img
     * @param url
     * @returns
     */
    function loadImage(img: PlatformImage, url: string) {
      return new Promise<PlatformImage>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`SVGA LOADING FAILURE: ${url}`));
        img.src = url;
      });
    }

    function releaseImage(img: PlatformImage) {
      img.onload = null;
      img.onerror = null;
      img.src = "";
    }

    if (env === "h5") {
      return {
        create: (_: PlatformCanvas | PlatformOffscreenCanvas) => new Image(),
        load: (
          createImage: () => HTMLImageElement,
          data: ImageBitmap | Uint8Array | string,
          filepath: string
        ) => {
          // 由于ImageBitmap在图片渲染上有优势，故优先使用
          if (data instanceof Uint8Array && "createImageBitmap" in globalThis) {
            return createImageBitmap(new Blob([decode.toBuffer(data)]));
          }

          if (data instanceof ImageBitmap) {
            return Promise.resolve(data);
          }

          return loadImage(
            createImage(),
            genImageSource(data as Uint8Array | string, filepath) as string
          );
        },
        release: releaseImage,
      } satisfies OctopusPlatformPlugins["image"];
    }

    // FIXME: 支付宝小程序IDE保存临时文件会失败;抖音最大用户文件大小为10M
    if (env === "weapp") {
      genImageSource = async (data: Uint8Array | string, filepath: string) => {
        if (typeof data === "string") {
          return data;
        }

        // FIXME: IOS设备 微信小程序 Uint8Array转base64 时间较长，使用图片缓存形式速度会更快
        return local!
          .write(decode.toBuffer(data), filepath)
          .catch((ex: any) => {
            console.warn(
              `image write fail: ${ex.errorMessage || ex.errMsg || ex.message}`
            );
            return decode.toDataURL(data);
          });
      };
    }

    return {
      create: (canvas: PlatformCanvas | PlatformOffscreenCanvas) =>
        (
          canvas as MiniProgramCanvas | MiniProgramOffscreenCanvas
        ).createImage(),
      load: async (
        createImage: () => HTMLImageElement,
        data: ImageBitmap | Uint8Array | string,
        filepath: string
      ) =>
        loadImage(
          createImage(),
          await genImageSource(data as Uint8Array | string, filepath)
        ),
      release: releaseImage,
    } satisfies OctopusPlatformPlugins["image"];
  },
});
