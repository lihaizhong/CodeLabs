import Reader from "./Reader";
export interface Decoder<T> {
    decode(reader: Reader): T;
}
export declare class DecoderFactory {
    static createDecoder<T>(blueprint: {
        create: () => T;
        fieldDecoders: {
            [tag: number]: (obj: T, reader: Reader) => void;
        };
    }): Decoder<T>;
}
