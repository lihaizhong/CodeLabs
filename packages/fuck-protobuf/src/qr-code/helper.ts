
// ---------------------------------------------------------------------
// returns qrcode function.

import { QRCode } from ".";
import { createGifTag } from "./extensions";

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
  const black = opts.black ?? "#000000";
  const white = opts.white ?? "#FFFFFF";

  return { typeNumber, errorCorrectLevel, size, black, white };
}

const calcCellSizeAndMargin = (moduleCount: number, size: number) => {
  const cellSize = ~~(size / moduleCount);

  return {
    margin: ~~((size - moduleCount * cellSize) / 2),
    cellSize: cellSize || 2,
  }
};

export function createQRCodeToGIF(
  text: string,
  options?: ICreateQrCodeImgOptions
): string {
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

  return createGifTag(
    size,
    size,
    (x: number, y: number) => {
      if (min <= x && x < max && min <= y && y < max) {
        const c = ~~((x - min) / cellSize);
        const r = ~~((y - min) / cellSize);

        return qr.isDark(r, c) ? 0 : 1;
      }

      return 1;
    },
    black,
    white
  );
}

export function createQRCodeToHTML(
  text: string,
  options?: ICreateQrCodeImgOptions
): string {
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
  const { margin, cellSize } = calcCellSizeAndMargin(moduleCount, size);
  const commonStyle = "border-width: 0px; border-style: none; border-collapse: collapse; padding: 0px;";
  let qrHtml = `<table style="${commonStyle} margin: ${margin}px;"><tbody>`;

  for (let r = 0; r < moduleCount; r++) {
    qrHtml += "<tr>";

    for (let c = 0; c < moduleCount; c++) {
      qrHtml += `<td style="${commonStyle} margin: 0px; width: ${cellSize}px; height: ${cellSize}px; background-color: ${
        qr.isDark(r, c) ? "#000000" : "#ffffff"
      };"/>`;
    }

    qrHtml += "</tr>";
  }

  return qrHtml + "</tbody></table>";
}
