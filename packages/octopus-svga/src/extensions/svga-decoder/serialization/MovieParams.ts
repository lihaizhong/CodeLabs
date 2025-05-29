import Reader from "../io/Reader";

/**
 * Properties of a MovieParams.
 * @memberof com.opensource.svga
 * @interface IMovieParams
 * @property {number|null} [viewBoxWidth] MovieParams viewBoxWidth
 * @property {number|null} [viewBoxHeight] MovieParams viewBoxHeight
 * @property {number|null} [fps] MovieParams fps
 * @property {number|null} [frames] MovieParams frames
 */
export interface MovieParamsProps {
  viewBoxWidth: number | null;
  viewBoxHeight: number | null;
  fps: number | null;
  frames: number | null;
}

export default class MovieParams {
  /**
   * Decodes a MovieParams message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.MovieParams
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.MovieParams} MovieParams
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): MovieParams {
    reader = Reader.create(reader);
    let end = length === void 0 ? reader.len : reader.pos + length;
    let message = new MovieParams();
    while (reader.pos < end) {
      let tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.viewBoxWidth = reader.float();
          break;
        }
        case 2: {
          message.viewBoxHeight = reader.float();
          break;
        }
        case 3: {
          message.fps = reader.int32();
          break;
        }
        case 4: {
          message.frames = reader.int32();
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
   * MovieParams viewBoxWidth.
   * @member {number} viewBoxWidth
   * @memberof com.opensource.svga.MovieParams
   * @instance
   */
  viewBoxWidth: number = 0;
  /**
   * MovieParams viewBoxHeight.
   * @member {number} viewBoxHeight
   * @memberof com.opensource.svga.MovieParams
   * @instance
   */
  viewBoxHeight: number = 0;
  /**
   * MovieParams fps.
   * @member {number} fps
   * @memberof com.opensource.svga.MovieParams
   * @instance
   */
  fps: number = 0;
  /**
   * MovieParams frames.
   * @member {number} frames
   * @memberof com.opensource.svga.MovieParams
   * @instance
   */
  frames: number = 0;
  /**
   * Constructs a new MovieParams.
   * @memberof com.opensource.svga
   * @classdesc Represents a MovieParams.
   * @implements IMovieParams
   * @constructor
   * @param {com.opensource.svga.IMovieParams=} [properties] Properties to set
   */
  constructor(properties?: MovieParamsProps) {
    if (properties) {
      if (properties.viewBoxWidth !== null) {
        this.viewBoxWidth = properties.viewBoxWidth;
      }

      if (properties.viewBoxHeight !== null) {
        this.viewBoxHeight = properties.viewBoxHeight;
      }

      if (properties.fps !== null) {
        this.fps = properties.fps;
      }

      if (properties.frames !== null) {
        this.frames = properties.frames;
      }
    }
  }
}
