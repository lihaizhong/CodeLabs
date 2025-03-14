export class Config {
  public fillMode = PLAYER_FILL_MODE.BACKWARDS;

  public playMode = PLAYER_PLAY_MODE.FORWARDS;

  public contentMode = PLAYER_CONTENT_MODE.FILL;

  public startFrame = 0;

  public endFrame = 0;

  public loopStartFrame = 0;

  public loop = 0;

  // public isUseIntersectionObserver = false;

  public register(config: Partial<PlayerConfig>) {
    if (typeof config.loop === "number" && config.loop >= 0) {
      this.loop = config.loop;
    }

    if (
      config.fillMode &&
      [PLAYER_FILL_MODE.FORWARDS, PLAYER_FILL_MODE.BACKWARDS].includes(
        config.fillMode
      )
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

    // if (typeof config.isUseIntersectionObserver === 'boolean') {
    //   this.isUseIntersectionObserver = config.isUseIntersectionObserver
    // }
  }

  public setItem(key: keyof PlayerConfig, value: any) {
    this.register({ [key]: value });
  }

  public getConfig(entity: Video) {
    const { playMode, loopStartFrame, startFrame, endFrame, fillMode, loop } =
      this;
    const { fps, sprites } = entity;
    let { frames } = entity;
    const spriteCount = sprites.length;
    const start = startFrame > 0 ? startFrame : 0;
    const end = endFrame > 0 && endFrame < frames ? endFrame : frames;

    if (start > end) {
      throw new Error("StartFrame should greater than EndFrame");
    }

    // 更新活动帧总数
    if (end < frames) {
      frames = end - start;
    } else if (start > 0) {
      frames -= start;
    }

    let currFrame = loopStartFrame;
    let extFrame = 0;

    // 顺序播放/倒叙播放
    if (playMode === PLAYER_PLAY_MODE.FORWARDS) {
      // 如果开始动画的当前帧是最后一帧，重置为开始帧
      if (currFrame === end - 1) {
        currFrame = start;
      }

      if (fillMode === PLAYER_FILL_MODE.FORWARDS) {
        extFrame = 1;
      }
    } else {
      // 如果开始动画的当前帧是最后一帧，重置为开始帧
      if (currFrame === 0) {
        currFrame = end - 1;
      }

      if (fillMode === PLAYER_FILL_MODE.BACKWARDS) {
        extFrame = 1;
      }
    }

    // 每帧持续的时间
    const frameDuration = 1000 / fps;

    return {
      currFrame,
      startFrame: start,
      endFrame: end,
      totalFrame: frames,
      spriteCount,
      aniConfig: {
        // 单个周期的运行时长
        duration: Math.floor(frames * frameDuration * 10 ** 6) / 10 ** 6,
        // 第一个周期开始时间偏移量
        loopStart:
          loopStartFrame > start ? (loopStartFrame - start) * frameDuration : 0,
        // 循环次数
        loop: loop === 0 ? Infinity : loop,
        // 最后一帧不在周期内，需要单独计算
        fillValue: extFrame * frameDuration,
      },
    };
  }
}
