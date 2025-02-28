// ---------------------------------------------------------------------
// LZWTable
// ---------------------------------------------------------------------

export class LZWTable {
  private map: Map<string, number> = new Map();

  public get size(): number {
    return this.map.size;
  }

  public add(key: string): void {
    if (this.map.has(key)) {
      throw new Error(`dup key: ${key}`);
    }

    this.map.set(key, this.map.size);
  }

  public indexOf(key: string): number {
    return this.map.get(key) ?? -1;
  }

  public contains(key: string): boolean {
    return this.map.has(key);
  }
}
