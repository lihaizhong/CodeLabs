import { definePlugin } from "../definePlugin";

/**
 * 图片加载插件
 * @package plugin-fsm 本地文件存储能力
 * @package plugin-path 路径处理能力
 * @package plugin-decode 解码能力
 */
export default definePlugin<"image">({
  name: "image",
  install() {
    const { local, path, decode } = this;
    const { env, br } = this.global;

    /**
     * 加载图片
     * @param img
     * @param src
     * @returns
     */
    function loadImage(img: PlatformImage, src: string) {
      return new Promise<PlatformImage>((resolve, reject) => {
        img.onload = () => {
          // 如果 data 是 URL/base64 或者 img.src 是 base64
          if (/^(?:data:|http(s)?:\/\/)/.test(src)) {
            resolve(img);
          } else {
            local
              .remove(src)
              .then(() => resolve(img))
              .catch(() => resolve(img));
          }
        };
        img.onerror = () =>
          reject(new Error(`SVGA LOADING FAILURE: ${img.src}`));
        img.src = src;
      });
    }

    if (env === "h5") {
      const createImage = (_: FuckSvga.PlatformCreateImageInstance) => new Image();
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
          brush: FuckSvga.PlatformCreateImageInstance,
          data: ImageBitmap | Uint8Array | string,
          _filename: string,
          _prefix?: string
        ) => {
          // 由于ImageBitmap在图片渲染上有优势，故优先使用
          if (data instanceof Uint8Array && "createImageBitmap" in globalThis) {
            return decode.toBitmap!(data);
          }

          if (data instanceof ImageBitmap) {
            return Promise.resolve(data);
          }

          return loadImage(createImage(brush), genImageSource(data));
        },
      };
    }

    const createImage = (brush: FuckSvga.PlatformCreateImageInstance) =>
      brush.createImage();
    const genImageSource = async (
      data: Uint8Array | string,
      filename: string,
      prefix?: string
    ) => {
      if (typeof data === "string") {
        return data;
      }

      // FIXME: 支付宝小程序IDE保存临时文件会失败;抖音最大用户文件大小为10M
      if (env === "tt" || (env === "alipay" && (br as any).isIDE)) {
        return decode.toDataURL(data);
      }

      try {
        // FIXME: IOS设备Uint8Array转base64时间较长，使用图片缓存形式速度会更快
        return local!.write(
          decode.toBuffer(data),
          path.resolve(filename, prefix)
        );
      } catch (ex: any) {
        console.warn(`图片缓存失败：${ex.message}`);
        return decode.toDataURL(data);
      }
    };

    return {
      isImage: (data: unknown) =>
        !!(
          data &&
          (data as WechatMiniprogram.Image).src !== undefined &&
          (data as WechatMiniprogram.Image).width !== undefined &&
          (data as WechatMiniprogram.Image).height !== undefined
        ),
      isImageBitmap: (_data: unknown) => false,
      create: createImage,
      load: async (
        brush: FuckSvga.PlatformCreateImageInstance,
        data: ImageBitmap | Uint8Array | string,
        filename: string,
        prefix?: string
      ) => {
        const src = await genImageSource(
          data as Uint8Array | string,
          filename,
          prefix
        );
        const img = createImage(brush);

        return loadImage(img, src);
      },
    };
  },
});
