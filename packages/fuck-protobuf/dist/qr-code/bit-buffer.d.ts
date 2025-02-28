export declare class BitBuffer {
    buffer: number[];
    lengthInBits: number;
    getAt(index: number): boolean;
    put(num: number, length: number): void;
    putBit(bit: boolean): void;
}
