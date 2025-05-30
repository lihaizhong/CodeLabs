import { ObjectPool } from "./ObjectPool";

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
export class PointPool extends ObjectPool<CurrentPoint> {
  constructor() {
    super(
      () => ({ x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0 }),
      (point: CurrentPoint) => {
        point.x = point.y = point.x1 = point.y1 = point.x2 = point.y2 = 0;
      }
    );
  }
}
