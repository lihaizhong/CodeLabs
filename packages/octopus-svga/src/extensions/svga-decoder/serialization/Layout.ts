import Reader from "../io/Reader";

/**
 * Properties of a Layout.
 * @memberof com.opensource.svga
 * @interface ILayout
 * @property {number|null} [x] Layout x
 * @property {number|null} [y] Layout y
 * @property {number|null} [width] Layout width
 * @property {number|null} [height] Layout height
 */
export interface LayoutProps {
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
}

export default class Layout {
  /**
   * Decodes a Layout message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.Layout
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.Layout} Layout
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): Layout {
    reader = Reader.create(reader);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = new Layout();
    while (reader.pos < end) {
      const tag = reader.uint32();
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

    return message;
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

  /**
   * Constructs a new Layout.
   * @memberof com.opensource.svga
   * @classdesc Represents a Layout.
   * @implements ILayout
   * @constructor
   * @param {com.opensource.svga.ILayout=} [properties] Properties to set
   */
  constructor(properties?: LayoutProps) {
    if (properties) {
      if (properties.x !== null) {
        this.x = properties.x
      }

      if (properties.y !== null) {
        this.y = properties.y
      }

      if (properties.width !== null) {
        this.width = properties.width
      }

      if (properties.height !== null) {
        this.height = properties.height
      }
    }
  }
}
