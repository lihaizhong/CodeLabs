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
    private static instance;
    static getInstance(): PointPool;
    acquire(): CurrentPoint;
    release(point: CurrentPoint): void;
}
