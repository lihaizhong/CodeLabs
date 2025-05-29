import Reader from "./Reader";
/**
 * 对于固定结构的protobuf消息，可以预计算字段的位置，避免每次都需要解析tag
 */
export declare class OptimizedReader extends Reader {
    private static fieldPositionCache;
    cacheFieldPositions(messageId: string): Map<number, number[]>;
    jumpToField(messageId: string, fieldNumber: number, occurrence?: number): boolean;
}
