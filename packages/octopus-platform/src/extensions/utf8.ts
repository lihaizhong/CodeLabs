// 使用静态缓冲区，避免重复创建
const BUFFER_SIZE = 4096; // 更大的缓冲区，减少字符串拼接次数
const STATIC_BUFFER = new Uint16Array(BUFFER_SIZE); // 预分配ASCII缓冲区

/**
 * 验证 UTF-8 解码的输入范围
 * @param buffer - 输入的字节数组
 * @param start - 起始位置
 * @param end - 结束位置
 * @throws RangeError 如果范围无效
 */
function validateRange(buffer: Uint8Array, start: number, end: number): void {
  if (start < 0 || end > buffer.length) {
    throw new RangeError("Index out of range");
  }
}

/**
 * 检测指定范围是否全为 ASCII 字符
 * @param buffer - 输入的字节数组
 * @param start - 起始位置
 * @param end - 结束位置
 * @returns true 如果所有字节 <= 0x7F
 */
function isAllAscii(buffer: Uint8Array, start: number, end: number): boolean {
  for (let i = start; i < end; i++) {
    if (buffer[i] > 0x7F) {
      return false;
    }
  }
  return true;
}

/**
 * 快速解码纯 ASCII 内容
 * @param buffer - 输入的字节数组
 * @param start - 起始位置
 * @param end - 结束位置
 * @returns 解码后的字符串
 */
function decodeAsciiFastPath(
  buffer: Uint8Array,
  start: number,
  end: number
): string {
  const resultParts: string[] = [];

  // 批量处理，每次处理 BUFFER_SIZE 个字节
  for (let i = start; i < end; i += BUFFER_SIZE) {
    const chunkEnd = Math.min(i + BUFFER_SIZE, end);
    const len = chunkEnd - i;

    // 直接复制到 Uint16Array
    for (let j = 0; j < len; j++) {
      STATIC_BUFFER[j] = buffer[i + j];
    }

    // 将缓冲区转换为字符串
    let str = '';
    for (let k = 0; k < len; k++) {
      str += String.fromCharCode(STATIC_BUFFER[k]);
    }
    resultParts.push(str);
  }

  return resultParts.join('');
}

/**
 * 解码单个 UTF-8 多字节序列
 * @param buffer - 输入的字节数组
 * @param pos - 当前位置（指向第一个字节）
 * @param end - 结束位置
 * @returns { codePoint, nextPos } 解码结果和下一位置
 */
function decodeUTF8Sequence(
  buffer: Uint8Array,
  pos: number,
  end: number
): { codePoint: number; nextPos: number } {
  const byte = buffer[pos];
  let codePoint: number;
  let nextPos = pos + 1;

  // 2 字节序列: 110xxxxx 10xxxxxx
  if ((byte & 0xE0) === 0xC0 && nextPos < end) {
    codePoint = ((byte & 0x1F) << 6) | (buffer[nextPos++] & 0x3F);
  }
  // 3 字节序列: 1110xxxx 10xxxxxx 10xxxxxx
  else if ((byte & 0xF0) === 0xE0 && nextPos + 1 < end) {
    codePoint = ((byte & 0x0F) << 12) |
               ((buffer[nextPos++] & 0x3F) << 6) |
               (buffer[nextPos++] & 0x3F);
  }
  // 4 字节序列: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
  else if ((byte & 0xF8) === 0xF0 && nextPos + 2 < end) {
    codePoint = ((byte & 0x07) << 18) |
               ((buffer[nextPos++] & 0x3F) << 12) |
               ((buffer[nextPos++] & 0x3F) << 6) |
               (buffer[nextPos++] & 0x3F);
  }
  // 无效的 UTF-8 序列
  else {
    codePoint = 0xFFFD; // Unicode 替换字符
    // 跳过可能的后续字节
    while (nextPos < end && (buffer[nextPos] & 0xC0) === 0x80) {
      nextPos++;
    }
  }

  return { codePoint, nextPos };
}

/**
 * 将码点追加到缓冲区，必要时提交
 * @param staticBuffer - 静态缓冲区
 * @param bufferPos - 当前缓冲区位置
 * @param codePoint - 要追加的码点
 * @param resultParts - 结果字符串数组
 * @param forceCommit - 是否强制提交
 * @returns 新的缓冲区位置
 */
