// 引入 fflate 库
import { deflateSync } from "fflate";
// import zlib from "zlib";
import { encode as encodeBase64 } from "uint8-to-base64";
import { encode as encodePng } from "fast-png";
import { crc32 } from "./crc";

// PNG 文件签名
const PNG_SIGNATURE = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

// IHDR 块类型
const IHDR_CHUNK_TYPE = [0x49, 0x48, 0x44, 0x52];
const IHDR_LENGTH = 13;

// IDAT 块类型
const IDAT_CHUNK_TYPE = [0x49, 0x44, 0x41, 0x54];

// IEND 块类型
const IEND_CHUNK_TYPE = [0x49, 0x45, 0x4e, 0x44];

function createIHDRChunk() {
  const ihdrData = new Uint8Array(IHDR_LENGTH);
  const view = new DataView(ihdrData.buffer);

  // 宽度
  view.setUint32(0, width);
  // 高度
  view.setUint32(4, height);
  // 位深度
  view.setUint8(8, 8);
  // 颜色类型（RGBA）
  view.setUint8(9, 6);
  // 压缩方法
  view.setUint8(10, 0);
  // 过滤方法
  view.setUint8(11, 0);
  // 隔行扫描
  view.setUint8(12, 0);
}

function createIDatChunk() {}

function createIENDChunk() {}

// 生成 PNG 文件
function generatePNG(imageData, width, height) {
  // 创建 IHDR 块
  const ihdrData = new Uint8Array(13);
  const view = new DataView(ihdrData.buffer);
  view.setUint32(0, width); // 宽度
  view.setUint32(4, height); // 高度
  view.setUint8(8, 8); // 位深度
  view.setUint8(9, 6); // 颜色类型（RGBA）
  view.setUint8(10, 0); // 压缩方法
  view.setUint8(11, 0); // 过滤方法
  view.setUint8(12, 0); // 隔行扫描

  const ihdrChunk = createChunk("IHDR", ihdrData);

  // 创建 IDAT 块
  const idatData = deflateSync(imageData);
  const idatChunk = createChunk("IDAT", idatData);

  // 创建 IEND 块
  const iendChunk = createChunk("IEND", new Uint8Array(0));

  // 组装 PNG 文件
  const pngData = new Uint8Array(
    PNG_SIGNATURE.length +
      ihdrChunk.length +
      idatChunk.length +
      iendChunk.length
  );
  let offset = 0;

  pngData.set(PNG_SIGNATURE, offset);
  offset += PNG_SIGNATURE.length;
  pngData.set(ihdrChunk, offset);
  offset += ihdrChunk.length;
  pngData.set(idatChunk, offset);
  offset += idatChunk.length;
  pngData.set(iendChunk, offset);
  offset += iendChunk.length;

  return pngData;
}

// 创建 PNG 块
function createChunk(type, data) {
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);

  view.setUint32(0, data.length); // 数据长度
  chunk.set(
    [...type].map((c) => c.charCodeAt(0)),
    4
  ); // 块类型
  chunk.set(data, 8); // 数据

  const crc = crc32(new Uint8Array([...chunk.subarray(4, 8), ...data])); // CRC32

  view.setUint32(8 + data.length, crc); // CRC32
  return chunk;
}

function main() {
  // Create Pixel Data Buffer
  const width = 256;
  const height = 256;
  const pixelData = new Uint32Array(width * height);
  const xMin = width / 4;
  const xMax = width - xMin;
  const yMin = height / 4;
  const yMax = height - yMin;

  // Populate Pixel Data Buffer
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < xMax && x > xMin && y < yMax && y > yMin) {
        pixelData[y * width + x] = 0x000000ff;
        // console.log("内框", x, y, 0x000000ff);
      } else {
        pixelData[y * width + x] = 0xffffffff;
        // console.log('外框', x, y, 0xffffffff);
      }
    }
  }

  // const pngData = generatePNG(new Uint8Array(pixelData.buffer), width, height);

  // console.log("pngData", "data:image/png;base64," + encodeBase64(pngData));
  // console.log(pngData.join(','))

  const imageData = new Uint8Array([
    255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255,
  ]);
  const pngData2 = generatePNG(imageData, 2, 2);

  console.log("pngData2", "data:image/png;base64," + encodeBase64(pngData2), '\n', pngData2.toString());

  const pngData3 = encodePng({ data: imageData, width: 2, height: 2 });

  console.log('pngData3', "data:image/png;base64," + encodeBase64(pngData3), '\n', pngData3.toString());
}

main();
