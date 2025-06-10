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
    const { env, br } = this.globals;
    // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
    let caches: Array<ImageBitmap | OctopusPlatform.PlatformImage> = [];
    let point: number = 0;

    /**
     * 加载图片
     * @param img
     * @param src
     * @returns
     */
    function loadImage(img: OctopusPlatform.PlatformImage, src: string) {
      return new Promise<OctopusPlatform.PlatformImage>((resolve, reject) => {
        img.onload = () => resolve(img);
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
        // isImage: (data: unknown) => data instanceof Image,
        // isImageBitmap: (data: unknown) => data instanceof ImageBitmap,
        load: (
          data: ImageBitmap | Uint8Array | string,
          _filename: string,
          _prefix?: string
        ) => {
          // 由于ImageBitmap在图片渲染上有优势，故优先使用
          if (data instanceof Uint8Array && "createImageBitmap" in globalThis) {
            return createImageBitmap(new Blob([decode.toBuffer(data)])).then(
              (img) => {
                caches.push(img);

                return img;
              }
            );
          }

          if (data instanceof ImageBitmap) {
            caches.push(data);

            return Promise.resolve(data);
          }

          return loadImage(createImage(), genImageSource(data));
        },
        release: () => {
          for (const img of caches) {
            (img as unknown as ImageBitmap).close();
          }

          caches.length = 0;
        },
      } satisfies OctopusPlatform.PlatformPlugin["image"];
    }

    const createImage = () => {
      if (point > 0) {
        point--;

        return caches.shift() as OctopusPlatform.PlatformImage;
      }

      const img = (
        this.getGlobalCanvas() as OctopusPlatform.MiniProgramCanvas
      ).createImage();

      // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
      if (env !== "alipay") {
        caches.push(img);
      }

      return img;
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
      if (env === "tt" || (env === "alipay" && br.isIDE)) {
        return decode.toDataURL(data);
      }

      try {
        // FIXME: IOS设备Uint8Array转base64时间较长，使用图片缓存形式速度会更快
        const filePath = path.resolve(filename, prefix);

        return local!.write(decode.toBuffer(data), filePath);
      } catch (ex: any) {
        console.warn(`image cached fail: ${ex.message}`);
        return decode.toDataURL(data);
      }
    };

    return {
      // isImage: (data: unknown) =>
      //   !!(
      //     data &&
      //     (data as any).src !== void 0 &&
      //     (data as any).width !== void 0 &&
      //     (data as any).height !== void 0
      //   ),
      // isImageBitmap: (_: unknown) => false,
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
      release: () => {
        for (const img of caches) {
          if (
            (img as OctopusPlatform.PlatformImage).src.includes(
              path.USER_DATA_PATH
            )
          ) {
            local!
              .remove((img as OctopusPlatform.PlatformImage).src)
              .catch(noop);
          }

          (img as OctopusPlatform.PlatformImage).onload = null;
          (img as OctopusPlatform.PlatformImage).onerror = null;
          (img as OctopusPlatform.PlatformImage).src = "";
        }

        caches = Array.from(new Set(caches));
        point = caches.length;
      },
    } satisfies OctopusPlatform.PlatformPlugin["image"];
  },
});
