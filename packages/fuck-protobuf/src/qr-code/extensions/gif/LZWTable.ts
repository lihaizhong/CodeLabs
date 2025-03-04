// ---------------------------------------------------------------------
// LZWTable
// ---------------------------------------------------------------------

export class LZWTable {
  private map: Record<string, number> = {};

  private mapSize: number = 0;

  public get size(): number {
    return this.mapSize;
  }

  public add(key: string): void {
    if (this.contains(key)) {
      throw new Error(`dup key: ${key}`);
    }

    this.map[key] = this.mapSize;
    this.mapSize++;
  }

  public indexOf(key: string): number {
    return this.map[key] ?? -1;
  }

  public contains(key: string): boolean {
    return this.map[key] != undefined;
  }
}
