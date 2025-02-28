export declare class Base64EncodeOutputStream {
    private buffer;
    private buflen;
    private length;
    private base64;
    private encode;
    private writeEncoded;
    writeByte(n: number): void;
    flush(): void;
    toString(): string;
}
