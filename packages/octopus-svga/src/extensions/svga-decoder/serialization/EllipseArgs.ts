import Reader from "../io/Reader";

/**
 * Properties of an EllipseArgs.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IEllipseArgs
 * @property {number|null} [x] EllipseArgs x
 * @property {number|null} [y] EllipseArgs y
 * @property {number|null} [radiusX] EllipseArgs radiusX
 * @property {number|null} [radiusY] EllipseArgs radiusY
 */
export interface EllipseArgsProps {
  x: number | null;
  y: number | null;
  radiusX: number | null;
  radiusY: number | null;
}

export default class EllipseArgs {
  /**
   * Decodes an EllipseArgs message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): EllipseArgs {
    reader = Reader.create(reader);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = new EllipseArgs();
    while (reader.pos < end) {
      const tag = reader.uint32();
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

  /**
   * Constructs a new EllipseArgs.
   * @memberof com.opensource.svga.ShapeEntity
   * @classdesc Represents an EllipseArgs.
   * @implements IEllipseArgs
   * @constructor
   * @param {com.opensource.svga.ShapeEntity.IEllipseArgs=} [properties] Properties to set
   */
  constructor(properties?: EllipseArgsProps) {
    if (properties) {
      if (properties.x !== null) {
        this.x = properties.x;
      }

      if (properties.y !== null) {
        this.y = properties.y;
      }

      if (properties.radiusX !== null) {
        this.radiusX = properties.radiusX;
      }

      if (properties.radiusY !== null) {
        this.radiusY = properties.radiusY;
      }
    }
  }
}
