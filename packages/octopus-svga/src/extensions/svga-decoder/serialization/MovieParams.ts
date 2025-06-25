import Reader from "../io/Reader";

export default class MovieParams {
  /**
   * Decodes a MovieParams message from the specified reader.
   * @function decode
   * @memberof com.opensource.svga.MovieParams
   * @static
   * @param {$protobuf.Reader} reader Reader to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.MovieParams} MovieParams
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader, length?: number): PlatformVideo.VideoParams {
    const end = reader.end(length);
    const message = new MovieParams();
    let tag: number;

    while (reader.pos < end) {
      tag = reader.uint32();

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
}
