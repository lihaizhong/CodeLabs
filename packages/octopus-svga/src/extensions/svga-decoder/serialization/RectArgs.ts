import Reader from "../io/Reader";

/**
 * Properties of a RectArgs.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IRectArgs
 * @property {number|null} [x] RectArgs x
 * @property {number|null} [y] RectArgs y
 * @property {number|null} [width] RectArgs width
 * @property {number|null} [height] RectArgs height
 * @property {number|null} [cornerRadius] RectArgs cornerRadius
 */
export interface RectArgsProps {
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  cornerRadius: number | null;
}

export default class RectArgs {
  /**
   * Decodes a RectArgs message from the specified reader.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @static
   * @param {$protobuf.Reader} reader Reader to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader, length?: number): PlatformVideo.RectPath {
    const end = reader.end(length);
    const message = new RectArgs();
    let tag: number;

    while (reader.pos < end) {
      tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.x = reader.float();
          break;
        }
        case 2: {
          message.y = reader.float();
          break;
        }
        case 3: {
          message.width = reader.float();
          break;
        }
        case 4: {
          message.height = reader.float();
          break;
        }
        case 5: {
          message.cornerRadius = reader.float();
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
   * RectArgs x.
   * @member {number} x
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @instance
   */
  x: number = 0;
  /**
   * RectArgs y.
   * @member {number} y
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @instance
   */
  y: number = 0;
  /**
   * RectArgs width.
   * @member {number} width
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @instance
   */
  width: number = 0;
  /**
   * RectArgs height.
   * @member {number} height
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @instance
   */
  height: number = 0;
  /**
   * RectArgs cornerRadius.
   * @member {number} cornerRadius
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @instance
   */
  cornerRadius: number = 0;
}
