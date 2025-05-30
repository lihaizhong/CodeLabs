import { definePlugin } from "../definePlugin";

export interface EnhancedPlatform extends OctopusPlatform.Platform {
  local: OctopusPlatform.PlatformPlugin["local"];
  path: OctopusPlatform.PlatformPlugin["path"];
  decode: OctopusPlatform.PlatformPlugin["decode"];
}

/**
 * 图片加载插件
 * @package plugin-fsm 本地文件存储能力
 * @package plugin-path 路径处理能力
 * @package plugin-decode 解码能力
 */
export default definePlugin<"image">({
  name: "image",
  dependencies: ["local", "path", "decode"],
  install() {
    const { local, path, decode, noop } = this as EnhancedPlatform;
    const { env } = this.globals;
    const loadedFiles: Set<string> = new Set();

    /**
     * 加载图片
     * @param img
     * @param src
     * @returns
     */
    function loadImage(img: OctopusPlatform.PlatformImage, src: string) {
      return new Promise<OctopusPlatform.PlatformImage>((resolve, reject) => {
        img.onload = () => {
          resolve(img);
          if (loadedFiles.has(src)) {
            local!
              .remove(src)
              .catch(noop)
              .then(() => loadedFiles.delete(src));
          }
        };
        img.onerror = () =>
          reject(new Error(`SVGA LOADING FAILURE: ${img.src}`));
        img.src = src;
      });
    }

    if (env === "h5") {
      const createImage = () => new Image();
      const genImageSource = (data: Uint8Array | string) => {
        if (typeof data === "string") {
          return data;
        }

        return decode.toDataURL(data);
      };

      return {
        isImage: (data: unknown) => data instanceof Image,
        isImageBitmap: (data: unknown) => data instanceof ImageBitmap,
        create: createImage,
        load: (
          data: ImageBitmap | Uint8Array | string,
          _filename: string,
          _prefix?: string
        ) => {
          // 由于ImageBitmap在图片渲染上有优势，故优先使用
          if (data instanceof Uint8Array && "createImageBitmap" in globalThis) {
            return createImageBitmap(new Blob([decode.toBuffer(data)]));
          }

          if (data instanceof ImageBitmap) {
            return Promise.resolve(data);
          }

          return loadImage(createImage(), genImageSource(data));
        },
      } satisfies OctopusPlatform.PlatformPlugin["image"];
    }

    const createImage = () => {
      const canvas = this.getGlobalCanvas() as OctopusPlatform.MiniProgramCanvas;

      return canvas.createImage();
    };
    const genImageSource = async (
      data: Uint8Array | string,
      filename: string,
      prefix?: string
    ) => {
      if (typeof data === "string") {
        return data;
      }

      // FIXME: 支付宝小程序IDE保存临时文件会失败;抖音最大用户文件大小为10M
      if (env === "tt" || env === "alipay") {
        return decode.toDataURL(data);
      }

      try {
        // FIXME: IOS设备Uint8Array转base64时间较长，使用图片缓存形式速度会更快
        const filePath = path.resolve(filename, prefix);

        await local!.write(decode.toBuffer(data), filePath);
        loadedFiles.add(filePath);

        return filePath;
      } catch (ex: any) {
        console.warn(`image cached fail: ${ex.message}`);
        return decode.toDataURL(data);
      }
    };

    return {
      isImage: (data: unknown) =>
        !!(
          data &&
          (data as WechatMiniprogram.Image).src !== void 0 &&
          (data as WechatMiniprogram.Image).width !== void 0 &&
          (data as WechatMiniprogram.Image).height !== void 0
        ),
      isImageBitmap: (_: unknown) => false,
      create: createImage,
      load: async (
        data: ImageBitmap | Uint8Array | string,
        filename: string,
        prefix?: string
      ) => {
        const src = await genImageSource(
          data as Uint8Array | string,
          filename,
          prefix
        );

        return loadImage(createImage(), src);
      },
    } satisfies OctopusPlatform.PlatformPlugin["image"];
  },
});
