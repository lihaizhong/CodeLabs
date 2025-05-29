import Reader from "./Reader";

/**
 * 对于固定结构的protobuf消息，可以预计算字段的位置，避免每次都需要解析tag
 */
export class OptimizedReader extends Reader {
  // 预计算的字段位置缓存
  private static fieldPositionCache = new Map<string, Map<number, number[]>>();
  
  // 缓存消息的字段位置
  cacheFieldPositions(messageId: string): Map<number, number[]> {
    if (OptimizedReader.fieldPositionCache.has(messageId)) {
      return OptimizedReader.fieldPositionCache.get(messageId)!;
    }
    
    const startPos = this.pos;
    const endPos = this.uint32() + this.pos;
    const fieldPositions = new Map<number, number[]>();
    
    while (this.pos < endPos) {
      const tagPos = this.pos;
      const tag = this.uint32();
      const fieldNumber = tag >> 3;
      
      // 记录字段位置
      if (!fieldPositions.has(fieldNumber)) {
        fieldPositions.set(fieldNumber, []);
      }
      fieldPositions.get(fieldNumber)!.push(tagPos);
      
      // 跳过字段值
      this.skipType(tag & 7);
    }
    
    // 重置位置
    this.pos = startPos;
    
    // 缓存结果
    OptimizedReader.fieldPositionCache.set(messageId, fieldPositions);
    return fieldPositions;
  }
  
  // 直接跳到指定字段
  jumpToField(messageId: string, fieldNumber: number, occurrence: number = 0): boolean {
    const positions = this.cacheFieldPositions(messageId);
    
    if (positions.has(fieldNumber) && positions.get(fieldNumber)!.length > occurrence) {
      this.pos = positions.get(fieldNumber)![occurrence];
      return true;
    }
    
    return false;
  }
}