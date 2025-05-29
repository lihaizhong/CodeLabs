import Reader from "../io/Reader";
import Layout from "./Layout";
import Transform from "./Transform";
import ShapeEntity from "./ShapeEntity";

/**
 * Properties of a FrameEntity.
 * @memberof com.opensource.svga
 * @interface IFrameEntity
 * @property {number|null} [alpha] FrameEntity alpha
 * @property {com.opensource.svga.ILayout|null} [layout] FrameEntity layout
 * @property {com.opensource.svga.ITransform|null} [transform] FrameEntity transform
 * @property {string|null} [clipPath] FrameEntity clipPath
 * @property {Array.<com.opensource.svga.IShapeEntity>|null} [shapes] FrameEntity shapes
 */
export interface FrameEntityProps {
  alpha: number | null;
  layout: Layout | null;
  transform: Transform | null;
  clipPath: string | null;
  shapes: ShapeEntity[] | null;
}

export default class FrameEntity {
  /**
   * Decodes a FrameEntity message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.FrameEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.FrameEntity} FrameEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): FrameEntity {
    reader = Reader.create(reader);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = new FrameEntity();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.alpha = reader.float();
          break;
        }
        case 2: {
          message.layout = Layout.decode(reader, reader.uint32());
          break;
        }
        case 3: {
          message.transform = Transform.decode(reader, reader.uint32());
          break;
        }
        case 4: {
          message.clipPath = reader.string();
          break;
        }
        case 5: {
          if (!(message.shapes && message.shapes.length)) {
            message.shapes = [];
          }
          message.shapes.push(ShapeEntity.decode(reader, reader.uint32()));
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
   * FrameEntity shapes.
   * @member {Array.<com.opensource.svga.IShapeEntity>} shapes
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  shapes: ShapeEntity[] = [];
  /**
   * FrameEntity alpha.
   * @member {number} alpha
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  alpha: number = 0;
  /**
   * FrameEntity layout.
   * @member {com.opensource.svga.ILayout|null|undefined} layout
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  layout: Layout | null = null;
  /**
   * FrameEntity transform.
   * @member {com.opensource.svga.ITransform|null|undefined} transform
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  transform: Transform | null = null;
  /**
   * FrameEntity clipPath.
   * @member {string} clipPath
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  clipPath: string = "";

  /**
   * Constructs a new FrameEntity.
   * @memberof com.opensource.svga
   * @classdesc Represents a FrameEntity.
   * @implements IFrameEntity
   * @constructor
   * @param {com.opensource.svga.IFrameEntity=} [properties] Properties to set
   */
  constructor(properties?: FrameEntityProps) {
    if (properties) {
      if (properties.alpha !== null) {
        this.alpha = properties.alpha;
      }

      if (properties.clipPath !== null) {
        this.clipPath = properties.clipPath;
      }

      if (properties.layout !== null) {
        this.layout = properties.layout;
      }

      if (properties.shapes !== null) {
        this.shapes = properties.shapes;
      }

      if (properties.transform !== null) {
        this.transform = properties.transform;
      }
    }
  }
}
