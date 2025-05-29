import Reader from "../io/Reader";

/**
 * Properties of a Transform.
 * @memberof com.opensource.svga
 * @interface ITransform
 * @property {number|null} [a] Transform a
 * @property {number|null} [b] Transform b
 * @property {number|null} [c] Transform c
 * @property {number|null} [d] Transform d
 * @property {number|null} [tx] Transform tx
 * @property {number|null} [ty] Transform ty
 */
export interface TransformProps {
  a: number | null;
  b: number | null;
  c: number | null;
  d: number | null;
  tx: number | null;
  ty: number | null;
}

export default class Transform {
  /**
   * Decodes a Transform message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.Transform
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.Transform} Transform
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): Transform {
    reader = Reader.create(reader);
    let end = length === void 0 ? reader.len : reader.pos + length;
    let message = new Transform();
    while (reader.pos < end) {
      let tag = reader.uint32();
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

  /**
   * Constructs a new Transform.
   * @memberof com.opensource.svga
   * @classdesc Represents a Transform.
   * @implements ITransform
   * @constructor
   * @param {com.opensource.svga.ITransform=} [properties] Properties to set
   */
  constructor(properties?: TransformProps) {
    if (properties) {
      if (properties.a !== null) {
        this.a = properties.a;
      }

      if (properties.b !== null) {
        this.b = properties.b;
      }

      if (properties.c !== null) {
        this.c = properties.c;
      }

      if (properties.d !== null) {
        this.d = properties.d;
      }

      if (properties.tx !== null) {
        this.tx = properties.tx;
      }

      if (properties.ty !== null) {
        this.ty = properties.ty;
      }
    }
  }
}
