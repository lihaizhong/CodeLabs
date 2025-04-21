import { platform } from "../platform";
import { PNGEncoder } from "../extensions";

export function getBufferFromImageData(imageData: ImageData) {
  const { width, height, data } = imageData;
  const pngEncoder = new PNGEncoder(width, height);

  pngEncoder.write(data);
  pngEncoder.flush();

  return pngEncoder.toBuffer()
}

export function getDataURLFromImageData(imageData: ImageData) {
  const buff = getBufferFromImageData(imageData);

  return platform.decode.toDataURL(buff);
}
