declare namespace PlatformVideo {
  interface VideoSize {
    width: number;
    height: number;
  }

  interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface Transform {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
  }

  const enum LINE_CAP_CODE {
    BUTT = 0,
    ROUND = 1,
    SQUARE = 2,
  }

  const enum LINE_JOIN_CODE {
    MITER = 0,
    ROUND = 1,
    BEVEL = 2,
  }

  interface RGBA_CODE {
    r: number;
    g: number;
    b: number;
    a: number;
  }

  type RGBA<
    R extends number,
    G extends number,
    B extends number,
    A extends number
  > = `rgba(${R}, ${G}, ${B}, ${A})`;

  const enum SHAPE_TYPE_CODE {
    SHAPE = 0,
    RECT = 1,
    ELLIPSE = 2,
    KEEP = 3,
  }

  const enum SHAPE_TYPE {
    SHAPE = "shape",
    RECT = "rect",
    ELLIPSE = "ellipse",
  }

  interface VideoStyles {
    fill: RGBA<number, number, number, number> | null;
    stroke: RGBA<number, number, number, number> | null;
    strokeWidth: number | null;
    lineCap: CanvasLineCap | null;
    lineJoin: CanvasLineJoin | null;
    miterLimit: number | null;
    lineDash: number[] | null;
  }

  interface ShapePath {
    d: string;
  }

  interface RectPath {
    x: number;
    y: number;
    width: number;
    height: number;
    cornerRadius: number;
  }

  interface EllipsePath {
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;
  }

  interface VideoShapeShape {
    type: SHAPE_TYPE.SHAPE;
    path: ShapePath;
    styles: VideoStyles;
    transform: Transform;
  }

  interface VideoShapeRect {
    type: SHAPE_TYPE.RECT;
    path: RectPath;
    styles: VideoStyles;
    transform: Transform;
  }

  interface VideoShapeEllipse {
    type: SHAPE_TYPE.ELLIPSE;
    path: EllipsePath;
    styles: VideoStyles;
    transform: Transform;
  }

  interface MaskPath {
    d: string;
    transform: Transform | undefined;
    styles: VideoStyles;
  }

  type VideoFrameShape = VideoShapeShape | VideoShapeRect | VideoShapeEllipse;

  type VideoFrameShapes = VideoFrameShape[];

  interface VideoFrame {
    alpha: number;
    transform: Transform | null;
    nx: number;
    ny: number;
    layout: Rect;
    clipPath: string;
    maskPath: MaskPath | null;
    shapes: VideoFrameShapes;
  }

  interface VideoSprite {
    imageKey: string;
    frames: VideoFrame[];
  }

  interface Video {
    version: string;
    filename: string;
    size: VideoSize;
    fps: number;
    locked: boolean;
    frames: number;
    images: RawImages;
    dynamicElements: PlatformImages;
    sprites: VideoSprite[];
  }
}
