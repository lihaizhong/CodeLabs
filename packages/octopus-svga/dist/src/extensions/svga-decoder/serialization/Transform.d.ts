import Reader from "../io/Reader";
/**
 * Properties of a Transform.
 * @memberof com.opensource.svga
 * @interface ITransform
 * @property {number|null} [a] Transform a
 * @property {number|null} [b] Transform b
 * @property {number|null} [c] Transform c
 * @property {number|null} [d] Transform d
 * @property {number|null} [tx] Transform tx
 * @property {number|null} [ty] Transform ty
 */
export interface TransformProps {
    a: number | null;
    b: number | null;
    c: number | null;
    d: number | null;
    tx: number | null;
    ty: number | null;
}
export default class Transform {
    /**
     * Decodes a Transform message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.Transform} Transform
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader | Uint8Array, length?: number): Transform;
    /**
     * Transform a.
     * @member {number} a
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    a: number;
    /**
     * Transform b.
     * @member {number} b
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    b: number;
    /**
     * Transform c.
     * @member {number} c
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    c: number;
    /**
     * Transform d.
     * @member {number} d
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    d: number;
    /**
     * Transform tx.
     * @member {number} tx
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    tx: number;
    /**
     * Transform ty.
     * @member {number} ty
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    ty: number;
    /**
     * Constructs a new Transform.
     * @memberof com.opensource.svga
     * @classdesc Represents a Transform.
     * @implements ITransform
     * @constructor
     * @param {com.opensource.svga.ITransform=} [properties] Properties to set
     */
    constructor(properties?: TransformProps);
}
