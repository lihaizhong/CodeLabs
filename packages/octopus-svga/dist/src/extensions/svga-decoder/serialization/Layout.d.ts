import Reader from "../io/Reader";
export default class Layout {
    /**
     * Decodes a Layout message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.Layout} Layout
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo.Rect;
    static format(message: Layout): PlatformVideo.Rect;
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
}
