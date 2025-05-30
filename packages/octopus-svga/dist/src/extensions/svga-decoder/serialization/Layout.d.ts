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
    static decode(reader: Reader | Uint8Array, length?: number): Layout;
    /**
     * Layout x.
     * @member {number} x
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    x: number;
    /**
     * Layout y.
     * @member {number} y
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    y: number;
    /**
     * Layout width.
     * @member {number} width
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    width: number;
    /**
     * Layout height.
     * @member {number} height
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    height: number;
    /**
     * Constructs a new Layout.
     * @memberof com.opensource.svga
     * @classdesc Represents a Layout.
     * @implements ILayout
     * @constructor
     * @param {com.opensource.svga.ILayout=} [properties] Properties to set
     */
    constructor(properties?: LayoutProps);
}
