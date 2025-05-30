import { BitBuffer } from "./bit-buffer";
export declare class BitByte {
    private readonly bytes;
    constructor(data: string);
    get mode(): number;
    get length(): number;
    write(buff: BitBuffer): void;
}
