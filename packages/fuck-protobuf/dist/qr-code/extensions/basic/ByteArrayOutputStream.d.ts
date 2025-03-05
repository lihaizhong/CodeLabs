export declare class ByteArrayOutputStream {
    private bytes;
    writeByte(byte: number): void;
    writeBytes(bytes: Uint8Array | number[], offset?: number, length?: number): void;
    writeShort(i: number): void;
    writeString(s: string): void;
    toByteArray(): number[];
    toString(): string;
}
