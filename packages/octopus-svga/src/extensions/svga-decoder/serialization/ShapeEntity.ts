import Reader from "../io/Reader";
import Transform from "./Transform";
import ShapeArgs from "./ShapeArgs";
import RectArgs from "./RectArgs";
import EllipseArgs from "./EllipseArgs";
import ShapeStyle from "./ShapeStyle";

export default class ShapeEntity {
  /**
   * Decodes a ShapeEntity message from the specified reader.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity
   * @static
   * @param {$protobuf.Reader} reader Reader to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader, length?: number): PlatformVideo.VideoFrameShape | null {
    const end = reader.end(length);
    const message = new ShapeEntity();
    let tag: number;

    while (reader.pos < end) {
      tag = reader.uint32();
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

    return ShapeEntity.format(message);
  }

  static format(message: ShapeEntity): PlatformVideo.VideoFrameShape | null {
    const { type, shape, rect, ellipse, styles, transform } = message;

    switch (type) {
      case PlatformVideo.SHAPE_TYPE_CODE.SHAPE:
        return {
          type: PlatformVideo.SHAPE_TYPE.SHAPE,
          path: shape!,
          styles: styles!,
          transform: transform!,
        };
      case PlatformVideo.SHAPE_TYPE_CODE.RECT:
        return {
          type: PlatformVideo.SHAPE_TYPE.RECT,
          path: rect!,
          styles: styles!,
          transform: transform!,
        };
      case PlatformVideo.SHAPE_TYPE_CODE.ELLIPSE:
        return {
          type: PlatformVideo.SHAPE_TYPE.ELLIPSE,
          path: ellipse!,
          styles: styles!,
          transform: transform!,
        };
      default:
    }

    return null;
  }

  /**
   * ShapeEntity type.
   * @member {com.opensource.svga.ShapeEntity.ShapeType} type
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  type: PlatformVideo.SHAPE_TYPE_CODE = 0;
  /**
   * ShapeEntity shape.
   * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  shape: PlatformVideo.ShapePath | null = null;
  /**
   * ShapeEntity rect.
   * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  rect: PlatformVideo.RectPath | null = null;
  /**
   * ShapeEntity ellipse.
   * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  ellipse: PlatformVideo.EllipsePath | null = null;
  /**
   * ShapeEntity styles.
   * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  styles: PlatformVideo.VideoStyles | null = null;
  /**
   * ShapeEntity transform.
   * @member {com.opensource.svga.ITransform|null|undefined} transform
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  transform: PlatformVideo.Transform | null = null;
}
