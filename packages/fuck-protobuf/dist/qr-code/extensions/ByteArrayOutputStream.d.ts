export declare class ByteArrayOutputStream {
    private bytes;
    writeByte(byte: number): void;
    writeBytes(bytes: number[], offset?: number, length?: number): void;
    writeShort(i: number): void;
    writeString(str: string): void;
    toByteArray(): number[];
    toString(): string;
}
