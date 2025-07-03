import { platform } from "../core/platform";
import { PNGEncoder, QRCode } from "../extensions";

export interface IQrCodeImgOptions {
  /**
   * 二维码内容
   */
  code: string;
  /**
   * 二维码的大小
   */
  size: number;
  /**
   * 二维码的码元 二维码横向有多少个小点（1 - 40）
   */
  typeNumber?: number;
  /**
   * 二维码的纠错等级
   * L: 7%（错误字码在 7% 以内可被修正, 容错率较低不建议使用）
   * M: 15%（错误字码在 15% 以内可被修正, 容错率较低不建议使用）
   * Q: 25%（错误字码在 25% 以内可被修正）
   * H: 30%（错误字码在 30% 以内可被修正）
   */
  correctLevel?: "L" | "M" | "Q" | "H";
  /**
   * 二维码颜色，仅支持 六位的十六进制颜色值，暂不支持透明色 (仅对二维码生效)
   */
  codeColor?: string;
  /**
   * 二维码背景颜色，仅支持 六位的十六进制 颜色值。暂不支持透明色 (仅对二维码生效)
   */
  backgroundColor?: string;
}

function parseOptions(options: IQrCodeImgOptions) {
  const typeNumber = options.typeNumber ?? 4;
  const correctLevel = options.correctLevel ?? "H";
  const codeColor = options.codeColor ?? "#000000";
  const backgroundColor = options.backgroundColor ?? "#FFFFFF";

  return {
    code: options.code,
    size: options.size,
    typeNumber,
    correctLevel,
    codeColor,
    backgroundColor,
  };
}

const calcCellSizeAndPadding = (moduleCount: number, size: number) => {
  const cellSize = ~~(size / moduleCount);

  return {
    padding: ~~((size - moduleCount * cellSize) / 2),
    cellSize: cellSize || 2,
  };
};

export function generateImageBufferFromCode(options: IQrCodeImgOptions) {
  const { code, typeNumber, correctLevel, size, codeColor, backgroundColor } =
    parseOptions(options);
  let qr: QRCode;

  try {
    qr = new QRCode(typeNumber, correctLevel);
    qr.addData(code);
    qr.make();
  } catch (e) {
    if (typeNumber >= 40) {
      throw new Error("Text too long to encode");
    }

    return arguments.callee({
      code,
      size,
      correctLevel,
      typeNumber: typeNumber + 1,
      codeColor,
      backgroundColor,
    });
  }

  // calc cellsize and margin
  const moduleCount = qr.getModuleCount();
  const { padding, cellSize } = calcCellSizeAndPadding(moduleCount, size);
  const max = moduleCount * cellSize + padding;
  const CODE_COLOR = +`${codeColor.replace("#", "0x")}FF`;
  const BACKGROUND_COLOR = +`${backgroundColor.replace("#", "0x")}FF`;
  const png = new PNGEncoder(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (padding <= x && x < max && padding <= y && y < max) {
        const c = ~~((x - padding) / cellSize);
        const r = ~~((y - padding) / cellSize);

        png.setPixel(x, y, qr.isDark(r, c) ? CODE_COLOR : BACKGROUND_COLOR);
      } else {
        png.setPixel(x, y, BACKGROUND_COLOR);
      }
    }
  }

  return png.flush();
}

export function generateImageFromCode(options: IQrCodeImgOptions) {
  const buff = generateImageBufferFromCode(options);

  return platform.decode.toDataURL(buff);
}
