import Reader from "../io/Reader";
/**
 * Properties of a RGBAColor.
 * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
 * @interface IRGBAColor
 * @property {number|null} [r] RGBAColor r
 * @property {number|null} [g] RGBAColor g
 * @property {number|null} [b] RGBAColor b
 * @property {number|null} [a] RGBAColor a
 */
export interface RGBAColorProps {
    r: number | null;
    g: number | null;
    b: number | null;
    a: number | null;
}
export default class RGBAColor {
    /**
     * Decodes a RGBAColor message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader | Uint8Array, length?: number): RGBAColor;
    /**
     * RGBAColor r.
     * @member {number} r
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    r: number;
    /**
     * RGBAColor g.
     * @member {number} g
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    g: number;
    /**
     * RGBAColor b.
     * @member {number} b
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    b: number;
    /**
     * RGBAColor a.
     * @member {number} a
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    a: number;
    /**
     * Constructs a new RGBAColor.
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @classdesc Represents a RGBAColor.
     * @implements IRGBAColor
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor=} [properties] Properties to set
     */
    constructor(properties?: RGBAColorProps);
}
