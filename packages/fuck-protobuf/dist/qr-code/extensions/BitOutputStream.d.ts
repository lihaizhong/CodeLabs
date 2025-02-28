import { ByteArrayOutputStream } from "./ByteArrayOutputStream";
export declare class BitOutputStream {
    private readonly out;
    private bit;
    private bitlen;
    constructor(out: ByteArrayOutputStream);
    write(data: number, length: number): void;
    flush(): void;
}
