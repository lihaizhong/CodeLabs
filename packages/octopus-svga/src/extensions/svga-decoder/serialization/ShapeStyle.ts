import Reader from "../io/Reader";
import RGBAColor from "./RGBAColor";

export default class ShapeStyle {
  /**
   * Decodes a ShapeStyle message from the specified reader.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @static
   * @param {$protobuf.Reader} reader Reader to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader, length?: number): PlatformVideo.VideoStyles {
    const { preflight } = reader;
    const end = reader.end(length);
    const hash = preflight.calculate(reader, end);

    if (preflight.has(hash)) {
      reader.pos = end;
      return preflight.get(hash);
    }

    const message = new ShapeStyle();
    let tag: number;

    while (reader.pos < end) {
      tag = reader.uint32();

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

    preflight.set(hash, ShapeStyle.format(message));

    return preflight.get(hash);
  }

  static format(message: ShapeStyle): PlatformVideo.VideoStyles {
    const { fill, stroke, strokeWidth, miterLimit, lineDashI, lineDashII, lineDashIII } = message;
    const lineDash: number[] = [];
    let lineCap: CanvasLineCap;
    let lineJoin: CanvasLineJoin;

    if (lineDashI > 0) {
      lineDash.push(lineDashI);
    }

    if (lineDashII > 0) {
      if (lineDash.length < 1) {
        lineDash.push(0);
      }

      lineDash.push(lineDashII);
    }

    if (lineDashIII > 0) {
      if (lineDash.length < 2) {
        lineDash.push(0, 0);
      }

      lineDash.push(lineDashIII);
    }

    switch (message.lineCap) {
      case PlatformVideo.LINE_CAP_CODE.BUTT:
        lineCap = PlatformVideo.LINE_CAP.BUTT;
        break;
      case PlatformVideo.LINE_CAP_CODE.ROUND:
        lineCap = PlatformVideo.LINE_CAP.ROUND;
        break;
      case PlatformVideo.LINE_CAP_CODE.SQUARE:
        lineCap = PlatformVideo.LINE_CAP.SQUARE;
        break;
    }

    switch (message.lineJoin) {
      case PlatformVideo.LINE_JOIN_CODE.MITER:
        lineJoin = PlatformVideo.LINE_JOIN.MITER;
        break;
      case PlatformVideo.LINE_JOIN_CODE.ROUND:
        lineJoin = PlatformVideo.LINE_JOIN.ROUND;
        break;
      case PlatformVideo.LINE_JOIN_CODE.BEVEL:
        lineJoin = PlatformVideo.LINE_JOIN.BEVEL;
        break;
    }

    return {
      lineDash,
      fill: fill ? fill : null,
      stroke: stroke ? stroke : null,
      lineCap,
      lineJoin,
      strokeWidth,
      miterLimit
    }
  }

  /**
   * ShapeStyle fill.
   * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} fill
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  fill: PlatformVideo.RGBA<number, number, number, number> | null = null;
  /**
   * ShapeStyle stroke.
   * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} stroke
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  stroke: PlatformVideo.RGBA<number, number, number, number> | null = null;
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
  lineCap: PlatformVideo.LINE_CAP_CODE = 0;
  /**
   * ShapeStyle lineJoin.
   * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin} lineJoin
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  lineJoin: PlatformVideo.LINE_JOIN_CODE = 0;
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
}
