import { deflateSync } from "fflate";
import { Base64EncodeOutputStream } from "../basic/Base64EncodeOutputStream";
import { ByteArrayOutputStream } from "../basic/ByteArrayOutputStream";
import { CRC32 } from "./CRC32";

export class PngImage {
  private data: Uint32Array;

  constructor(
    private readonly width: number,
    private readonly height: number
  ) {
    this.data = new Uint32Array(width * height);
  }

  toInt8(num: number): ArrayBuffer {
    const arr = new ArrayBuffer(1);
    const view = new DataView(arr);

    view.setUint8(0, num);

    return arr;
  }

  toInt32(num: number): ArrayBuffer {
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);

    view.setUint32(0, num, false);

    return arr;
  }

  private createChunk(
    dataLength: number,
    chunkTypeBuffer: number[],
    dataBuffer: Uint8Array | number[] = []
  ) {
    const chunkType = new Uint8Array(chunkTypeBuffer);

    return new Uint8Array([
      // Length
      ...new Uint8Array(this.toInt32(dataLength)),
      // ChunkType
      ...chunkType,
      // ChunkData
      ...dataBuffer,
      // CRC
      ...new Uint8Array(
        this.toInt32(new CRC32([...chunkType, ...dataBuffer]).read())
      ),
    ]);
  }

  public get length(): number {
    return this.data.length;
  }

  public setPixel(x: number, y: number, pixel: number): void {
    this.data[y * this.width + x] = pixel;
  }

  public write(out: ByteArrayOutputStream): void {
    const { width, height } = this;
    // ---------------------------------
    // PNG Signature

    out.writeBytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    // ---------------------------------
    // IHDR

    const IHDR = this.createChunk(
      // length
      13,
      // chunkType
      [0x49, 0x48, 0x44, 0x52],
      new Uint8Array([
        // width
        ...new Uint8Array(this.toInt32(width)),
        // height
        ...new Uint8Array(this.toInt32(height)),
        // bitDepth
        ...new Uint8Array(this.toInt8(1)),
        // colorType
        ...new Uint8Array(this.toInt8(0)),
        // compression
        ...new Uint8Array(this.toInt8(0)),
        // filter
        ...new Uint8Array(this.toInt8(0)),
        // interlace
        ...new Uint8Array(this.toInt8(0)),
      ])
    );

    out.writeBytes(IHDR);

    // ---------------------------------
    // IDAT

    const data = deflateSync(new Uint8Array(this.data.buffer));
    const IDAT = this.createChunk(data.length, [0x49, 0x44, 0x41, 0x54], data);

    out.writeBytes(IDAT);

    // ---------------------------------
    // IEND

    const IEND = this.createChunk(0, [0x49, 0x45, 0x4e, 0x44]);

    out.writeBytes(IEND);
  }
}

export function createPngTag(
  width: number,
  height: number,
  getPixel: (x: number, y: number) => number
): string {
  const png = new PngImage(width, height);

  for (let i = 0; i < png.length; i++) {
    const x = i % width;
    const y = Math.floor(i / width);

    png.setPixel(x, y, getPixel(x, y));
  }

  const b = new ByteArrayOutputStream();

  png.write(b);

  const base64 = new Base64EncodeOutputStream();
  const bytes = b.toByteArray();

  for (let i = 0; i < bytes.length; i++) {
    base64.writeByte(bytes[i]);
  }

  base64.flush();

  return `data:image/png;base64,${base64}`;
}
