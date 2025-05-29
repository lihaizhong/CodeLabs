import Reader from "../io/Reader";

/**
 * Properties of a ShapeArgs.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IShapeArgs
 * @property {string|null} [d] ShapeArgs d
 */
export interface ShapeArgsProps {
  d: string | null;
}

export default class ShapeArgs {
  /**
   * Decodes a ShapeArgs message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): ShapeArgs {
    reader = Reader.create(reader);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = new ShapeArgs();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.d = reader.string();
          break;
        }
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  }

  d: string = "";

  /**
   * Constructs a new ShapeArgs.
   * @memberof com.opensource.svga.ShapeEntity
   * @classdesc Represents a ShapeArgs.
   * @implements IShapeArgs
   * @constructor
   * @param {com.opensource.svga.ShapeEntity.IShapeArgs=} [properties] Properties to set
   */
  constructor(properties?: ShapeArgsProps) {
    if (properties) {
      if (properties.d !== null) {
        this.d = properties.d
      }
    }
  }
}
