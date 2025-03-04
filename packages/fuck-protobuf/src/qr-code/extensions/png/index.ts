import { Base64EncodeOutputStream } from "../Base64EncodeOutputStream";
import { ByteArrayOutputStream } from "../ByteArrayOutputStream";

export class PngImage {
  private data: number[] = [];

  constructor(private readonly width: number, private readonly height: number) {}

  private getLZ77Raster(): number[] {
    return []
  }

  public setPixel(x: number, y: number, pixel: number): void {
    this.data[y * this.width + x] = pixel;
  }

  write(
    out: ByteArrayOutputStream,
    blackColor = "#000000",
    whiteColor = "#ffffff"
  ): void {
    const { width, height } = this;
    // ---------------------------------
    // PNG Signature
    // 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a

    out.writeBytes([137, 80, 78, 71, 13, 10, 26, 10]);

    // ---------------------------------
    // IHDR

    out.writeShort(width);
    out.writeShort(height);

    // colorType
    // out.writeByte(0);

    // compression
    // out.writeByte(0);

    // filter
    // out.writeByte(0);

    // interlace
    // out.writeByte(0);

    // ---------------------------------
    // IDAT

    // ---------------------------------
    // IEND
  }
}

export function createPngTag(
  width: number,
  height: number,
  getPixel: (x: number, y: number) => 0 | 1,
  black: string,
  white: string
): string {
  const png = new PngImage(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      png.setPixel(x, y, getPixel(x, y));
    }
  }

  const b = new ByteArrayOutputStream();

  png.write(b, black, white);

  const base64 = new Base64EncodeOutputStream();
  const bytes = b.toByteArray();

  for (let i = 0; i < bytes.length; i++) {
    base64.writeByte(bytes[i]);
  }

  base64.flush();

  return `data:image/png;base64,${base64}`;
}