function appendToBuffer(
  staticBuffer: Uint16Array,
  bufferPos: number,
  codePoint: number,
  resultParts: string[],
  forceCommit: boolean
): number {
  staticBuffer[bufferPos++] = codePoint;

  // 检查是否需要提交缓冲区
  if (forceCommit || bufferPos >= BUFFER_SIZE - 3) {
    let str = '';
    for (let i = 0; i < bufferPos; i++) {
      str += String.fromCharCode(staticBuffer[i]);
    }
    resultParts.push(str);
    bufferPos = 0;
  }

  return bufferPos;
}

/**
 * 解码混合内容（ASCII + 多字节 UTF-8）
 * @param buffer - 输入的字节数组
 * @param start - 起始位置
 * @param end - 结束位置
 * @returns 解码后的字符串
 */
function decodeMixedContent(
  buffer: Uint8Array,
  start: number,
  end: number
): string {
  const resultParts: string[] = [];
  let bufferPos = 0;
  let i = start;

  while (i < end) {
    const byte = buffer[i++];

    // ASCII 字符处理
    if (byte < 0x80) {
      STATIC_BUFFER[bufferPos++] = byte;

      // 如果缓冲区满了，提交并清空
      if (bufferPos === BUFFER_SIZE) {
        let str = '';
        for (let j = 0; j < bufferPos; j++) {
          str += String.fromCharCode(STATIC_BUFFER[j]);
        }
        resultParts.push(str);
        bufferPos = 0;
      }
      continue;
    }

    // 提交之前的 ASCII 字符
    if (bufferPos > 0) {
      let str = '';
      for (let j = 0; j < bufferPos; j++) {
        str += String.fromCharCode(STATIC_BUFFER[j]);
      }
      resultParts.push(str);
      bufferPos = 0;
    }

    // 解码 UTF-8 多字节序列
    const { codePoint, nextPos } = decodeUTF8Sequence(buffer, i - 1, end);
    i = nextPos;

    // 处理 Unicode 代理对（超过 0xFFFF 的码点）
    if (codePoint > 0xFFFF) {
      const surrogateCodePoint = codePoint - 0x10000;
      STATIC_BUFFER[bufferPos++] = 0xD800 + (surrogateCodePoint >> 10);
      STATIC_BUFFER[bufferPos++] = 0xDC00 + (surrogateCodePoint & 0x3FF);

      // 检查缓冲区是否需要提交（预留空间给下一个可能的代理对）
      if (bufferPos >= BUFFER_SIZE - 2) {
        let str = '';
        for (let j = 0; j < bufferPos; j++) {
          str += String.fromCharCode(STATIC_BUFFER[j]);
        }
        resultParts.push(str);
        bufferPos = 0;
      }
    } else {
      // 普通码点
      bufferPos = appendToBuffer(STATIC_BUFFER, bufferPos, codePoint, resultParts, false);
    }
  }

  // 提交剩余字符
  if (bufferPos > 0) {
    let str = '';
    for (let j = 0; j < bufferPos; j++) {
      str += String.fromCharCode(STATIC_BUFFER[j]);
    }
    resultParts.push(str);
  }

  return resultParts.join('');
}

/**
 * 优化的 UTF-8 解码函数
 * 主要优化点：
 * 1. 使用静态缓冲区减少内存分配
 * 2. 批量处理 ASCII 字符
 * 3. 优化循环结构和条件判断
 * 4. 使用 Uint16Array 代替普通数组提高性能
 *
 * @param buffer - 输入的 UTF-8 编码字节数组
 * @param start - 起始位置
 * @param end - 结束位置
 * @returns 解码后的字符串
 */
export function utf8(buffer: Uint8Array, start: number, end: number): string {
  // 1. 边界验证
  validateRange(buffer, start, end);

  // 2. 处理空输入
  if (end - start < 1) {
    return "";
  }

  // 3. 快速路径：全 ASCII
  if (isAllAscii(buffer, start, end)) {
    return decodeAsciiFastPath(buffer, start, end);
  }

  // 4. 混合内容处理
  return decodeMixedContent(buffer, start, end);
}