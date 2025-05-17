import { platform } from "../platform";
import { PNGEncoder } from "../extensions";

export function getBufferFromImageData(imageData: ImageData) {
  const { width, height, data } = imageData;

  return new PNGEncoder(width, height).write(data).flush();
}

export function getDataURLFromImageData(imageData: ImageData) {
  const buff = getBufferFromImageData(imageData);

  return platform.decode.toDataURL(buff);
}
