import jsQR from 'jsqr';

/**
 * 二维码识别结果接口
 */
interface QRCodeResult {
  data: string;
  location: {
    topLeftCorner: { x: number; y: number };
    topRightCorner: { x: number; y: number };
    bottomRightCorner: { x: number; y: number };
    bottomLeftCorner: { x: number; y: number };
  };
}

/**
 * 图像分割配置
 */
interface SplitConfig {
  // 分割的网格大小 (例如: 2x2, 3x3 等)
  gridSize: number;
  // 重叠区域百分比 (0-1 之间)
  overlap: number;
}

/**
 * 多二维码扫描器类
 */
export class MultiQRScanner {
  /**
   * 从图像数据中识别多个二维码
   * @param imageData 图像数据
   * @param config 分割配置
   * @returns 识别到的二维码结果数组
   */
  static scanMultipleQRCodes(
    imageData: ImageData,
    config: SplitConfig = { gridSize: 2, overlap: 0.2 }
  ): QRCodeResult[] {
    // 存储所有识别结果
    const results: QRCodeResult[] = [];
    // 已处理的二维码位置，用于去重
    const processedLocations: Set<string> = new Set();
    
    // 获取分割后的图像块
    const chunks = this.splitImageData(imageData, config);
    
    // 处理每个图像块
    for (const chunk of chunks) {
      const { data, width, height, offsetX, offsetY } = chunk;
      
      // 使用 jsQR 识别当前块中的二维码
      const result = jsQR(data, width, height);
      
      if (result) {
        // 调整位置坐标，加上偏移量
        const adjustedLocation = {
          topLeftCorner: {
            x: result.location.topLeftCorner.x + offsetX,
            y: result.location.topLeftCorner.y + offsetY
          },
          topRightCorner: {
            x: result.location.topRightCorner.x + offsetX,
            y: result.location.topRightCorner.y + offsetY
          },
          bottomRightCorner: {
            x: result.location.bottomRightCorner.x + offsetX,
            y: result.location.bottomRightCorner.y + offsetY
          },
          bottomLeftCorner: {
            x: result.location.bottomLeftCorner.x + offsetX,
            y: result.location.bottomLeftCorner.y + offsetY
          }
        };
        
        // 创建位置标识符用于去重
        const locationKey = `${adjustedLocation.topLeftCorner.x},${adjustedLocation.topLeftCorner.y}`;
        
        // 如果这个二维码还没处理过，添加到结果中
        if (!processedLocations.has(locationKey)) {
          processedLocations.add(locationKey);
          results.push({
            data: result.data,
            location: adjustedLocation
          });
        }
      }
    }
    
    return results;
  }
  
  /**
   * 将图像数据分割成多个重叠的块
   * @param imageData 原始图像数据
   * @param config 分割配置
   * @returns 分割后的图像块数组
   */
  private static splitImageData(
    imageData: ImageData,
    config: SplitConfig
  ): Array<{
    data: Uint8ClampedArray;
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  }> {
    const { width, height, data } = imageData;
    const { gridSize, overlap } = config;
    
    // 计算每个块的尺寸
    const chunkWidth = (width / gridSize) | 0;
    const chunkHeight = (height / gridSize) | 0;
    
    // 计算重叠的像素数
    const overlapX = (chunkWidth * overlap) | 0;
    const overlapY = (chunkHeight * overlap) | 0;
    
    const chunks = [];
    
    // 遍历网格
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        // 计算当前块的起始位置
        let startX = col * chunkWidth - (col > 0 ? overlapX : 0);
        let startY = row * chunkHeight - (row > 0 ? overlapY : 0);
        
        // 确保不超出边界
        startX = Math.max(0, startX);
        startY = Math.max(0, startY);
        
        // 计算当前块的宽高
        let currentChunkWidth = chunkWidth + (col > 0 ? overlapX : 0) + (col < gridSize - 1 ? overlapX : 0);
        let currentChunkHeight = chunkHeight + (row > 0 ? overlapY : 0) + (row < gridSize - 1 ? overlapY : 0);
        
        // 确保不超出图像边界
        currentChunkWidth = Math.min(currentChunkWidth, width - startX);
        currentChunkHeight = Math.min(currentChunkHeight, height - startY);
        
        // 创建新的 ImageData 块
        const chunkData = new Uint8ClampedArray(currentChunkWidth * currentChunkHeight * 4);
        
        // 复制像素数据
        for (let y = 0; y < currentChunkHeight; y++) {
          for (let x = 0; x < currentChunkWidth; x++) {
            const sourceIndex = ((startY + y) * width + (startX + x)) * 4;
            const targetIndex = (y * currentChunkWidth + x) * 4;
            
            chunkData[targetIndex] = data[sourceIndex];         // R
            chunkData[targetIndex + 1] = data[sourceIndex + 1]; // G
            chunkData[targetIndex + 2] = data[sourceIndex + 2]; // B
            chunkData[targetIndex + 3] = data[sourceIndex + 3]; // A
          }
        }
        
        chunks.push({
          data: chunkData,
          width: currentChunkWidth,
          height: currentChunkHeight,
          offsetX: startX,
          offsetY: startY
        });
      }
    }
    
    return chunks;
  }

  private static scan(elem: HTMLVideoElement | HTMLImageElement, width: number, height: number, config: SplitConfig): QRCodeResult[] {
    // 创建 canvas 元素
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('无法创建 canvas 上下文');
    }
    
    // 设置 canvas 尺寸与视频相同
    canvas.width = width;
    canvas.height = height;
    
    // 将视频帧绘制到 canvas 上
    context.drawImage(elem, 0, 0, width, height);
    
    // 获取图像数据
    const imageData = context.getImageData(0, 0, width, height);
    
    // 识别多个二维码
    return this.scanMultipleQRCodes(imageData, config);
  }
  
  /**
   * 从视频帧中识别多个二维码
   * @param videoElement 视频元素
   * @param config 分割配置
   * @returns 识别到的二维码结果数组
   */
  static scanFromVideoFrame(
    videoElement: HTMLVideoElement,
    config: SplitConfig = { gridSize: 2, overlap: 0.2 }
  ): QRCodeResult[] {
    const { videoWidth: width, videoHeight: height } = videoElement;

    return MultiQRScanner.scan(videoElement, width, height, config);
  }
  
  /**
   * 从图像元素中识别多个二维码
   * @param imageElement 图像元素
   * @param config 分割配置
   * @returns 识别到的二维码结果数组
   */
  static scanFromImage(
    imageElement: HTMLImageElement,
    config: SplitConfig = { gridSize: 2, overlap: 0.2 }
  ): QRCodeResult[] {
    const { naturalWidth: width, naturalHeight: height } = imageElement;
    
    return MultiQRScanner.scan(imageElement, width, height, config);
  }
}

