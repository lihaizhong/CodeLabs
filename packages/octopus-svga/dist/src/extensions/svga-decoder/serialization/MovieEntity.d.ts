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
    static EMPTY_OBJECT: Readonly<{}>;
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
    static decode(reader: Reader | Uint8Array, length?: number): MovieEntity;
    /**
     * MovieEntity version.
     * @member {string} version
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    version: string;
    /**
     * MovieEntity params.
     * @member {com.opensource.svga.IMovieParams|null|undefined} params
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    params: MovieParams | null;
    /**
     * MovieEntity images.
     * @member {Object.<string,Uint8Array>} images
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    images: Record<string, Uint8Array>;
    /**
     * MovieEntity sprites.
     * @member {Array.<com.opensource.svga.ISpriteEntity>} sprites
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    sprites: SpriteEntity[];
    /**
     * Constructs a new MovieEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a MovieEntity.
     * @implements IMovieEntity
     * @constructor
     * @param {com.opensource.svga.IMovieEntity=} [properties] Properties to set
     */
    constructor(properties?: MovieEntityProps);
}
