type PlatformCanvas = HTMLCanvasElement | WechatMiniprogram.Canvas;

type PlatformOffscreenCanvas =
  | WechatMiniprogram.OffscreenCanvas
  | OffscreenCanvas;

type PlatformImage = HTMLImageElement | WechatMiniprogram.Image;

interface RawImages {
  [key: string]: string | Uint8Array;
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
  SHAPE = 'shape',
  RECT = 'rect',
  ELLIPSE = 'ellipse',
}

interface MovieStyles {
  fill: RGBA_CODE | null;
  stroke: RGBA_CODE | null;
  strokeWidth: number | null;
  lineCap: LINE_CAP_CODE | null;
  lineJoin: LINE_JOIN_CODE | null;
  miterLimit: number | null;
  lineDashI: number | null;
  lineDashII: number | null;
  lineDashIII: number | null;
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

interface MovieShape {
  type: SHAPE_TYPE_CODE | null;
  shape: ShapePath | null;
  rect: RectPath | null;
  ellipse: EllipsePath | null;
  styles: MovieStyles | null;
  transform: Transform | null;
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

interface MovieFrame {
  alpha: number;
  transform: Transform | null;
  nx: number;
  ny: number;
  layout: Rect;
  clipPath: string;
  maskPath: MaskPath | null;
  shapes: MovieShape[];
}

type VideoFrameShape =
  | VideoShapeShape
  | VideoShapeRect
  | VideoShapeEllipse;

type VideoFrameShapes = VideoFrameShape[];

interface IVideoFrame {
  alpha: number;
  transform: Transform | null;
  nx: number;
  ny: number;
  layout: Rect;
  clipPath: string;
  maskPath: MaskPath | null;
  shapes: VideoFrameShapes;
}

interface MovieSprite {
  imageKey: string;
  frames: MovieFrame[];
}

interface VideoSprite {
  imageKey: string;
  frames: IVideoFrame[];
}

type Bitmap = PlatformImage | PlatformOffscreenCanvas | ImageBitmap;

type ReplaceElement =
  | PlatformImage
  | ImageBitmap
  | PlatformCanvas
  | PlatformOffscreenCanvas;

interface ReplaceElements {
  [key: string]: ReplaceElement;
}

type DynamicElement = ReplaceElement;

interface DynamicElements {
  [key: string]: DynamicElement;
}

interface Movie {
  version: string;
  images: {
    [key: string]: Uint8Array;
  };
  params: {
    fps: number;
    frames: number;
    viewBoxHeight: number;
    viewBoxWidth: number;
  };
  sprites: MovieSprite[];
}

interface Video {
  version: string;
  filename: string;
  size: {
    width: number;
    height: number;
  };
  fps: number;
  frames: number;
  images: RawImages;
  replaceElements: ReplaceElements;
  dynamicElements: DynamicElements;
  sprites: VideoSprite[];
}

const enum PLAYER_FILL_MODE {
  /**
   * 播放完成后停在首帧
   */
  FORWARDS = 'forwards',
  /**
   * 播放完成后停在尾帧
   */
  BACKWARDS = 'backwards',
}

const enum PLAYER_PLAY_MODE {
  /**
   * 顺序播放
   */
  FORWARDS = 'forwards',
  /**
   * 倒序播放
   */
  FALLBACKS = 'fallbacks',
}

type PlayerEventCallback = (frame: number) => void;

type PlayerProcessEventCallback = (percent: number, frame: number, frames: number) => void;

type PosterEventCallback = () => void;

interface PlayerConfig {
  /**
   * 循环次数，默认值 0（无限循环）
   */
  loop: number;
  /**
   * 最后停留的目标模式，类似于 animation-fill-mode，默认值 forwards。
   */
  fillMode: PLAYER_FILL_MODE;
  /**
   * 播放模式，默认值 forwards
   */
  playMode: PLAYER_PLAY_MODE;
  /**
   * 开始播放的帧数，默认值 0
   */
  startFrame: number;
  /**
   * 结束播放的帧数，默认值 0
   */
  endFrame: number;
  /**
   * 循环播放的开始帧，默认值 0
   */
  loopStartFrame: number;
  /**
   * 是否开启动画容器视窗检测，默认值 false
   * 开启后利用 Intersection Observer API 检测动画容器是否处于视窗内，若处于视窗外，停止描绘渲染帧避免造成资源消耗
   */
  // isUseIntersectionObserver: boolean;
}

type PlayerConfigOptions = Partial<PlayerConfig> & {
  /**
   * 主屏，播放动画的 Canvas 元素
   */
  container: string;
  /**
   * 副屏，播放动画的 Canvas 元素
   */
  secondary?: string;
};
