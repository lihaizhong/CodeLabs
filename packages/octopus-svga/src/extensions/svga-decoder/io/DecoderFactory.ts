import Reader from "./Reader";

// 基础解码器接口
export interface Decoder<T> {
  decode(reader: Reader): T;
}

// 通用解码器工厂
export class DecoderFactory {
  static createDecoder<T>(blueprint: {
    create: () => T;
    fieldDecoders: { [tag: number]: (obj: T, reader: Reader) => void };
  }): Decoder<T> {
    return {
      decode(reader: Reader): T {
        const obj = blueprint.create();
        const end = reader.uint32() + reader.pos;

        while (reader.pos < end) {
          const tag = reader.uint32();
          const fieldDecoder = blueprint.fieldDecoders[tag >> 3];

          if (fieldDecoder) {
            fieldDecoder(obj, reader);
          } else {
            reader.skipType(tag & 7);
          }
        }

        return obj;
      },
    };
  }
}
