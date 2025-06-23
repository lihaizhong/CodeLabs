import Reader from "../io/Reader";

export default class EllipseArgs {
  /**
   * Decodes an EllipseArgs message from the specified reader.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @static
   * @param {$protobuf.Reader} reader Reader to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader, length?: number): PlatformVideo.EllipsePath {
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new EllipseArgs();
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
          message.radiusX = reader.float();
          break;
        }
        case 4: {
          message.radiusY = reader.float();
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
   * EllipseArgs x.
   * @member {number} x
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @instance
   */
  x: number = 0;
  /**
   * EllipseArgs y.
   * @member {number} y
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @instance
   */
  y: number = 0;
  /**
   * EllipseArgs radiusX.
   * @member {number} radiusX
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @instance
   */
  radiusX: number = 0;
  /**
   * EllipseArgs radiusY.
   * @member {number} radiusY
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @instance
   */
  radiusY: number = 0;
}
