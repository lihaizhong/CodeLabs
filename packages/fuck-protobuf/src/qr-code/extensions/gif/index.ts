// ---------------------------------------------------------------------
// gifImage (B/W)
// ---------------------------------------------------------------------

import { BitOutputStream } from "../BitOutputStream";
import { ByteArrayOutputStream } from "../ByteArrayOutputStream";
import { LZWTable } from "./LZWTable";
import { Base64EncodeOutputStream } from "../Base64EncodeOutputStream";

export class GifImage {
  private signature = "GIF87a";

  private data: number[];

  constructor(private readonly width: number, private readonly height: number) {
    this.data = new Array(width * height);
  }

  private getLZWRaster(lzwMinCodeSize: number): number[] {
    const clearCode = 1 << lzwMinCodeSize;
    const endCode = (1 << lzwMinCodeSize) + 1;
    let bitLength = lzwMinCodeSize + 1;

    // Setup LZWTable
    const table = new LZWTable();
    const fromCharCode = (i: number) => String.fromCharCode(i);

    for (let i = 0; i < clearCode; i += 1) {
      table.add(fromCharCode(i));
    }

    table.add(fromCharCode(clearCode));
    table.add(fromCharCode(endCode));

    const byteOut = new ByteArrayOutputStream();
    const bitOut = new BitOutputStream(byteOut);

    // clear code
    bitOut.write(clearCode, bitLength);

    let dataIndex = 0;
    let s = fromCharCode(this.data[dataIndex++]);

    while (dataIndex < this.data.length) {
      const c = fromCharCode(this.data[dataIndex++]);

      if (table.contains(s + c)) {
        s += c;
      } else {
        bitOut.write(table.indexOf(s), bitLength);

        if (table.size < 0xfff) {
          if (table.size == 1 << bitLength) {
            bitLength++;
          }

          table.add(s + c);
        }

        s = c;
      }
    }

    bitOut.write(table.indexOf(s), bitLength);

    // end code
    bitOut.write(endCode, bitLength);

    bitOut.flush();

    return byteOut.toByteArray();
  }

  public setPixel(x: number, y: number, pixel: number): void {
    this.data[y * this.width + x] = pixel;
  }

  public write(
    out: ByteArrayOutputStream,
    blackColor = "#000000",
    whiteColor = "#ffffff"
  ): void {
    const { width, height, signature } = this;
    // ---------------------------------
    // GIF Signature

    out.writeString(signature);

    // ---------------------------------
    // Screen Descriptor

    out.writeShort(width);
    out.writeShort(height);

    out.writeByte(0x80); // 2bit
    out.writeByte(0);
    out.writeByte(0);

    // ---------------------------------
    // Global Color Map

    const black = blackColor.split("");

    // black
    out.writeByte(parseInt(`${black[1]}${black[2]}`, 16));
    out.writeByte(parseInt(`${black[3]}${black[4]}`, 16));
    out.writeByte(parseInt(`${black[5]}${black[6]}`, 16));

    const white = whiteColor.split("");

    // white
    out.writeByte(parseInt(`${white[1]}${white[2]}`, 16));
    out.writeByte(parseInt(`${white[3]}${white[4]}`, 16));
    out.writeByte(parseInt(`${white[5]}${white[6]}`, 16));

    // ---------------------------------
    // Image Descriptor

    out.writeString(",");
    out.writeShort(0);
    out.writeShort(0);
    out.writeShort(width);
    out.writeShort(height);
    out.writeByte(0);

    // ---------------------------------
    // Local Color Map

    // ---------------------------------
    // Raster Data

    const lzwMinCodeSize = 2;
    const raster = this.getLZWRaster(lzwMinCodeSize);

    out.writeByte(lzwMinCodeSize);

    let offset = 0;

    while (raster.length - offset > 255) {
      out.writeByte(255);
      out.writeBytes(raster, offset, 255);
      offset += 255;
    }

    const byte = raster.length - offset;
    out.writeByte(byte);
    out.writeBytes(raster, offset, byte);
    out.writeByte(0x00);

    // ---------------------------------
    // GIF Terminator
    out.writeString(";");
  }
}

export function createGifTag(
  width: number,
  height: number,
  getPixel: (x: number, y: number) => 0 | 1,
  black: string,
  white: string
): string {
  const gif = new GifImage(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      gif.setPixel(x, y, getPixel(x, y));
    }
  }

  const b = new ByteArrayOutputStream();

  gif.write(b, black, white);

  const base64 = new Base64EncodeOutputStream();
  const bytes = b.toByteArray();

  for (let i = 0; i < bytes.length; i++) {
    base64.writeByte(bytes[i]);
  }

  base64.flush();

  return `data:image/gif;base64,${base64}`;
}
