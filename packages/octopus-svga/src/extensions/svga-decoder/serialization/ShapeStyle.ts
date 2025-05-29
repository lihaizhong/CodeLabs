import Reader from "../io/Reader";
import LineCap from "./LineCap";
import LineJoin from "./LineJoin";
import RGBAColor from "./RGBAColor";

/**
 * Properties of a ShapeStyle.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IShapeStyle
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null} [fill] ShapeStyle fill
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null} [stroke] ShapeStyle stroke
 * @property {number|null} [strokeWidth] ShapeStyle strokeWidth
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap|null} [lineCap] ShapeStyle lineCap
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin|null} [lineJoin] ShapeStyle lineJoin
 * @property {number|null} [miterLimit] ShapeStyle miterLimit
 * @property {number|null} [lineDashI] ShapeStyle lineDashI
 * @property {number|null} [lineDashII] ShapeStyle lineDashII
 * @property {number|null} [lineDashIII] ShapeStyle lineDashIII
 */
export interface ShapeStyleProps {
  fill: RGBAColor | null;
  stroke: RGBAColor | null;
  strokeWidth: number | null;
  lineCap: LineCap | null;
  lineJoin: LineJoin | null;
  miterLimit: number | null;
  lineDashI: number | null;
  lineDashII: number | null;
  lineDashIII: number | null;
}

export default class ShapeStyle {
  /**
   * Decodes a ShapeStyle message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): ShapeStyle {
    reader = Reader.create(reader);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = new ShapeStyle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.fill = RGBAColor.decode(
            reader,
            reader.uint32()
          );
          break;
        }
        case 2: {
          message.stroke = RGBAColor.decode(
            reader,
            reader.uint32()
          );
          break;
        }
        case 3: {
          message.strokeWidth = reader.float();
          break;
        }
        case 4: {
          message.lineCap = reader.int32();
          break;
        }
        case 5: {
          message.lineJoin = reader.int32();
          break;
        }
        case 6: {
          message.miterLimit = reader.float();
          break;
        }
        case 7: {
          message.lineDashI = reader.float();
          break;
        }
        case 8: {
          message.lineDashII = reader.float();
          break;
        }
        case 9: {
          message.lineDashIII = reader.float();
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
   * ShapeStyle fill.
   * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} fill
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  fill: RGBAColor | null = null;
  /**
   * ShapeStyle stroke.
   * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} stroke
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  stroke: RGBAColor | null = null;
  /**
   * ShapeStyle strokeWidth.
   * @member {number} strokeWidth
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  strokeWidth: number = 0;
  /**
   * ShapeStyle lineCap.
   * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap} lineCap
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  lineCap: LineCap = 0;
  /**
   * ShapeStyle lineJoin.
   * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin} lineJoin
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  lineJoin: LineJoin = 0;
  /**
   * ShapeStyle miterLimit.
   * @member {number} miterLimit
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  miterLimit: number = 0;
  /**
   * ShapeStyle lineDashI.
   * @member {number} lineDashI
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  lineDashI: number = 0;
  /**
   * ShapeStyle lineDashII.
   * @member {number} lineDashII
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  lineDashII: number = 0;
  /**
   * ShapeStyle lineDashIII.
   * @member {number} lineDashIII
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  lineDashIII: number = 0;

  /**
   * Constructs a new ShapeStyle.
   * @memberof com.opensource.svga.ShapeEntity
   * @classdesc Represents a ShapeStyle.
   * @implements IShapeStyle
   * @constructor
   * @param {com.opensource.svga.ShapeEntity.IShapeStyle=} [properties] Properties to set
   */
  constructor(properties?: ShapeStyleProps) {
    if (properties) {
      if (properties.fill !== null) {
        this.fill = properties.fill
      }

      if (properties.lineCap !== null) {
        this.lineCap = properties.lineCap
      }

      if (properties.lineDashI !== null) {
        this.lineDashI = properties.lineDashI
      }

      if (properties.lineDashII !== null) {
        this.lineDashII = properties.lineDashII
      }

      if (properties.lineDashIII !== null) {
        this.lineDashIII = properties.lineDashIII
      }

      if (properties.lineJoin !== null) {
        this.lineJoin = properties.lineJoin
      }

      if (properties.miterLimit !== null) {
        this.miterLimit = properties.miterLimit
      }

      if (properties.stroke !== null) {
        this.stroke = properties.stroke
      }

      if (properties.strokeWidth !== null) {
        this.strokeWidth = properties.strokeWidth
      }
    }
  }
}
