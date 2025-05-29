import Reader from "../io/Reader";
import Transform from "./Transform";
import ShapeType from "./ShapeType";
import ShapeArgs from "./ShapeArgs";
import RectArgs from "./RectArgs";
import EllipseArgs from "./EllipseArgs";
import ShapeStyle from "./ShapeStyle";

/**
 * Properties of a ShapeEntity.
 * @memberof com.opensource.svga
 * @interface IShapeEntity
 * @property {com.opensource.svga.ShapeEntity.ShapeType|null} [type] ShapeEntity type
 * @property {com.opensource.svga.ShapeEntity.IShapeArgs|null} [shape] ShapeEntity shape
 * @property {com.opensource.svga.ShapeEntity.IRectArgs|null} [rect] ShapeEntity rect
 * @property {com.opensource.svga.ShapeEntity.IEllipseArgs|null} [ellipse] ShapeEntity ellipse
 * @property {com.opensource.svga.ShapeEntity.IShapeStyle|null} [styles] ShapeEntity styles
 * @property {com.opensource.svga.ITransform|null} [transform] ShapeEntity transform
 */
export interface ShapeEntityProps {
  type: ShapeType | null;
  shape: ShapeArgs | null;
  rect: RectArgs | null;
  ellipse: EllipseArgs | null;
  styles: ShapeStyle | null;
  transform: Transform | null;
}

export default class ShapeEntity {
  /**
   * Decodes a ShapeEntity message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): ShapeEntity {
    reader = Reader.create(reader);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = new ShapeEntity();
    while (reader.pos < end) {
      let tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.type = reader.int32();
          break;
        }
        case 2: {
          message.shape = ShapeArgs.decode(reader, reader.uint32());
          break;
        }
        case 3: {
          message.rect = RectArgs.decode(reader, reader.uint32());
          break;
        }
        case 4: {
          message.ellipse = EllipseArgs.decode(
            reader,
            reader.uint32()
          );
          break;
        }
        case 10: {
          message.styles = ShapeStyle.decode(
            reader,
            reader.uint32()
          );
          break;
        }
        case 11: {
          message.transform = Transform.decode(reader, reader.uint32());
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
   * ShapeEntity type.
   * @member {com.opensource.svga.ShapeEntity.ShapeType} type
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  type: ShapeType = 0;
  /**
   * ShapeEntity shape.
   * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  shape: ShapeArgs | null = null;
  /**
   * ShapeEntity rect.
   * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  rect: RectArgs | null = null;
  /**
   * ShapeEntity ellipse.
   * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  ellipse: EllipseArgs | null = null;
  /**
   * ShapeEntity styles.
   * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  styles: ShapeStyle | null = null;
  /**
   * ShapeEntity transform.
   * @member {com.opensource.svga.ITransform|null|undefined} transform
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  transform: Transform | null = null;

  private $oneOfFields: ["shape", "rect", "ellipse"] = [
    "shape",
    "rect",
    "ellipse",
  ];

  private $fieldMap: Record<string, number> = {};

  get args() {
    const keys = Object.keys(this) as ["shape", "rect", "ellipse"];
    for (let i = keys.length - 1; i > -1; --i) {
      const key = keys[i];
      const value = this[key];
      if (this.$fieldMap[key] === 1 && value !== null) {
        return key;
      }
    }

    return "" as "shape" | "rect" | "ellipse";
  }

  set args(name: "shape" | "rect" | "ellipse") {
    for (var i = 0; i < this.$oneOfFields.length; ++i) {
      const key = this.$oneOfFields[i];
      if (key !== name) {
        delete this[key];
      }
    }
  }

  /**
   * Constructs a new ShapeEntity.
   * @memberof com.opensource.svga
   * @classdesc Represents a ShapeEntity.
   * @implements IShapeEntity
   * @constructor
   * @param {com.opensource.svga.IShapeEntity=} [properties] Properties to set
   */
  constructor(properties?: ShapeEntityProps) {
    if (properties) {
      if (properties.type !== null) {
        this.type = properties.type;
      }

      if (properties.ellipse !== null) {
        this.ellipse = properties.ellipse;
      }

      if (properties.rect !== null) {
        this.rect = properties.rect;
      }

      if (properties.shape !== null) {
        this.shape = properties.shape;
      }

      if (properties.styles !== null) {
        this.styles = properties.styles;
      }

      if (properties.transform !== null) {
        this.transform = properties.transform;
      }
    }

    for (var i = 0; i < this.$oneOfFields.length; ++i) {
      this.$fieldMap[this.$oneOfFields[i]] = 1;
    }
  }
}
