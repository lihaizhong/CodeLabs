import Reader from "../io/Reader";

export default class Layout {
  /**
   * Decodes a Layout message from the specified reader.
   * @function decode
   * @memberof com.opensource.svga.Layout
   * @static
   * @param {$protobuf.Reader} reader Reader to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.Layout} Layout
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader, length?: number): PlatformVideo.Rect {
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new Layout();
    let tag: number;

    while (reader.pos < end) {
      tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.x = reader.float();
          break;
        }
        case 2: {
          message.y = reader.float();
          break;
        }
        case 3: {
          message.width = reader.float();
          break;
        }
        case 4: {
          message.height = reader.float();
          break;
        }
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return Layout.format(message);
  }

  static format(message: Layout): PlatformVideo.Rect {
    const { x = 0, y = 0, width = 0, height = 0 } = message;

    return { x, y, width, height };
  }

  /**
   * Layout x.
   * @member {number} x
   * @memberof com.opensource.svga.Layout
   * @instance
   */
  x: number = 0;
  /**
   * Layout y.
   * @member {number} y
   * @memberof com.opensource.svga.Layout
   * @instance
   */
  y: number = 0;
  /**
   * Layout width.
   * @member {number} width
   * @memberof com.opensource.svga.Layout
   * @instance
   */
  width: number = 0;
  /**
   * Layout height.
   * @member {number} height
   * @memberof com.opensource.svga.Layout
   * @instance
   */
  height: number = 0;
}
