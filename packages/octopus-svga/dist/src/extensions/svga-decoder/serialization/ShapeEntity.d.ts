import Reader from "../io/Reader";
export default class ShapeEntity {
    /**
     * Decodes a ShapeEntity message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo.VideoFrameShape | null;
    static format(message: ShapeEntity): PlatformVideo.VideoFrameShape | null;
    /**
     * ShapeEntity type.
     * @member {com.opensource.svga.ShapeEntity.ShapeType} type
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    type: PlatformVideo.SHAPE_TYPE_CODE;
    /**
     * ShapeEntity shape.
     * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    shape: PlatformVideo.ShapePath | null;
    /**
     * ShapeEntity rect.
     * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    rect: PlatformVideo.RectPath | null;
    /**
     * ShapeEntity ellipse.
     * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    ellipse: PlatformVideo.EllipsePath | null;
    /**
     * ShapeEntity styles.
     * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    styles: PlatformVideo.VideoStyles | null;
    /**
     * ShapeEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    transform: PlatformVideo.Transform | null;
}
