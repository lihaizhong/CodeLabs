import Reader from "../io/Reader";
/**
 * Properties of an EllipseArgs.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IEllipseArgs
 * @property {number|null} [x] EllipseArgs x
 * @property {number|null} [y] EllipseArgs y
 * @property {number|null} [radiusX] EllipseArgs radiusX
 * @property {number|null} [radiusY] EllipseArgs radiusY
 */
export interface EllipseArgsProps {
    x: number | null;
    y: number | null;
    radiusX: number | null;
    radiusY: number | null;
}
export default class EllipseArgs {
    /**
     * Decodes an EllipseArgs message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader | Uint8Array, length?: number): EllipseArgs;
    /**
     * EllipseArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    x: number;
    /**
     * EllipseArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    y: number;
    /**
     * EllipseArgs radiusX.
     * @member {number} radiusX
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusX: number;
    /**
     * EllipseArgs radiusY.
     * @member {number} radiusY
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusY: number;
    /**
     * Constructs a new EllipseArgs.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents an EllipseArgs.
     * @implements IEllipseArgs
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs=} [properties] Properties to set
     */
    constructor(properties?: EllipseArgsProps);
}
