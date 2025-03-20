export declare class Base64DecodeInputStream {
    private readonly data;
    private pos;
    private buffer;
    private buflen;
    constructor(data: string);
    private decode;
    read(): number;
}
