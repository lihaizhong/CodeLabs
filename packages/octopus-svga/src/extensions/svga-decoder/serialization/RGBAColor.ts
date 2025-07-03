import Reader from "../io/Reader";
import { PlatformVideo } from "../../../types/video";

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
   * Decodes a RGBAColor message from the specified reader.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @static
   * @param {$protobuf.Reader} reader Reader to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader, length?: number): PlatformVideo.RGBA<number, number, number, number> {
    const { preflight } = reader;
    const end = reader.end(length);
    const hash = preflight.calculate(reader, end);

    if (preflight.has(hash)) {
      reader.pos = end;
      return preflight.get(hash);
    }

    const message = new RGBAColor();
    let tag: number;

    while (reader.pos < end) {
      tag = reader.uint32();

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

    preflight.set(hash, RGBAColor.format(message));

    return preflight.get(hash);
  }

  static format(
    message: RGBAColor
  ): PlatformVideo.RGBA<number, number, number, number> {
    const { r, g, b, a } = message;

    return `rgba(${(r * 255) | 0}, ${(g * 255) | 0}, ${(b * 255) | 0}, ${
      (a * 1) | 0
    })`;
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
}
