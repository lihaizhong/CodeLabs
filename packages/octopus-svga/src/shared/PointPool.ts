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

  public acquire(): CurrentPoint {
    const { pool } = this;

    return pool.length > 0
      ? pool.pop()!
      : { x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
  }

  public release(point: CurrentPoint): void {
    // 重置点的属性
    point.x = point.y = point.x1 = point.y1 = point.x2 = point.y2 = 0;
    this.pool.push(point);
  }
}
