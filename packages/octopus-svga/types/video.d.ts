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

  const enum LINE_CAP {
    BUTT = "butt",
    ROUND = "round",
    SQUARE = "square",
  }

  const enum LINE_JOIN_CODE {
    MITER = 0,
    ROUND = 1,
    BEVEL = 2,
  }

  const enum LINE_JOIN {
    MITER = "miter",
    ROUND = "round",
    BEVEL = "bevel",
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

  // interface MaskPath {
  //   d: string;
  //   transform: Transform | undefined;
  //   styles: VideoStyles;
  // }

  type VideoFrameShape = VideoShapeShape | VideoShapeRect | VideoShapeEllipse;

  interface HiddenVideoFrame {
    alpha: 0;
  }

  interface VideoFrame {
    alpha: number;
    transform: Transform | null;
    // nx: number;
    // ny: number;
    layout: Rect;
    // clipPath: string;
    // maskPath: MaskPath | null;
    shapes: VideoFrameShape[];
  }

  interface VideoSprite {
    imageKey: string;
    frames: Array<VideoFrame | HiddenVideoFrame>;
  }

  interface VideoParams {
    viewBoxWidth: number;
    viewBoxHeight: number;
    fps: number;
    frames: number;
  }

  interface Video {
    /**
     * svga 版本号
     */
    version: string;
    /**
     * svga 文件名
     */
    filename: string;
    /**
     * svga 尺寸
     */
    size: VideoSize;
    /**
     * svga 帧率
     */
    fps: number;
    /**
     * 是否可以编辑svga文件
     */
    locked: boolean;
    /**
     * svga 帧数
     */
    frames: number;
    /**
     * svga 二进制图片合集
     */
    images: RawImages;
    /**
     * svga 动态元素
     */
    dynamicElements: PlatformImages;
    /**
     * svga 关键帧信息
     */
    sprites: VideoSprite[];
  }
}
