import Reader from "../io/Reader";
/**
 * Properties of a RectArgs.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IRectArgs
 * @property {number|null} [x] RectArgs x
 * @property {number|null} [y] RectArgs y
 * @property {number|null} [width] RectArgs width
 * @property {number|null} [height] RectArgs height
 * @property {number|null} [cornerRadius] RectArgs cornerRadius
 */
export interface RectArgsProps {
    x: number | null;
    y: number | null;
    width: number | null;
    height: number | null;
    cornerRadius: number | null;
}
export default class RectArgs {
    /**
     * Decodes a RectArgs message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo.RectPath;
    /**
     * RectArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    x: number;
    /**
     * RectArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    y: number;
    /**
     * RectArgs width.
     * @member {number} width
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    width: number;
    /**
     * RectArgs height.
     * @member {number} height
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    height: number;
    /**
     * RectArgs cornerRadius.
     * @member {number} cornerRadius
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    cornerRadius: number;
}
