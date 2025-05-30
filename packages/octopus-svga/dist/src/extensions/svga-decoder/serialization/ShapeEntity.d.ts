import Reader from "../io/Reader";
import Transform from "./Transform";
import ShapeType from "./ShapeType";
import ShapeArgs from "./ShapeArgs";
import RectArgs from "./RectArgs";
import EllipseArgs from "./EllipseArgs";
import ShapeStyle from "./ShapeStyle";
/**
 * Properties of a ShapeEntity.
 * @memberof com.opensource.svga
 * @interface IShapeEntity
 * @property {com.opensource.svga.ShapeEntity.ShapeType|null} [type] ShapeEntity type
 * @property {com.opensource.svga.ShapeEntity.IShapeArgs|null} [shape] ShapeEntity shape
 * @property {com.opensource.svga.ShapeEntity.IRectArgs|null} [rect] ShapeEntity rect
 * @property {com.opensource.svga.ShapeEntity.IEllipseArgs|null} [ellipse] ShapeEntity ellipse
 * @property {com.opensource.svga.ShapeEntity.IShapeStyle|null} [styles] ShapeEntity styles
 * @property {com.opensource.svga.ITransform|null} [transform] ShapeEntity transform
 */
export interface ShapeEntityProps {
    type: ShapeType | null;
    shape: ShapeArgs | null;
    rect: RectArgs | null;
    ellipse: EllipseArgs | null;
    styles: ShapeStyle | null;
    transform: Transform | null;
}
export default class ShapeEntity {
    /**
     * Decodes a ShapeEntity message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader | Uint8Array, length?: number): ShapeEntity;
    /**
     * ShapeEntity type.
     * @member {com.opensource.svga.ShapeEntity.ShapeType} type
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    type: ShapeType;
    /**
     * ShapeEntity shape.
     * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    shape: ShapeArgs | null;
    /**
     * ShapeEntity rect.
     * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    rect: RectArgs | null;
    /**
     * ShapeEntity ellipse.
     * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    ellipse: EllipseArgs | null;
    /**
     * ShapeEntity styles.
     * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    styles: ShapeStyle | null;
    /**
     * ShapeEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    transform: Transform | null;
    private $oneOfFields;
    private $fieldMap;
    get args(): "shape" | "rect" | "ellipse";
    set args(name: "shape" | "rect" | "ellipse");
    /**
     * Constructs a new ShapeEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a ShapeEntity.
     * @implements IShapeEntity
     * @constructor
     * @param {com.opensource.svga.IShapeEntity=} [properties] Properties to set
     */
    constructor(properties?: ShapeEntityProps);
}
