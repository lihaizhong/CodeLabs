import Reader from "../io/Reader";
export default class Transform {
    /**
     * Decodes a Transform message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.Transform} Transform
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo.Transform;
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
}
