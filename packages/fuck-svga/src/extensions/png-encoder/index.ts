import { zlibSync } from "fflate";
import { CRC32 } from "./crc";

export class PNGEncoder {
  private readonly view: DataView;

  private pngData: Uint8Array = new Uint8Array(0);

  private crc32 = new CRC32();

  constructor(private readonly width: number, private readonly height: number) {
    const buff = new ArrayBuffer(4 * width * height);

    this.view = new DataView(buff);
  }

  private createChunk(type: string, data: Uint8Array): Uint8Array {
    // 长度（4字节，大端序）
    const length = new Uint8Array(4);
    new DataView(length.buffer).setUint32(0, data.length, false);

    // 块类型（4字节， ASCII）
    const chunkType = Uint8Array.from(type, c => c.charCodeAt(0));

    // 计算 CRC32 校验（类型 + 数据）
    const partialChunk = new Uint8Array(chunkType.length + data.length);
    partialChunk.set(chunkType);
    partialChunk.set(data, chunkType.length);
    
    const crc = new Uint8Array(4);
    new DataView(crc.buffer).setUint32(0, this.crc32.calculate(partialChunk) >>> 0, false);

    const result = new Uint8Array(length.length + partialChunk.length + crc.length);
    result.set(length);
    result.set(partialChunk, length.length);
    result.set(crc, length.length + partialChunk.length);

    return result;
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

  public write(pixels: Uint8Array | Uint8ClampedArray): void {
    const { width, height } = this;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const a = pixels[index + 3];
        const pixel = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;

        this.setPixel(x, y, pixel);
      }
    }
  }

  public flush(): void {
    // 1. 文件头（固定 8 字节）
    const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    
    // 预先创建所有块
    const ihdrChunk = this.createIHDRChunk();
    const idatChunk = this.createIDATChunk();
    const iendChunk = this.createIENDChunk();
    
    // 直接计算总大小
    const totalSize = 8 + ihdrChunk.length + idatChunk.length + iendChunk.length;
    
    // 一次性分配内存
    this.pngData = new Uint8Array(totalSize);
    let offset = 0;
    
    // 按顺序写入数据
    this.pngData.set(pngSignature, offset);
    offset += pngSignature.length;
    this.pngData.set(ihdrChunk, offset);
    offset += ihdrChunk.length;
    this.pngData.set(idatChunk, offset);
    offset += idatChunk.length;
    this.pngData.set(iendChunk, offset);

    // 清空缓存
    this.crc32.clear();
  }

  public toBuffer(): Uint8Array {
    return this.pngData;
  }
}
