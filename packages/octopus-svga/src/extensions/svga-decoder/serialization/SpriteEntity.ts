import Reader from "../io/Reader";
import FrameEntity from "./FrameEntity";

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
  static decode(reader: Reader | Uint8Array, length?: number): PlatformVideo.VideoSprite {
    reader = Reader.create(reader);

    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new SpriteEntity();
    let tag: number;

    while (reader.pos < end) {
      tag = reader.uint32();
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
  frames: Array<PlatformVideo.VideoFrame | PlatformVideo.HiddenVideoFrame> = [];
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
}
