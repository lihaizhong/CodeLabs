// 使用静态缓冲区，避免重复创建
const BUFFER_SIZE = 4096; // 更大的缓冲区，减少字符串拼接次数
const STATIC_BUFFER = new Uint16Array(BUFFER_SIZE); // 预分配ASCII缓冲区

/**
 * 优化的 UTF-8 解码函数
 * 主要优化点：
 * 1. 使用静态缓冲区减少内存分配
 * 2. 批量处理 ASCII 字符
 * 3. 优化循环结构和条件判断
 * 4. 使用 Uint16Array 代替普通数组提高性能
 */
export function utf8(buffer: Uint8Array, start: number, end: number): string {
  // 边界检查
  if (start < 0 || end > buffer.length) throw new RangeError("Index out of range");
  if (end - start < 1) return "";
  
  const resultParts: string[] = [];
  let bufferPos = 0;
  const appendBuffer = (parts: Uint16Array) => {
    resultParts.push(String.fromCharCode.apply(null, Array.from(parts)));
  };
  
  // 快速路径：检查是否全是 ASCII
  let allAscii = true;
  for (let i = start; i < end; i++) {
    if (buffer[i] > 0x7F) {
      allAscii = false;
      break;
    }
  }
  
  // 全 ASCII 优化路径
  if (allAscii) {
    for (let i = start; i < end; i += BUFFER_SIZE) {
      const chunkEnd = Math.min(i + BUFFER_SIZE, end);
      const len = chunkEnd - i;
      
      // 直接复制到 Uint16Array
      for (let j = 0; j < len; j++) {
        STATIC_BUFFER[j] = buffer[i + j];
      }
      
      appendBuffer(STATIC_BUFFER.subarray(0, len));
    }
    return resultParts.join('');
  }
  
  // 混合内容处理
  for (let i = start; i < end;) {
    const byte = buffer[i++];
    
    // ASCII 字符处理
    if (byte < 0x80) {
      STATIC_BUFFER[bufferPos++] = byte;
      
      // 如果缓冲区满了，提交并清空
      if (bufferPos === BUFFER_SIZE) {
        appendBuffer(STATIC_BUFFER);
        bufferPos = 0;
      }
      continue;
    }
    
    // 提交之前的 ASCII 字符
    if (bufferPos > 0) {
      appendBuffer(STATIC_BUFFER.subarray(0, bufferPos));
      bufferPos = 0;
    }
    
    // 变长编码处理 - 使用查表法代替多个条件判断
    let codePoint: number;
    
    // 2 字节序列: 110xxxxx 10xxxxxx
    if ((byte & 0xE0) === 0xC0 && i < end) {
      codePoint = ((byte & 0x1F) << 6) | (buffer[i++] & 0x3F);
    }
    // 3 字节序列: 1110xxxx 10xxxxxx 10xxxxxx
    else if ((byte & 0xF0) === 0xE0 && i + 1 < end) {
      codePoint = ((byte & 0x0F) << 12) |
                 ((buffer[i++] & 0x3F) << 6) |
                 (buffer[i++] & 0x3F);
    }
    // 4 字节序列: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
    else if ((byte & 0xF8) === 0xF0 && i + 2 < end) {
      codePoint = ((byte & 0x07) << 18) |
                 ((buffer[i++] & 0x3F) << 12) |
                 ((buffer[i++] & 0x3F) << 6) |
                 (buffer[i++] & 0x3F);
                 
      // 处理 Unicode 代理对
      if (codePoint > 0xFFFF) {
        codePoint -= 0x10000;
        STATIC_BUFFER[bufferPos++] = 0xD800 + (codePoint >> 10);
        STATIC_BUFFER[bufferPos++] = 0xDC00 + (codePoint & 0x3FF);
        
        // 检查缓冲区是否需要提交
        if (bufferPos >= BUFFER_SIZE - 2) { // 预留空间给下一个可能的代理对
          appendBuffer(STATIC_BUFFER.subarray(0, bufferPos));
          bufferPos = 0;
        }
        continue;
      }
    }
    // 无效的 UTF-8 序列
    else {
      codePoint = 0xFFFD; // Unicode 替换字符
      // 跳过可能的后续字节
      while (i < end && (buffer[i] & 0xC0) === 0x80) i++;
    }
    
    STATIC_BUFFER[bufferPos++] = codePoint;
    
    // 检查缓冲区是否需要提交
    if (bufferPos >= BUFFER_SIZE - 3) { // 预留空间给下一个可能的多字节字符
      appendBuffer(STATIC_BUFFER.subarray(0, bufferPos));
      bufferPos = 0;
    }
  }
  
  // 提交剩余字符
  if (bufferPos > 0) {
    appendBuffer(STATIC_BUFFER.subarray(0, bufferPos));
  }
  
  return resultParts.join('');
}
