// ---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2025 LiHZSky
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
// http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//
// ---------------------------------------------------------------------

import { BitBuffer } from "./bit-buffer";
import { BitByte } from "./bit-byte";
import { RSBlock, RSBlockCount } from "./block";
import { QRErrorCorrectLevel } from "./constants";
import { Base64DecodeInputStream } from "./extensions/Base64DecodeInputStream";
import { Polynomial } from "./polynomial";
import { Util } from "./util";

const PAD0 = 0xec;
const PAD1 = 0x11;

/**
 * QRCode实现
 * https://www.cnblogs.com/leestar54/p/15782929.html
 * @param typeNumber 1 to 40
 * @param errorCorrectLevel 'L','M','Q','H'
 */
export class QRCode {
  // ---------------------------------------------------------------------
  // QRCode.stringToBytes
  // ---------------------------------------------------------------------

  static stringToBytes(s: string): number[] {
    const bytes: number[] = [];

    for (let i = 0; i < s.length; i++) {
      bytes.push(s.charCodeAt(i) & 0xff);
    }

    return bytes;
  }

  // ---------------------------------------------------------------------
  // qrcode.createStringToBytes
  // ---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  static createStringToBytes(
    unicodeData: string,
    numChars: number
  ): (s: string) => number[] {
    // create conversion map.
    const unicodeMap = (() => {
      const bin = new Base64DecodeInputStream(unicodeData);
      const read = () => {
        const b = bin.read();

        if (b == -1) throw new Error("character defect!");

        return b;
      };
      const unicodeMap: Record<string, number> = {};
      let count = 0;

      while (true) {
        const b0 = bin.read();

        if (b0 == -1) break;

        const b1 = read();
        const b2 = read();
        const b3 = read();
        const k = String.fromCharCode((b0 << 8) | b1);
        const v = (b2 << 8) | b3;

        unicodeMap[k] = v;
        count += 1;
      }

      if (count != numChars) {
        throw new Error(`${count} != ${numChars}`);
      }

      return unicodeMap;
    })();

    const unknownChar = "?".charCodeAt(0);

    return (s: string) => {
      const bytes: number[] = [];

      for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);

        if (c < 128) {
          bytes.push(c);
        } else {
          const b = unicodeMap[s.charAt(i)];

          if (typeof b == "number") {
            if ((b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }

      return bytes;
    };
  }

  private readonly errorCorrectLevel: number;

  private modules: boolean[][] = [];

  private moduleCount = 0;

  private dataCache: number[] | null = null;

  private dataList: BitByte[] = [];

  constructor(
    private readonly typeNumber: number,
    errorCorrectLevel: "L" | "M" | "Q" | "H"
  ) {
    this.errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
  }

  private makeImpl(test: boolean, maskPattern: number): void {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = ((moduleCount: number) => {
      const modules: boolean[][] = [];

      // 预设一个 moduleCount * moduleCount 的空白矩阵
      for (let row = 0; row < moduleCount; row++) {
        modules[row] = [];

        for (let col = 0; col < moduleCount; col++) {
          modules[row][col] = null as unknown as boolean;
        }
      }

      return modules;
    })(this.moduleCount);;

    const count = this.moduleCount - 7;

    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(count, 0);
    this.setupPositionProbePattern(0, count);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);

    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }

    if (this.dataCache == null) {
      this.dataCache = this.createData(
        this.typeNumber,
        this.errorCorrectLevel,
        this.dataList
      );
    }

    this.mapData(this.dataCache, maskPattern);
  }

  private setupPositionProbePattern(row: number, col: number): void {
    const { modules, moduleCount } = this;

    for (let r = -1; r <= 7; r++) {
      const nr = row + r;
      if (nr <= -1 || moduleCount <= nr) continue;

      for (let c = -1; c <= 7; c++) {
        const nc = col + c;
        if (nc <= -1 || moduleCount <= nc) continue;

        modules[nr][nc] =
          (r >= 0 && r <= 6 && (c == 0 || c == 6)) ||
          (c >= 0 && c <= 6 && (r == 0 || r == 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      }
    }
  }

  private setupPositionAdjustPattern(): void {
    const { typeNumber, modules } = this;
    const pos = Util.getPatternPosition(typeNumber);
    const { length } = pos;

    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        const row = pos[i];
        const col = pos[j];

        if (modules[row][col] != null) continue;

        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            modules[row + r][col + c] =
              r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0);
          }
        }
      }
    }
  }

  private setupTimingPattern(): void {
    const { moduleCount, modules } = this;
    const count = moduleCount - 8;

    for (let r = 8; r < count; r++) {
      if (modules[r][6] != null) continue;

      modules[r][6] = r % 2 == 0;
    }

    for (let c = 8; c < count; c++) {
      if (modules[6][c] != null) continue;

      modules[6][c] = c % 2 == 0;
    }
  }

  private setupTypeInfo(test: boolean, maskPattern: number): void {
    const { errorCorrectLevel, modules, moduleCount } = this;
    const data = (errorCorrectLevel << 3) | maskPattern;
    const bits = Util.getBCHTypeInfo(data);

    // vertical
    for (let i = 0; i < 15; i++) {
      const mod = !test && ((bits >> i) & 1) == 1;

      if (i < 6) {
        modules[i][8] = mod;
      } else if (i < 8) {
        modules[i + 1][8] = mod;
      } else {
        modules[moduleCount - 15 + i][8] = mod;
      }
    }

    // horizontal
    for (let i = 0; i < 15; i++) {
      const mod = !test && ((bits >> i) & 1) == 1;

      if (i < 8) {
        modules[8][moduleCount - i - 1] = mod;
      } else if (i < 9) {
        modules[8][15 - i] = mod;
      } else {
        modules[8][15 - i - 1] = mod;
      }
    }

    // fixed module
    modules[moduleCount - 8][8] = !test;
  }

  private getBestMaskPattern(): number {
    let minLostPoint = 0;
    let pattern = 0;

    for (let i = 0; i < 8; i++) {
      this.makeImpl(true, i);

      const lostPoint = Util.getLostPoint(this);
      if (i == 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }

    return pattern;
  }

  private setupTypeNumber(test: boolean): void {
    const { typeNumber, modules, moduleCount } = this;
    const bits = Util.getBCHTypeNumber(typeNumber);

    for (let i = 0; i < 18; i++) {
      const mod = !test && ((bits >> i) & 1) == 1;

      modules[~~(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod;
      modules[(i % 3) + moduleCount - 8 - 3][~~(i / 3)] = mod;
    }
  }

  private createData(
    typeNumber: number,
    errorCorrectLevel: number,
    dataList: BitByte[]
  ): number[] {
    const rsBlocks = new RSBlock().getRSBlocks(typeNumber, errorCorrectLevel);
    const buffer = new BitBuffer();

    for (let i = 0; i < dataList.length; i++) {
      const data = dataList[i];

      buffer.put(data.mode, 4);
      buffer.put(data.length, Util.getLengthInBits(data.mode, typeNumber));
      data.write(buffer);
    }

    // calc num max data.
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }

    const totalCount = totalDataCount * 8;
    if (buffer.lengthInBits > totalCount) {
      throw new Error(
        `code length overflow. (${buffer.lengthInBits} > ${totalCount})`
      );
    }

    // end code
    if (buffer.lengthInBits + 4 <= totalCount) {
      buffer.put(0, 4);
    }

    // padding
    while (buffer.lengthInBits % 8 != 0) {
      buffer.putBit(false);
    }

    // padding
    while (true) {
      if (buffer.lengthInBits >= totalCount) {
        break;
      }
      buffer.put(PAD0, 8);

      if (buffer.lengthInBits >= totalCount) {
        break;
      }
      buffer.put(PAD1, 8);
    }

    return this.createBytes(buffer, rsBlocks);
  }

  private mapData(data: number[], maskPattern: number): void {
    const { modules, moduleCount } = this;
    const maskFunc = Util.getMaskFunction(maskPattern);
    let inc = -1;
    let row = moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;

    for (let col = row; col > 0; col -= 2) {
      if (col == 6) col -= 1;

      while (true) {
        for (let c = 0; c < 2; c++) {
          if (modules[row][col - c] == null) {
            let dark = false;

            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) == 1;
            }

            if (maskFunc(row, col - c)) {
              dark = !dark;
            }

            modules[row][col - c] = dark;
            bitIndex--;

            if (bitIndex == -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }

        row += inc;

        if (row < 0 || moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  private createBytes(
    bitBuffer: BitBuffer,
    rsBlocks: RSBlockCount[]
  ): number[] {
    const dcdata: number[][] = [];
    const ecdata: number[][] = [];
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;

    for (let r = 0; r < rsBlocks.length; r++) {
      const dcCount = rsBlocks[r].dataCount;
      const ecCount = rsBlocks[r].totalCount - dcCount;

      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);

      dcdata[r] = [];

      for (let i = 0; i < dcCount; i++) {
        dcdata[r][i] = 0xff & bitBuffer.buffer[i + offset];
      }

      offset += dcCount;

      const rsPoly = Util.getErrorCorrectPolynomial(ecCount);
      const rawPoly = new Polynomial(dcdata[r], rsPoly.length - 1);
      const modPoly = rawPoly.mod(rsPoly);

      ecdata[r] = new Array(rsPoly.length - 1);
      for (let i = 0; i < ecdata[r].length; i++) {
        const modIndex = i + modPoly.length - ecdata[r].length;

        ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
      }
    }

    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalCodeCount += rsBlocks[i].totalCount;
    }

    const data = new Array(totalCodeCount);
    let index = 0;

    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) {
          data[index++] = dcdata[r][i];
        }
      }
    }

    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) {
          data[index++] = ecdata[r][i];
        }
      }
    }

    return data;
  }

  public isDark(row: number, col: number): boolean {
    const { moduleCount } = this;

    if (row < 0 || moduleCount <= row || col < 0 || moduleCount <= col) {
      throw new Error(`${row}, ${col}`);
    }

    return this.modules[row][col];
  }

  public addData(data: string): void {
    this.dataList.push(new BitByte(data));
    this.dataCache = null;
  }

  public getModuleCount(): number {
    return this.moduleCount;
  }

  public make(): void {
    this.makeImpl(false, this.getBestMaskPattern());
  }
}
