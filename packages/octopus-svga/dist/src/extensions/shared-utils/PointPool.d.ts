export interface CurrentPoint {
    x: number;
    y: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
/**
 * CurrentPoint对象池，用于减少对象创建和GC压力
 */
export declare class PointPool {
    private pool;
    acquire(): CurrentPoint;
    release(point: CurrentPoint): void;
}
