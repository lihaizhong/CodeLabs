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
export class PointPool {
  private pool: CurrentPoint[] = [];
  private static instance: PointPool;

  static getInstance(): PointPool {
    if (!PointPool.instance) {
      PointPool.instance = new PointPool();
    }
    return PointPool.instance;
  }

  public acquire(): CurrentPoint {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return { x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
  }

  public release(point: CurrentPoint): void {
    // 重置点的属性
    point.x = 0;
    point.y = 0;
    point.x1 = 0;
    point.y1 = 0;
    point.x2 = 0;
    point.y2 = 0;
    this.pool.push(point);
  }
}
