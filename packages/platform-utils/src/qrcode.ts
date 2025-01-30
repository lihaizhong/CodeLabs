// ---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
// http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
// http://www.denso-wave.com/qrcode/faqpatent-e.html
//
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// QRMode
// ---------------------------------------------------------------------

const QRMode = {
  MODE_NUMBER: 1 << 0,
  MODE_ALPHA_NUM: 1 << 1,
  MODE_8BIT_BYTE: 1 << 2,
  MODE_KANJI: 1 << 3,
}

// ---------------------------------------------------------------------
// QRErrorCorrectLevel
// ---------------------------------------------------------------------

const QRErrorCorrectLevel = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
}

// ---------------------------------------------------------------------
// QRMaskPattern
// ---------------------------------------------------------------------

const QRMaskPattern = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7,
}

// ---------------------------------------------------------------------
// QRUtil
// ---------------------------------------------------------------------

class QRUtil {
  getBCHTypeInfo(data: number): number {}

  getBCHTypeNumber(data: number): number {}

  getPatternPosition(typeNumber: number): number[] {}

  getMaskFunction(maskPattern: number): boolean {}

  getErrorCorrectPolynomial(errorCorrectLength: number) {}

  getLengthInBits(mode: number, type: number): number {}

  getLostPoint(qrcode: QRCode): number {}
}

// ---------------------------------------------------------------------
// QRMath
// ---------------------------------------------------------------------



// ---------------------------------------------------------------------
// QRCode
// ---------------------------------------------------------------------

class QRCode {
  static stringToBytes(s: string): number[] {

  }

  static createStringToBytes(unicodeData: string, numChars: number): (s: string) => number[] {

  }

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectLevel 'L','M','Q','H'
   */
  constructor(typeNumber: number, errorCorrectLevel: 'L' | 'M' | 'Q' | 'H') {
    const PAD0 = 0xec
    const PAD1 = 0x11
  }

  addData(data: string): void {}

  isDark(row: number, col: number): boolean {}

  getModuleCount(): number {}

  make(): void {}

  createTableTag(cellSize: number, margin: number): string {}

  createImgTag(cellSize: number, margin: number, size: number, black: string, white: string): string {}
}
