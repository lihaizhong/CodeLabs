import { zlibSync } from "fflate";
import { crc32 } from "./crc";

export class PNGEncoder {
  private readonly view: DataView;

  private pngData: Uint8Array = new Uint8Array(0);

  constructor(private readonly width: number, private readonly height: number) {
    const buff = new ArrayBuffer(4 * width * height);

    this.view = new DataView(buff);
  }

  private createChunk(type: string, data: Uint8Array): Uint8Array {
    // 长度（4字节，大端序）
    const length = new Uint8Array(4);
    const lengthView = new DataView(length.buffer);

    lengthView.setUint32(0, data.length, false);

    // 块类型（4字节， ASCII）
    const chunkType = new Uint8Array([
      type.charCodeAt(0),
      type.charCodeAt(1),
      type.charCodeAt(2),
      type.charCodeAt(3),
    ]);

    const partialChunk = new Uint8Array([...chunkType,...data]);
    // 计算 CRC32 校验（类型 + 数据）
    const crcValue = crc32(partialChunk);
    const crc = new Uint8Array(4);
    const crcView = new DataView(crc.buffer);

    crcView.setUint32(0, crcValue >>> 0, false);

    return new Uint8Array([...length, ...partialChunk, ...crc]);
  }

  private createIHDRChunk(): Uint8Array {
    const ihdrData = new Uint8Array(13);
    const view = new DataView(ihdrData.buffer);

    // 宽度
    view.setUint32(0, this.width, false);
    // 高度
    view.setUint32(4, this.height, false);
    // 位深度
    view.setUint8(8, 8);
    // 颜色类型
    view.setUint8(9, 6);
    // 压缩方法
    view.setUint8(10, 0);
    // 过滤器方法
    view.setUint8(11, 0);
    // 交错方法
    view.setUint8(12, 0);

    return this.createChunk("IHDR", ihdrData);
  }

  private createIDATChunk(): Uint8Array {
    const { width, height, view } = this;
    const rowSize = width * 4 + 1;
    const idatData = new Uint8Array(rowSize * height);
    // 将Uint32数据转换为Uint8数据
    const pixelsData = new Uint8Array(view.buffer);

    for (let y = 0; y < height; y++) {
      const startIdx = y * rowSize;
      idatData[startIdx] = 0x00; // 过滤头
      // ✅ 复制预先转换好的 RGBA 数据
      const srcStart = y * width * 4; // Uint32 => 每个元素占 4 字节
      const srcEnd = srcStart + width * 4;
      idatData.set(pixelsData.subarray(srcStart, srcEnd), startIdx + 1);
    }

    // 使用 zlib 进行压缩, 平衡压缩率有利于提升文件生成速度
    return this.createChunk("IDAT", zlibSync(idatData));
  }

  private createIENDChunk(): Uint8Array {
    return this.createChunk("IEND", new Uint8Array(0));
  }

  public setPixel(x: number, y: number, pixel: number): void {
    this.view.setUint32((y * this.width + x) * 4, pixel, false);
  }

  public flush(): void {
    // 1. 文件头（固定 8 字节）
    const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const chunks: Uint8Array[] = [
      // 2. IHDR 块（包含图像的宽度、高度、位深度、颜色类型等信息）
      this.createIHDRChunk(),
      // 3. IDAT 块（包含图像数据）
      this.createIDATChunk(),
      // 4. IEND 块（文件结束标记）
      this.createIENDChunk(),
    ];
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    let offset = 8;

    this.pngData = new Uint8Array(offset + totalSize);
    this.pngData.set(pngSignature, 0);

    for (const chunk of chunks) {
      this.pngData.set(chunk, offset);
      offset += chunk.length;
    }
  }

  public toBuffer(): Uint8Array {
    return this.pngData;
  }
}
