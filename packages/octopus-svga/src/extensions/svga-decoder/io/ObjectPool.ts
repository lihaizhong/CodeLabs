export class ObjectPool<T> {
  private readonly pool: T[] = [];

  constructor(
    private readonly factory: () => T,
    private readonly reset: (obj: T) => void,
    private readonly maxSize: number = 20
  ) {}

  acquire(): T {
    return this.pool.length > 0 ? this.pool.pop()! : this.factory();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }
}
