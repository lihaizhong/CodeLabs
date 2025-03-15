import { br } from "./bridge";
import { genFilePath, removeTmpFile, writeTmpFile } from "./fsm";
import { Env, SE } from "../env";
import { toBase64, toBitmap, toBuffer } from "./decode";

/**
 * 创建图片src元信息
 * @param data
 * @returns
 */
async function genImageSource(
  data: Uint8Array | string,
  filename: string,
  prefix?: string
): Promise<string> {
  if (typeof data === "string") {
    return data;
  }

  // FIXME: 支付宝小程序IDE保存临时文件会失败
  if (Env.is(SE.H5) || (Env.is(SE.ALIPAY) && (br as any).isIDE)) {
    return toBase64(data);
  }

  try {
    // FIXME: IOS设备Uint8Array转base64时间较长，使用图片缓存形式速度会更快
    return await writeTmpFile(toBuffer(data), genFilePath(filename, prefix));
  } catch (ex: any) {
    console.warn(`图片缓存失败：${ex.message}`);
    return toBase64(data);
  }
}

/**
 * 创建 Image 标签
 * @param brush 
 * @param src 
 * @returns 
 */
function createImage(
  brush: { createImage: () => PlatformImage },
  src: string
): Promise<PlatformImage> {
  return new Promise((resolve, reject) => {
    const img = brush.createImage();

    img.onload = () => {
      // 如果 data 是 URL/base64 或者 img.src 是 base64
      if (src.startsWith('data:') || typeof src === 'string') {
        resolve(img)
      } else {
        removeTmpFile(src).then(() => resolve(img)).catch(() => resolve(img))
      }
    };
    img.onerror = () => reject(new Error(`SVGA LOADING FAILURE: ${img.src}`));
    img.src = src;
  });
}

/**
 * 加载图片
 * @param brush 创建图片对象
 * @param data 图片数据
 * @param filename 图片名称
 * @param prefix 文件名称前缀
 * @returns
 */
export function loadImage(
  brush: { createImage: () => PlatformImage },
  data: ImageBitmap | Uint8Array | string,
  filename: string,
  prefix?: string
): Promise<PlatformImage | ImageBitmap> {
  if (Env.is(SE.H5)) {
    // 由于ImageBitmap在图片渲染上有优势，故优先使用
    if (data instanceof Uint8Array && "createImageBitmap" in globalThis) {
      return toBitmap(data);
    }

    if (data instanceof ImageBitmap) {
      return Promise.resolve(data);
    }
  }

  if (typeof data === 'string' && /^http(s)?:\/\//.test(data)) {
    return createImage(brush, data);
  }

  return genImageSource(data as Uint8Array | string, filename, prefix).then(
    (src: string) => createImage(brush, src)
  );
}
