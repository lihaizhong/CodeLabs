import type { RawImage, PlatformImage } from "octopus-platform";

export type PlatformRenderingContext2D =
  | OffscreenCanvasRenderingContext2D
  | CanvasRenderingContext2D;

export interface RawImages {
  [key: string]: RawImage;
}

export interface PlatformImages {
  [key: string]: PlatformImage | ImageBitmap;
}

export interface PainterActionModel {
  // canvas or offscreen
  type: "C" | "O";
  // clear or resize
  clear: "CL" | "RE";
}

export type PainterMode = "dual" | "single";

export interface CanvasSize {
  width: number;
  height: number;
}

export interface TransformScale {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
}

export const enum PLAYER_FILL_MODE {
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

export const enum PLAYER_PLAY_MODE {
  /**
   * 顺序播放
   */
  FORWARDS = "forwards",
  /**
   * 倒序播放
   */
  FALLBACKS = "fallbacks",
}

export const enum PLAYER_CONTENT_MODE {
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

export type PlayerEventCallback = () => void;

export type PlayerProcessEventCallback = (percent: number, frame: number) => void;

export type PosterEventCallback = () => void;

export interface PlayerConfig {
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
}

export type PlayerConfigOptions = Partial<PlayerConfig> & {
  /**
   * 主屏，播放动画的 Canvas 元素
   */
  container: string;
  /**
   * 副屏，播放动画的 Canvas 元素
   */
  secondary?: string;
};

export interface PosterConfig {
  /**
   * 主屏，绘制海报的 Canvas 元素
   */
  container: string;
  /**
   * 填充模式，类似于 content-mode。
   */
  contentMode: PLAYER_CONTENT_MODE;
  /**
   * 绘制成海报的帧，默认是0。
   */
  frame: number;
}

export type PosterConfigOptions = Partial<PosterConfig>;
