import { platform } from "platform";
import { PNGEncoder } from "../extensions";

export function getDataURLFromImageData(imageData: ImageData) {
  const { width, height, data } = imageData;
  const pngEncoder = new PNGEncoder(width, height);

  pngEncoder.write(data);
  pngEncoder.flush();

  return platform.decode.toDataURL(pngEncoder.toBuffer());
}
