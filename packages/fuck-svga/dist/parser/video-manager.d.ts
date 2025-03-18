export interface Bucket {
    origin: string;
    local: string;
    entity: Video | ArrayBuffer | null;
}
export interface NeedUpdatePoint {
    action: "remove" | "add";
    start: number;
    end: number;
}
export declare class VideoManager {
    private point;
    private maxRemain;
    private remainStart;
    private remainEnd;
    private buckets;
    private readonly parser;
    get length(): number;
    private updateRemainPoints;
    private getNeedUpdatePoints;
    private getBucket;
    prepare(urls: string[], point?: number, maxRemain?: number): Promise<void>;
    get(): Bucket;
    prev(): Promise<Bucket>;
    next(): Promise<Bucket>;
    go(pos: number): Promise<Bucket>;
    clear(): Promise<string[]>;
}
