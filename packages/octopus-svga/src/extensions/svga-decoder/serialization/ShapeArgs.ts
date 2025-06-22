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
  static decode(reader: Reader | Uint8Array, length?: number): PlatformVideo.ShapePath {
    reader = Reader.create(reader);

    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new ShapeArgs();
    let tag: number;

    while (reader.pos < end) {
      tag = reader.uint32();
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

  /**
   * ShapeArgs d.
   * @member {string} d
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @instance
   */
  d: string = "";
}
