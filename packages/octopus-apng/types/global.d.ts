type PlatformCanvas = HTMLCanvasElement | WechatMiniprogram.Canvas;

type PlatformOffscreenCanvas =
  | WechatMiniprogram.OffscreenCanvas
  | OffscreenCanvas;

type PlatformRenderingContext2D =
  | OffscreenCanvasRenderingContext2D
  | CanvasRenderingContext2D;

type PlatformImage = HTMLImageElement | WechatMiniprogram.Image;

type Bitmap = PlatformImage | ImageBitmap | HTMLCanvasElement | OffscreenCanvas;

type RawImage = string | Uint8Array;

interface RawImages {
  [key: string]: RawImage;
}

interface PlatformImages {
  [key: string]: Bitmap;
}

const enum PLAYER_FILL_MODE {
  /**
   * 播放完成后停在首帧
   */
  FORWARDS = "forwards",
  /**
   * 播放完成后停在尾帧
   */
  BACKWARDS = "backwards",
  /**
   * 播放完成后清空画布
   */
  NONE = "none",
}

const enum PLAYER_PLAY_MODE {
  /**
   * 顺序播放
   */
  FORWARDS = "forwards",
  /**
   * 倒序播放
   */
  FALLBACKS = "fallbacks",
}

const enum PLAYER_CONTENT_MODE {
  /**
   * 缩放图片填满 Canvas，图片可能出现变形
   */
  FILL = "fill",
  /**
   * 等比例缩放至整张图片填满 Canvas，不足部分留白
   */
  ASPECT_FIT = "aspect-fit",
  /**
   * 等比例缩放至图片填满 Canvas，超出部分不展示
   */
  ASPECT_FILL = "aspect-fill",
  /**
   * 图片对齐 Canvas 中心，超出部分不展示
   */
  CENTER = "center",
}

type PlayerEventCallback = () => void;

type PlayerProcessEventCallback = (percent: number, frame: number) => void;

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
   * 填充模式，类似于 content-mode。
   */
  contentMode: PLAYER_CONTENT_MODE;
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

interface PosterConfig {
  /**
   * 主屏，绘制海报的 Canvas 元素
   */
  container?: string;
  /**
   * 填充模式，类似于 content-mode。
   */
  contentMode?: PLAYER_CONTENT_MODE;
  /**
   * 绘制成海报的帧，默认是0。
   */
  frame?: number;
}
