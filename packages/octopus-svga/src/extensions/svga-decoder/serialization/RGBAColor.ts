import Reader from "../io/Reader";

/**
 * Properties of a RGBAColor.
 * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
 * @interface IRGBAColor
 * @property {number|null} [r] RGBAColor r
 * @property {number|null} [g] RGBAColor g
 * @property {number|null} [b] RGBAColor b
 * @property {number|null} [a] RGBAColor a
 */
export interface RGBAColorProps {
  r: number | null;
  g: number | null;
  b: number | null;
  a: number | null;
}

export default class RGBAColor {
  /**
   * Decodes a RGBAColor message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): RGBAColor {
    reader = Reader.create(reader);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = new RGBAColor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.r = reader.float();
          break;
        }
        case 2: {
          message.g = reader.float();
          break;
        }
        case 3: {
          message.b = reader.float();
          break;
        }
        case 4: {
          message.a = reader.float();
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
   * RGBAColor r.
   * @member {number} r
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @instance
   */
  r: number = 0;
  /**
   * RGBAColor g.
   * @member {number} g
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @instance
   */
  g: number = 0;
  /**
   * RGBAColor b.
   * @member {number} b
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @instance
   */
  b: number = 0;
  /**
   * RGBAColor a.
   * @member {number} a
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @instance
   */
  a: number = 0;

  /**
   * Constructs a new RGBAColor.
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @classdesc Represents a RGBAColor.
   * @implements IRGBAColor
   * @constructor
   * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor=} [properties] Properties to set
   */
  constructor(properties?: RGBAColorProps) {
    if (properties) {
      if (properties.r !== null) {
        this.r = properties.r
      }

      if (properties.g !== null) {
        this.g = properties.g
      }

      if (properties.b !== null) {
        this.b = properties.b
      }

      if (properties.a !== null) {
        this.a = properties.a
      }
    }
  }
}
