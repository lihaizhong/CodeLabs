import { QRCode } from ".";
import { Polynomial } from "./polynomial";
import { QRMaskPattern, QRMode } from "./constants";
import { QRMath } from "./math";

const PATTERN_POSITION_TABLE = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170],
];
const G15 =
  (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
const G18 =
  (1 << 12) |
  (1 << 11) |
  (1 << 10) |
  (1 << 9) |
  (1 << 8) |
  (1 << 5) |
  (1 << 2) |
  (1 << 0);
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
const genBCHDigit = (data: number) => data === 0 ? 0 : Math.log2(data);
const BCH_G15 = genBCHDigit(G15);
const BCH_G18 = genBCHDigit(G18);

// ---------------------------------------------------------------------
// QRUtil
// ---------------------------------------------------------------------

export const Util = {
  getBCHTypeInfo(data: number): number {
    let d = data << 10;

    while (genBCHDigit(d) - BCH_G15 >= 0) {
      d ^= G15 << (genBCHDigit(d) - BCH_G15);
    }

    return ((data << 10) | d) ^ G15_MASK;
  },

  getBCHTypeNumber(data: number): number {
    let d = data << 12;

    while (genBCHDigit(d) - BCH_G18 >= 0) {
      d ^= G18 << (genBCHDigit(d) - BCH_G18);
    }

    return (data << 12) | d;
  },

  getPatternPosition(typeNumber: number): number[] {
    return PATTERN_POSITION_TABLE[typeNumber - 1];
  },

  getMaskFunction(maskPattern: number): (i: number, j: number) => boolean {
    const {
      PATTERN000,
      PATTERN001,
      PATTERN010,
      PATTERN011,
      PATTERN100,
      PATTERN101,
      PATTERN110,
      PATTERN111,
    } = QRMaskPattern;

    switch (maskPattern) {
      case PATTERN000:
        return (i: number, j: number) => (i + j) % 2 === 0;
      case PATTERN001:
        return (i: number) => i % 2 === 0;
      case PATTERN010:
        return (_i: number, j: number) => j % 3 === 0;
      case PATTERN011:
        return (i: number, j: number) => (i + j) % 3 === 0;
      case PATTERN100:
        return (i: number, j: number) => (~~(i / 2) + ~~(j / 3)) % 2 === 0;
      case PATTERN101:
        return (i: number, j: number) => ((i * j) % 2) + ((i * j) % 3) === 0;
      case PATTERN110:
        return (i: number, j: number) =>
          (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
      case PATTERN111:
        return (i: number, j: number) =>
          (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
      default:
        throw new Error(`bad maskPattern: ${maskPattern}`);
    }
  },

  getErrorCorrectPolynomial(errorCorrectLength: number): Polynomial {
    let a = new Polynomial([1], 0);

    for (let i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new Polynomial([1, QRMath.gexp(i)], 0));
    }

    return a;
  },

  getLengthInBits(mode: number, type: number): number {
    const { MODE_NUMBER, MODE_ALPHA_NUM, MODE_8BIT_BYTE, MODE_KANJI } = QRMode;

    if (type < 1 || type > 40) {
      throw new Error(`type: ${type}`);
    }

    if (type >= 1 && type < 10) {
      // 1 - 9

      switch (mode) {
        case MODE_NUMBER:
          return 10;
        case MODE_ALPHA_NUM:
          return 9;
        case MODE_8BIT_BYTE:
          return 8;
        case MODE_KANJI:
          return 8;
        default:
      }
    }

    if (type < 27) {
      // 10 - 26

      switch (mode) {
        case MODE_NUMBER:
          return 12;
        case MODE_ALPHA_NUM:
          return 11;
        case MODE_8BIT_BYTE:
          return 16;
        case MODE_KANJI:
          return 10;
        default:
      }
    }

    if (type <= 40) {
      // 27 - 40

      switch (mode) {
        case MODE_NUMBER:
          return 14;
        case MODE_ALPHA_NUM:
          return 13;
        case MODE_8BIT_BYTE:
          return 16;
        case MODE_KANJI:
          return 12;
        default:
      }
    }

    throw new Error(`mode: ${mode}`);
  },

  getLostPoint(qr: QRCode): number {
    const moduleCount = qr.getModuleCount();
    let lostPoint = 0;

    // LEVEL1

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const dark = qr.isDark(row, col);
        let sameCount = 0;

        for (let r = -1; r <= 1; r++) {
          const nRow = row + r;
          if (nRow < 0 || moduleCount <= nRow) continue;

          for (let c = -1; c <= 1; c++) {
            const nCol = col + c;
            if (nCol < 0 || moduleCount <= nCol) continue;
            if (r === 0 && c === 0) continue;
            if (dark === qr.isDark(nRow, nCol)) {
              sameCount++;
            }
          }
        }

        if (sameCount > 5) {
          lostPoint += sameCount + 3 - 5;
        }
      }
    }

    // LEVEL2

    for (let row = 0; row < moduleCount - 1; row++) {
      for (let col = 0; col < moduleCount - 1; col++) {
        let count = 0;

        if (qr.isDark(row, col)) count++;
        if (qr.isDark(row + 1, col)) count++;
        if (qr.isDark(row, col + 1)) count++;
        if (qr.isDark(row + 1, col + 1)) count++;
        if (count === 0 || count === 4) {
          lostPoint += 3;
        }
      }
    }

    // LEVEL3

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount - 6; col++) {
        if (
          qr.isDark(row, col) &&
          !qr.isDark(row, col + 1) &&
          qr.isDark(row, col + 2) &&
          qr.isDark(row, col + 3) &&
          qr.isDark(row, col + 4) &&
          !qr.isDark(row, col + 5) &&
          qr.isDark(row, col + 6)
        ) {
          lostPoint += 40;
        }
      }
    }

    for (let col = 0; col < moduleCount; col++) {
      for (let row = 0; row < moduleCount - 6; row++) {
        if (
          qr.isDark(row, col) &&
          !qr.isDark(row + 1, col) &&
          qr.isDark(row + 2, col) &&
          qr.isDark(row + 3, col) &&
          qr.isDark(row + 4, col) &&
          !qr.isDark(row + 5, col) &&
          qr.isDark(row + 6, col)
        ) {
          lostPoint += 40;
        }
      }
    }

    // LEVEL4

    let darkCount = 0;
    for (let col = 0; col < moduleCount; col++) {
      for (let row = 0; row < moduleCount; row++) {
        if (qr.isDark(row, col)) {
          darkCount++;
        }
      }
    }

    const ratio =
      Math.abs((100 * darkCount) / Math.pow(moduleCount, 2) - 50) / 5;

    return lostPoint + ratio * 10;
  },
};
