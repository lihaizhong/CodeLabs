export declare class LZWTable {
    private map;
    private mapSize;
    get size(): number;
    add(key: string): void;
    indexOf(key: string): number;
    contains(key: string): boolean;
}
