// ---------------------------------------------------------------------
// qr8BitByte
// ---------------------------------------------------------------------

import { BitBuffer } from "./bit-buffer";
import { QRMode } from "./constants";

export class BitByte {
  private readonly bytes: number[];

  constructor(data: string) {
    let parsedData: number[][] = [];

    // Added to support UTF-8 Characters
    for (let i = 0; i < data.length; i++) {
      const byteArray: number[] = [];
      const code = data.charCodeAt(i);

      if (code > 0x10000) {
        byteArray[0] = 0xf0 | ((code & 0x1c0000) >>> 18);
        byteArray[1] = 0x80 | ((code & 0x3f000) >>> 12);
        byteArray[2] = 0x80 | ((code & 0xfc0) >>> 6);
        byteArray[3] = 0x80 | (code & 0x3f);
      } else if (code > 0x800) {
        byteArray[0] = 0xe0 | ((code & 0xf000) >>> 12);
        byteArray[1] = 0x80 | ((code & 0xfc0) >>> 6);
        byteArray[2] = 0x80 | (code & 0x3f);
      } else if (code > 0x80) {
        byteArray[0] = 0xc0 | ((code & 0x7c0) >>> 6);
        byteArray[1] = 0x80 | (code & 0x3f);
      } else {
        byteArray[0] = code;
      }

      // Fix Unicode corruption bug
      parsedData.push(byteArray);
    }

    this.bytes = parsedData.flat(1);

    const { bytes } = this;
    if (bytes.length !== data.length) {
      bytes.unshift(191);
      bytes.unshift(187);
      bytes.unshift(239);
    }
  }

  public get mode(): number {
    return QRMode.MODE_8BIT_BYTE;
  }

  public get length(): number {
    return this.bytes.length;
  }

  public write(buff: BitBuffer): void {
    const { bytes } = this;

    for (let i = 0; i < bytes.length; i++) {
      buff.put(bytes[i], 8);
    }
  }
}
