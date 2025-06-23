import Reader from "../io/Reader";
import Layout from "./Layout";
import Transform from "./Transform";
import ShapeEntity from "./ShapeEntity";

export default class FrameEntity {
  private static HIDDEN_FRAME: PlatformVideo.HiddenVideoFrame = {
    alpha: 0,
  };

  /**
   * Decodes a FrameEntity message from the specified reader.
   * @function decode
   * @memberof com.opensource.svga.FrameEntity
   * @static
   * @param {$protobuf.Reader} reader Reader to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.FrameEntity} FrameEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader, length?: number): PlatformVideo.VideoFrame | PlatformVideo.HiddenVideoFrame {
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new FrameEntity();
    let tag: number;

    while (reader.pos < end) {
      tag = reader.uint32();
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
          if (!Array.isArray(message.shapes)) {
            message.shapes = [];
          }

          const shape = ShapeEntity.decode(reader, reader.uint32())

          if (shape !== null) {
            message.shapes.push(shape);
          }
          break;
        }
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return FrameEntity.format(message);
  }

  private static format(message: FrameEntity): PlatformVideo.VideoFrame | PlatformVideo.HiddenVideoFrame {
    // alpha值小于 0.05 将不展示，所以不做解析处理
    if (message.alpha < 0.05) {
      return FrameEntity.HIDDEN_FRAME;
    }

    const { alpha, layout, transform, shapes } = message;

    return {
      alpha,
      layout: layout!,
      transform,
      shapes,
    };
  }

  /**
   * FrameEntity shapes.
   * @member {Array.<com.opensource.svga.IShapeEntity>} shapes
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  shapes: PlatformVideo.VideoFrameShape[] = [];
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
  layout: PlatformVideo.Rect | null = null;
  /**
   * FrameEntity transform.
   * @member {com.opensource.svga.ITransform|null|undefined} transform
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  transform: PlatformVideo.Transform | null = null;
  /**
   * FrameEntity clipPath.
   * @member {string} clipPath
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  clipPath: string = "";
}
