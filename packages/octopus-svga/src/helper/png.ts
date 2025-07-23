import { platform } from "../platform";
import { PNGEncoder } from "../extensions";

export function createBufferOfImageData(imageData: ImageData) {
  const { width, height, data } = imageData;

  return new PNGEncoder(width, height).write(data).flush();
}

/**
 * @deprecated 请使用 createBufferOfImageData 代替，此方法可能在后续版本中移除
 */
export const getBufferFromImageData = createBufferOfImageData;

export function createImageDataUrl(imageData: ImageData) {
  const buff = createBufferOfImageData(imageData);

  return platform.decode.toDataURL(buff);
}

/**
 * @deprecated 请使用 createImageDataUrl 代替，此方法可能在后续版本中移除
 */
export const getDataURLFromImageData = createImageDataUrl;
