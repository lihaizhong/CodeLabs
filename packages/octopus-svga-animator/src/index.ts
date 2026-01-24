// 导出 octopus-svga-engine 的核心组件
export { Parser, Painter, platform } from "octopus-svga-engine";

// 导出播放器核心
export { Player } from "./player";

// 导出动态元素管理
export {
  DynamicElementManager,
  TextOptions,
  QRCodeOptions,
  CanvasOptions,
} from "./dynamic-element";

// 导出类型定义
export type {
  PlayerConfigOptions,
  PlayerConfig,
  PlayerEventCallback,
  PlayerProcessEventCallback,
  PLAYER_PLAY_MODE,
  PLAYER_FILL_MODE,
  PLAYER_CONTENT_MODE,
} from "octopus-svga-engine";

// 导出视频类型
export type { PlatformVideo } from "octopus-svga-engine";