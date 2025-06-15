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
    let genImageSource: (
      data: Uint8Array | string,
      filepath: string
    ) => Promise<string> | string = (
      data: Uint8Array | string,
      _filepath: string
    ) => {
      if (typeof data === "string") {
        return data;
      }

      return decode.toDataURL(data);
    };

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
      return {
        load: (
          _canvas:
            | OctopusPlatform.PlatformCanvas
            | OctopusPlatform.PlatformOffscreenCanvas,
          data: ImageBitmap | Uint8Array | string,
          filepath: string,
          caches: OctopusPlatform.ImageCaches
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

          return loadImage(
            new Image(),
            genImageSource(data as Uint8Array | string, filepath) as string
          );
        },
        release: (caches: OctopusPlatform.ImageCaches) => {
          const imgs = caches.getCaches() as ImageBitmap[];

          for (const img of imgs) {
            img.close();
          }

          caches.cleanup();
        },
      } satisfies OctopusPlatform.PlatformPlugin["image"];
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
      load: async (
        canvas:
          | OctopusPlatform.PlatformCanvas
          | OctopusPlatform.PlatformOffscreenCanvas,
        data: ImageBitmap | Uint8Array | string,
        filepath: string,
        caches: OctopusPlatform.ImageCaches
      ) => {
        const src = await genImageSource(data as Uint8Array | string, filepath);

        const img: OctopusPlatform.PlatformImage =
          caches.getImage() ||
          (canvas as OctopusPlatform.MiniProgramCanvas).createImage();

        caches.push(img);

        return loadImage(img, src);
      },
      release: (caches: OctopusPlatform.ImageCaches) => {
        const imgs = caches.getCaches() as OctopusPlatform.PlatformImage[];

        // FIXME: 小程序 image 对象需要手动释放内存，否则可能导致小程序崩溃
        for (const img of imgs) {
          if (img.src.includes(path.USER_DATA_PATH)) {
            local!.remove(img.src).catch(noop);
          }

          img.onload = null;
          img.onerror = null;
          img.src = "";
        }

        // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
        env === "alipay" ? caches.cleanup() : caches.tidy();
      },
    } satisfies OctopusPlatform.PlatformPlugin["image"];
  },
});
