import { Brush } from "./brush";
import { Animator } from "./animator";
import { Config } from "./config";

/**
 * SVGA 播放器
 */
export class Player {
  /**
   * SVGA 元数据
   * Video Entity
   */
  private entity: Video | undefined = undefined;

  /**
   * 当前配置项
   */
  private readonly config = new Config();

  /**
   * 刷头实例
   */
  private brush = new Brush();

  /**
   * 动画实例
   */
  private animator: Animator | null = null;

  // private isBeIntersection = true;
  // private intersectionObserver: IntersectionObserver | null = null

  /**
   * 设置配置项
   * @param options 可配置项
   * @property {string} container 主屏，播放动画的 Canvas 元素
   * @property {string} secondary 副屏，播放动画的 Canvas 元素
   * @property {number} loop 循环次数，默认值 0（无限循环）
   * @property {string} fillMode 最后停留的目标模式，类似于 animation-fill-mode，接受值 forwards 和 fallbacks，默认值 forwards。
   * @property {string} playMode 播放模式，接受值 forwards 和 fallbacks ，默认值 forwards。
   * @property {number} startFrame 单个循环周期内开始播放的帧数，默认值 0
   * @property {number} endFrame 单个循环周期内结束播放的帧数，默认值 0
   * @property {number} loopStartFrame 循环播放的开始帧，仅影响第一个周期的开始帧，默认值 0
   */
  public async setConfig(
    options: string | PlayerConfigOptions,
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ): Promise<void> {
    let config: PlayerConfigOptions;

    if (typeof options === "string") {
      config = { container: options };
    } else {
      config = options;
    }

    this.config.register(config);
    await this.brush.register(config.container, config.secondary, component);
    // 监听容器是否处于浏览器视窗内
    // this.setIntersectionObserver()
    this.animator = new Animator(this.brush);
  }

  /**
   * 更新配置
   * @param key
   * @param value
   */
  public setItem<T extends keyof PlayerConfig>(key: T, value: PlayerConfig[T]): void {
    this.config.setItem<T>(key, value);
  }

  // private setIntersectionObserver (): void {
  //   if (hasIntersectionObserver && this.config.isUseIntersectionObserver) {
  //     this.intersectionObserver = new IntersectionObserver(entries => {
  //       this.isBeIntersection = !(entries[0].intersectionRatio <= 0)
  //     }, {
  //       rootMargin: '0px',
  //       threshold: [0, 0.5, 1]
  //     })
  //     this.intersectionObserver.observe(this.config.container)
  //   } else {
  //     if (this.intersectionObserver !== null) this.intersectionObserver.disconnect()
  //     this.config.isUseIntersectionObserver = false
  //     this.isBeIntersection = true
  //   }
  // }

  /**
   * 装载 SVGA 数据元
   * @param videoEntity SVGA 数据源
   * @returns Promise<void>
   */
  public mount(videoEntity: Video): Promise<void | void[]> {
    if (!videoEntity) {
      throw new Error("videoEntity undefined");
    }

    const { images, filename } = videoEntity;

    this.animator!.stop();
    this.entity = videoEntity;
    this.brush.clearSecondary();
    this.brush.clearMaterials();

    return this.brush.loadImages(images, filename);
  }

  /**
   * 开始播放事件回调
   * @param frame
   */
  public onStart?: PlayerEventCallback;
  /**
   * 重新播放事件回调
   * @param frame
   */
  public onResume?: PlayerEventCallback;
  /**
   * 暂停播放事件回调
   * @param frame
   */
  public onPause?: PlayerEventCallback;
  /**
   * 停止播放事件回调
   * @param frame
   */
  public onStop?: PlayerEventCallback;
  /**
   * 播放中事件回调
   * @param percent
   * @param frame
   * @param frames
   */
  public onProcess?: PlayerProcessEventCallback;
  /**
   * 结束播放事件回调
   * @param frame
   */
  public onEnd?: PlayerEventCallback;

  /**
   * 开始播放
   */
  public start(): void {
    this.startAnimation();
    this.onStart?.();
  }

  /**
   * 重新播放
   */
  public resume(): void {
    this.animator!.resume();
    this.onResume?.();
  }

  /**
   * 暂停播放
   */
  public pause(): void {
    this.animator!.pause();
    this.onPause?.();
  }

  /**
   * 停止播放
   */
  public stop(): void {
    this.animator!.stop();
    this.brush.clearContainer();
    this.brush.clearSecondary();
    this.onStop?.();
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.animator!.stop();
    this.brush.destroy();
    this.animator = null;
    this.entity = undefined;
  }

  /**
   * 指定开始帧动画
   * @param frame
   * @param andPlay
   * @returns
   */
  public stepToFrame(frame: number, andPlay = false) {
    if (!this.entity || frame < 0 || frame >= this.entity.frames) return;

    this.pause();
    this.config.loopStartFrame = frame;
    if (andPlay) {
      this.startAnimation();
    }
  }

  /**
   * 指定开始百分比动画
   * @param percent
   * @param andPlay
   * @returns
   */
  public stepToPercentage(percent: number, andPlay: boolean = false) {
    if (!this.entity) return;

    const { frames } = this.entity;

    this.stepToFrame(
      Math.round((percent < 0 ? 0 : percent) * frames) % frames,
      andPlay
    );
  }

  /**
   * 开始绘制动画
   */
  private startAnimation(): void {
    const { entity, config, animator, brush } = this
    const { playMode, contentMode } = config;
    const {
      currFrame,
      startFrame,
      endFrame,
      totalFrame,
      spriteCount,
      aniConfig,
    } = config.getConfig(entity!);
    const { duration, loopStart, loop, fillValue } = aniConfig;

    // 片段绘制开始位置
    let head = 0;
    // 片段绘制结束位置
    let tail = 0;
    let currentFrame = currFrame;
    // 下一帧
    let nextFrame: number;
    // 当前已完成的百分比
    let percent: number;
    // 当前需要绘制的百分比
    let drawPercent: number;

    // 更新动画基础信息
    animator!.setConfig(duration, loopStart, loop, fillValue);
    brush.resize(contentMode, entity!.size);
    // 动画绘制过程
    animator!.onUpdate = (timePercent: number) => {
      if (playMode === PLAYER_PLAY_MODE.FALLBACKS) {
        percent = 1 - timePercent;
        nextFrame =
          (timePercent == 0 ? endFrame : Math.ceil(percent * totalFrame)) - 1;
        drawPercent = Math.abs(1 - percent * totalFrame + currentFrame);
      } else {
        percent = timePercent;
        nextFrame =
          timePercent === 1 ? startFrame : Math.floor(percent * totalFrame);
        drawPercent = Math.abs(percent * totalFrame - currentFrame);
      }

      // 是否还有剩余时间
      const hasRemained = currentFrame === nextFrame;

      // 当前帧的图片还未绘制完成
      if (tail !== spriteCount) {
        // 1.15 和 3 均为阔值，保证渲染尽快完成
        const nextTail = hasRemained
          ? Math.min(spriteCount * drawPercent * 1.15 + 2, spriteCount) << 0
          : spriteCount;

        if (nextTail > tail) {
          head = tail;
          tail = nextTail;
          brush.draw(entity!, currentFrame, head, tail);
        }
      }

      if (hasRemained) return;

      const frame = currentFrame;

      brush.clearContainer();
      brush.stick();
      brush.clearSecondary();
      currentFrame = nextFrame;
      tail = 0;
      this.onProcess?.(~~(percent * 100) / 100, frame);
    };
    animator!.onEnd = () => this.onEnd?.();
    animator!.start();
  }
}
