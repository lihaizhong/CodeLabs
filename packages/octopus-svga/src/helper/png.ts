import { platform } from "../platform";
import { PNGEncoder } from "../extensions";

/**
 * 将 ImageData 转换为 PNG 格式的 Buffer
 * @param imageData
 * @returns PNG 格式的 Buffer
 */
export function createBufferOfImageData(imageData: ImageData) {
  const { width, height, data } = imageData;

  return new PNGEncoder(width, height).write(data).flush();
}

/**
 * 将 ImageData 转换为 PNG 格式的 Base64 字符串
 * @param imageData
 * @returns PNG 格式的 Base64 字符串
 */
export function createImageDataUrl(imageData: ImageData) {
  return platform.codec.toDataURL(createBufferOfImageData(imageData));
}
