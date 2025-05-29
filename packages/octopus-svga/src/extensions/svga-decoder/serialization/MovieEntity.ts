import Reader from "../io/Reader";
import SpriteEntity from "./SpriteEntity";
import MovieParams from "./MovieParams";

/**
 * Properties of a MovieEntity.
 * @memberof com.opensource.svga
 * @interface IMovieEntity
 * @property {string|null} [version] MovieEntity version
 * @property {com.opensource.svga.IMovieParams|null} [params] MovieEntity params
 * @property {Object.<string,Uint8Array>|null} [images] MovieEntity images
 * @property {Array.<com.opensource.svga.ISpriteEntity>|null} [sprites] MovieEntity sprites
 */
export interface MovieEntityProps {
  version: string | null;
  params: MovieParams | null;
  images: Record<string, Uint8Array> | null;
  sprites: SpriteEntity[] | null;
}

export default class MovieEntity {
  static EMPTY_OBJECT = Object.freeze({});

  /**
   * Decodes a MovieEntity message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.MovieEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.MovieEntity} MovieEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): MovieEntity {
    reader = Reader.create(reader);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = new MovieEntity();
    let key;
    let value;
    while (reader.pos < end) {
      const tag = reader.uint32();
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
          if (message.images === MovieEntity.EMPTY_OBJECT) {
            message.images = {};
          }
          const end2 = reader.uint32() + reader.pos;
          key = "";
          value = [];
          while (reader.pos < end2) {
            let tag2 = reader.uint32();
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
          message.images[key] = value as Uint8Array;
          break;
        }
        case 4: {
          if (!(message.sprites && message.sprites.length)) {
            message.sprites = [];
          }
          message.sprites.push(SpriteEntity.decode(reader, reader.uint32()));
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
  images: Record<string, Uint8Array> = MovieEntity.EMPTY_OBJECT;
  /**
   * MovieEntity sprites.
   * @member {Array.<com.opensource.svga.ISpriteEntity>} sprites
   * @memberof com.opensource.svga.MovieEntity
   * @instance
   */
  sprites: SpriteEntity[] = [];

  /**
   * Constructs a new MovieEntity.
   * @memberof com.opensource.svga
   * @classdesc Represents a MovieEntity.
   * @implements IMovieEntity
   * @constructor
   * @param {com.opensource.svga.IMovieEntity=} [properties] Properties to set
   */
  constructor(properties?: MovieEntityProps) {
    if (properties) {
      if (properties.version !== null) {
        this.version = properties.version;
      }

      if (properties.images !== null) {
        this.images = properties.images;
      }

      if (properties.params !== null) {
        this.params = properties.params;
      }

      if (properties.sprites !== null) {
        this.sprites = properties.sprites;
      }
    }
  }
}
