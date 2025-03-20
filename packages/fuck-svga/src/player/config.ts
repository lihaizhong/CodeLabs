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
   * 开始播放的帧数，默认值 0
   */
  public startFrame = 0;
  /**
   * 结束播放的帧数，默认值 0
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
  /**
   * 是否开启动画容器视窗检测，默认值 false
   * 开启后利用 Intersection Observer API 检测动画容器是否处于视窗内，若处于视窗外，停止描绘渲染帧避免造成资源消耗
   */
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
