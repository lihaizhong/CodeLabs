import Reader from "../io/Reader";

export default class Transform {
  /**
   * Decodes a Transform message from the specified reader.
   * @function decode
   * @memberof com.opensource.svga.Transform
   * @static
   * @param {$protobuf.Reader} reader Reader to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.Transform} Transform
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader, length?: number): PlatformVideo.Transform {
    const end = reader.end(length);
    const message = new Transform();
    let tag: number;

    while (reader.pos < end) {
      tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.a = reader.float();
          break;
        }
        case 2: {
          message.b = reader.float();
          break;
        }
        case 3: {
          message.c = reader.float();
          break;
        }
        case 4: {
          message.d = reader.float();
          break;
        }
        case 5: {
          message.tx = reader.float();
          break;
        }
        case 6: {
          message.ty = reader.float();
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
   * Transform a.
   * @member {number} a
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  a: number = 0;
  /**
   * Transform b.
   * @member {number} b
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  b: number = 0;
  /**
   * Transform c.
   * @member {number} c
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  c: number = 0;
  /**
   * Transform d.
   * @member {number} d
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  d: number = 0;
  /**
   * Transform tx.
   * @member {number} tx
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  tx: number = 0;
  /**
   * Transform ty.
   * @member {number} ty
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  ty: number = 0;
}
