import Reader from "../io/Reader";
import SpriteEntity from "./SpriteEntity";
import MovieParams from "./MovieParams";
import { PlatformVideo } from "../../../types/video";

export default class MovieEntity {
  static EMPTY_U8 = new Uint8Array(0);
  /**
   * Decodes a MovieEntity message from the specified reader.
   * @function decode
   * @memberof com.opensource.svga.MovieEntity
   * @static
   * @param {$protobuf.Reader} reader Reader to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.MovieEntity} MovieEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader, length?: number): PlatformVideo.Video {
    const end = reader.end(length);
    const message = new MovieEntity();
    let key: string;
    let value: Uint8Array;
    let end2: number;
    let tag: number;
    let tag2: number;

    while (reader.pos < end) {
      tag = reader.uint32();

      switch (tag >>> 3) {
        case 1: {
          message.version = reader.string();
          break;
        }
        case 2: {
          message.params = MovieParams.decode(reader, reader.uint32());
          break;
        }
        case 3: {
          end2 = reader.uint32() + reader.pos;
          key = "";
          value = MovieEntity.EMPTY_U8;

          while (reader.pos < end2) {
            tag2 = reader.uint32();
            switch (tag2 >>> 3) {
              case 1:
                key = reader.string();
                break;
              case 2:
                value = reader.bytes();
                break;
              default:
                reader.skipType(tag2 & 7);
                break;
            }
          }

          message.images[key] = value;
          break;
        }
        case 4: {
          message.sprites.push(SpriteEntity.decode(reader, reader.uint32()));
          break;
        }
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return MovieEntity.format(message);
  }

  static format(message: MovieEntity): PlatformVideo.Video {
    const { version, images, sprites } = message;
    const { fps, frames, viewBoxWidth, viewBoxHeight } = message.params!;

    return {
      version,
      filename: "",
      locked: false,
      dynamicElements: {},
      size: {
        width: viewBoxWidth,
        height: viewBoxHeight,
      },
      fps,
      frames,
      images,
      sprites,
    };
  }

  /**
   * MovieEntity version.
   * @member {string} version
   * @memberof com.opensource.svga.MovieEntity
   * @instance
   */
  version: string = "";
  /**
   * MovieEntity params.
   * @member {com.opensource.svga.IMovieParams|null|undefined} params
   * @memberof com.opensource.svga.MovieEntity
   * @instance
   */
  params: MovieParams | null = null;
  /**
   * MovieEntity images.
   * @member {Object.<string,Uint8Array>} images
   * @memberof com.opensource.svga.MovieEntity
   * @instance
   */
  images: Record<string, Uint8Array> = {};
  /**
   * MovieEntity sprites.
   * @member {Array.<com.opensource.svga.ISpriteEntity>} sprites
   * @memberof com.opensource.svga.MovieEntity
   * @instance
   */
  sprites: PlatformVideo.VideoSprite[] = [];
}
