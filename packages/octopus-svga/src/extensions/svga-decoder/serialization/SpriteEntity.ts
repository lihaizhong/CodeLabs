import Reader from "../io/Reader";
import FrameEntity from "./FrameEntity";

/**
 * Properties of a SpriteEntity.
 * @memberof com.opensource.svga
 * @interface ISpriteEntity
 * @property {string|null} [imageKey] SpriteEntity imageKey
 * @property {Array.<com.opensource.svga.IFrameEntity>|null} [frames] SpriteEntity frames
 * @property {string|null} [matteKey] SpriteEntity matteKey
 */
export interface SpriteEntityProps {
  imageKey: string | null;
  frames: FrameEntity[] | null;
  matteKey: string | null;
}

export default class SpriteEntity {
  /**
   * Decodes a SpriteEntity message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.SpriteEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): SpriteEntity {
    reader = Reader.create(reader);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = new SpriteEntity();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.imageKey = reader.string();
          break;
        }
        case 2: {
          if (!(message.frames && message.frames.length)) {
            message.frames = [];
          }
          message.frames.push(FrameEntity.decode(reader, reader.uint32()));
          break;
        }
        case 3: {
          message.matteKey = reader.string();
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
   * SpriteEntity frames.
   * @member {Array.<com.opensource.svga.IFrameEntity>} frames
   * @memberof com.opensource.svga.SpriteEntity
   * @instance
   */
  frames: FrameEntity[] = [];
  /**
   * SpriteEntity imageKey.
   * @member {string} imageKey
   * @memberof com.opensource.svga.SpriteEntity
   * @instance
   */
  imageKey: string = "";
  /**
   * SpriteEntity matteKey.
   * @member {string} matteKey
   * @memberof com.opensource.svga.SpriteEntity
   * @instance
   */
  matteKey: string = "";

  /**
   * Constructs a new SpriteEntity.
   * @memberof com.opensource.svga
   * @classdesc Represents a SpriteEntity.
   * @implements ISpriteEntity
   * @constructor
   * @param {com.opensource.svga.ISpriteEntity=} [properties] Properties to set
   */
  constructor(properties?: SpriteEntityProps) {
    if (properties) {
      if (properties.frames !== null) {
        this.frames = properties.frames
      }

      if (properties.imageKey !== null) {
        this.imageKey = properties.imageKey
      }

      if (properties.matteKey !== null) {
        this.matteKey = properties.matteKey
      }
    }
  }
}
