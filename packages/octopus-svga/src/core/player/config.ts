import {
  type PlatformVideo,
  type PlayerConfig,
  PLAYER_FILL_MODE,
  PLAYER_PLAY_MODE,
  PLAYER_CONTENT_MODE,
} from "../../types";

export class Config {
  /**
   * 最后停留的目标模式，类似于 animation-fill-mode，默认值 forwards。
   */
  public fillMode = PLAYER_FILL_MODE.BACKWARDS;
  /**
   * 播放模式，默认值 forwards
   */
  public playMode = PLAYER_PLAY_MODE.FORWARDS;
  /**
   * 填充模式，类似于 content-mode。
   */
  public contentMode = PLAYER_CONTENT_MODE.FILL;
  /**
   * 开始播放的帧，默认值 0
   */
  public startFrame = 0;
  /**
   * 结束播放的帧，默认值 0
   */
  public endFrame = 0;
  /**
   * 循环播放的开始帧，默认值 0
   */
  public loopStartFrame = 0;
  /**
   * 循环次数，默认值 0（无限循环）
   */
  public loop = 0;

  public register(config: Partial<PlayerConfig>) {
    if (typeof config.loop === "number" && config.loop >= 0) {
      this.loop = config.loop;
    }

    if (
      config.fillMode &&
      [
        PLAYER_FILL_MODE.FORWARDS,
        PLAYER_FILL_MODE.BACKWARDS,
        PLAYER_FILL_MODE.NONE,
      ].includes(config.fillMode)
    ) {
      this.fillMode = config.fillMode;
    }

    if (
      config.playMode &&
      [PLAYER_PLAY_MODE.FORWARDS, PLAYER_PLAY_MODE.FALLBACKS].includes(
        config.playMode
      )
    ) {
      this.playMode = config.playMode;
    }

    if (typeof config.startFrame === "number" && config.startFrame >= 0) {
      this.startFrame = config.startFrame;
    }

    if (typeof config.endFrame === "number" && config.endFrame >= 0) {
      this.endFrame = config.endFrame;
    }

    if (
      typeof config.loopStartFrame === "number" &&
      config.loopStartFrame >= 0
    ) {
      this.loopStartFrame = config.loopStartFrame;
    }

    if (typeof config.contentMode === "string") {
      this.contentMode = config.contentMode;
    }
  }

  public setItem<T extends keyof PlayerConfig>(key: T, value: PlayerConfig[T]) {
    this.register({ [key]: value });
  }

  public getConfig(entity: PlatformVideo.Video) {
    const { playMode, loopStartFrame, startFrame, endFrame, fillMode, loop } =
      this;
    const { fps, sprites } = entity;
    const { frames } = entity;
    const spriteCount = sprites.length;
    const start = Math.min(frames - 1, Math.max(startFrame, 0)); // startFrame 不能等于 frames
    const end = endFrame > 0 ? Math.min(frames, endFrame) : frames; // endFrame 不能等于 0
    // 每帧持续的时间
    const frameDuration = 1000 / fps;

    if (start >= end) {
      throw new Error("endFrame should greater than startFrame");
    }

    // 更新动画总帧数
    const finalFrames = end - start;
    const duration = Math.floor(finalFrames * frameDuration * 10 ** 6) / 10 ** 6;
    // 重置为开始帧
    const currFrame = Math.min(end - 1, Math.max(loopStartFrame, start));
    let extFrame = 0;
    let loopStart: number;

    // 顺序播放/倒叙播放
    if (playMode === PLAYER_PLAY_MODE.FORWARDS) {
      if (fillMode === PLAYER_FILL_MODE.FORWARDS) {
        extFrame = 1;
      }
      loopStart = (currFrame - start) * frameDuration;
    } else {
      if (fillMode === PLAYER_FILL_MODE.BACKWARDS) {
        extFrame = 1;
      }
      loopStart = (end - 1 - currFrame) * frameDuration;
    }

    return {
      currFrame,
      startFrame: start,
      endFrame: end,
      totalFrame: finalFrames,
      spriteCount,
      aniConfig: {
        // 单个周期的运行时长
        duration,
        // 第一个周期开始时间偏移量
        loopStart,
        // 循环次数
        loop: loop === 0 ? Infinity : loop,
        // 最后一帧不在周期内，需要单独计算
        fillValue: extFrame * frameDuration,
      },
    };
  }
}
