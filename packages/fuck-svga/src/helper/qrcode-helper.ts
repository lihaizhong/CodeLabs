import { platform } from "../platform";
import { PNGEncoder, QRCode } from "../extensions";

export interface ICreateQrCodeImgOptions {
  size?: number;
  typeNumber?: number;
  errorCorrectLevel?: "L" | "M" | "Q" | "H";
  black?: string;
  white?: string;
}

function parseOptions(options: ICreateQrCodeImgOptions = {}) {
  const opts = { ...options };
  const typeNumber = opts.typeNumber ?? 4;
  const errorCorrectLevel = opts.errorCorrectLevel ?? "M";
  const size = opts.size ?? 500;
  const black = opts.black ?? "#000000FF";
  const white = opts.white ?? "#FFFFFFFF";

  return { typeNumber, errorCorrectLevel, size, black, white };
}

const calcCellSizeAndMargin = (moduleCount: number, size: number) => {
  const cellSize = ~~(size / moduleCount);

  return {
    margin: ~~((size - moduleCount * cellSize) / 2),
    cellSize: cellSize || 2,
  }
};

export function createQRCodeToPNG(text: string, options?: ICreateQrCodeImgOptions) {
  const { typeNumber, errorCorrectLevel, size, black, white } =
      parseOptions(options);
    let qr: QRCode;
  
    try {
      qr = new QRCode(typeNumber, errorCorrectLevel);
      qr.addData(text);
      qr.make();
    } catch (e) {
      if (typeNumber >= 40) {
        throw new Error("Text too long to encode");
      }
  
      return arguments.callee(text, {
        size,
        errorCorrectLevel,
        typeNumber: typeNumber + 1,
        black,
        white,
      });
    }
  
    // calc cellsize and margin
    const moduleCount = qr.getModuleCount();
    const { margin: min, cellSize } = calcCellSizeAndMargin(moduleCount, size);
    const max = moduleCount * cellSize + min;
    const BLACK = +black.replace("#", "0x");
    const WHITE = +white.replace("#", "0x");
    const png = new PNGEncoder(size, size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (min <= x && x < max && min <= y && y < max) {
          const c = ~~((x - min) / cellSize);
          const r = ~~((y - min) / cellSize);
          png.setPixel(x, y, qr.isDark(r, c) ? BLACK : WHITE);
        } else {
          png.setPixel(x, y, WHITE);
        }
      }
    }
  
    png.flush();

    return platform.decode.toDataURL(png.toBuffer());
}