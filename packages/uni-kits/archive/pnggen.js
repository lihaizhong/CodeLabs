import fs from "node:fs";
import { deflateSync, crc32 } from "node:zlib";
import { Buffer } from "node:buffer";
// const { zlibSync: deflateSync } = require('fflate');
// const { crc32 } = require('./crc.js');

// --------------------------
// 工具函数：生成 PNG 块（Chunk）
// --------------------------
function createChunk(type, data) {
  // 长度（4字节，大端序）
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  // 块类型（4字节 ASCII）
  const chunkType = Buffer.from(type, 'ascii');

  // 数据内容
  const chunkData = data;

  console.log('chunkData', chunkData, 'chunk type', chunkType);
  // 计算 CRC32 校验（类型+数据）
  const crcValue = crc32(Buffer.concat([chunkType, chunkData]));
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crcValue >>> 0, 0); // 确保无符号

  return Buffer.concat([length, chunkType, chunkData, crc]);
}

// --------------------------
// 生成 PNG 文件
// --------------------------
function generatePNG(width, height, pixelDataRGBA) {
  // 1. 文件头（固定 8 字节）
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // 2. 构建 IHDR 块
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);   // 宽度
  ihdrData.writeUInt32BE(height, 4);  // 高度
  ihdrData.writeUInt8(8, 8);          // 位深度（8 bits per channel）
  ihdrData.writeUInt8(6, 9);          // 颜色类型（RGBA=6）
  ihdrData.writeUInt8(0, 10);         // 压缩方法（Deflate）
  ihdrData.writeUInt8(0, 11);         // 过滤方法（Adaptive Filtering）
  ihdrData.writeUInt8(0, 12);         // 非隔行扫描
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // 3. 处理像素数据（应用扫描线过滤）
  let filteredData = Buffer.alloc(0);
  const bytesPerPixel = 4; // RGBA
  for (let y = 0; y < height; y++) {
    // 每行前添加过滤类型（0=无过滤）
    const filterType = Buffer.from([0x00]);

    // 当前行像素的起始位置
    const rowStart = y * width * bytesPerPixel;
    const rowEnd = rowStart + width * bytesPerPixel;
    const rowData = pixelDataRGBA.slice(rowStart, rowEnd);

    filteredData = Buffer.concat([filteredData, filterType, rowData]);
  }

  console.log('filteredData length', filteredData.byteLength, 'pixelDataRGBA length', pixelDataRGBA.byteLength);
  // 4. 压缩数据（使用 zlib）
  const compressedData = deflateSync(filteredData, {
    level: 9,
  });

  // 5. 构建 IDAT 块（单个块）
  const idatChunk = createChunk('IDAT', compressedData);

  // 6. 构建 IEND 块（固定数据）
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  // 7. 合并所有块
  const pngBuffer = Buffer.concat([
    pngSignature,
    ihdrChunk,
    idatChunk,
    iendChunk,
  ]);

  return pngBuffer;
}

// --------------------------
// 示例生成一个红色 2x2 的 PNG
// --------------------------
function main() {
  const width = 1;
  const height = 1;
  const pixels = Buffer.alloc(width * height * 4);

  // 填充像素为透明（RGB=0,0,0），不透明（A=0）
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 0;     // R
    pixels[i + 1] = 0;   // G
    pixels[i + 2] = 0;   // B
    pixels[i + 3] = 0; // A
  }

  const pngData = generatePNG(width, height, pixels);
  fs.writeFileSync('output.png', pngData);

  for (let i = 0; i < pngData.length; i += 20) {
    console.log('pngData chunk', pngData.subarray(i, i + 20));
  }

  const pngViewer = new Uint8Array(pngData)

  console.log('PNG 文件已生成: output.png', 'byteLength', pngViewer.byteLength, 'byteOffset', pngViewer.byteOffset);
}

main()
