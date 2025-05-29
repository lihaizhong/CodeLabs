import { platform } from "../platform";
import { Painter } from "../painter";
import { Animator } from "./animator";
import { Config } from "./config";
// import benchmark from "../benchmark";

/**
 * SVGA 播放器
 */
export class Player {
  /**
   * SVGA 元数据
   * Video Entity
   */
  private entity: PlatformVideo.Video | undefined;

  /**
   * 当前配置项
   */
  private readonly config = new Config();

  /**
   * 动画实例
   */
  private animator: Animator | null = null;

  /**
   * 刷头实例
   */
  public readonly painter = new Painter();

  // private isBeIntersection = true;
  // private intersectionObserver: IntersectionObserver | null = null

  /**
   * 设置配置项
   * @param options 可配置项
   * @property container 主屏，播放动画的 Canvas 元素
   * @property secondary 副屏，播放动画的 Canvas 元素
   * @property loop 循环次数，默认值 0（无限循环）
   * @property fillMode 最后停留的目标模式，类似于 animation-fill-mode，接受值 forwards 和 fallbacks，默认值 forwards。
   * @property playMode 播放模式，接受值 forwards 和 fallbacks ，默认值 forwards。
   * @property startFrame 单个循环周期内开始播放的帧数，默认值 0
   * @property endFrame 单个循环周期内结束播放的帧数，默认值 0
   * @property loopStartFrame 循环播放的开始帧，仅影响第一个周期的开始帧，默认值 0
   */
  public async setConfig(
    options: string | PlayerConfigOptions,
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ): Promise<void> {
    const config: PlayerConfigOptions =
      typeof options === "string" ? { container: options } : options;

    this.config.register(config);
    this.animator = new Animator();
    // 监听容器是否处于浏览器视窗内
    // this.setIntersectionObserver()
    await this.painter.register(config.container, config.secondary, component);
  }

  /**
   * 更新配置
   * @param key
   * @param value
   */
  public setItem<T extends keyof PlayerConfig>(
    key: T,
    value: PlayerConfig[T]
  ): void {
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
  public mount(videoEntity: PlatformVideo.Video): Promise<void[]> {
    if (!videoEntity) throw new Error("videoEntity undefined");

    const { images, filename } = videoEntity;

    this.animator!.stop();
    this.painter.clearSecondary();
    this.painter.clearMaterials();
    this.painter.updateDynamicImages(videoEntity.dynamicElements);
    this.entity = videoEntity;

    return this.painter.loadImages(images, filename);
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
    this.painter.clearContainer();
    this.painter.clearSecondary();
    this.onStop?.();
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.animator!.stop();
    this.painter.destroy();
    this.animator = null;
    this.entity = void 0;
  }

  /**
   * 跳转到指定帧
   * @param frame 目标帧
   * @param andPlay 是否立即播放
   */
  public stepToFrame(frame: number, andPlay = false) {
    if (!this.entity || frame < 0 || frame >= this.entity.frames) return;

    this.pause();
    this.config.loopStartFrame = frame;
    if (andPlay) {
      this.start();
    }
  }

  /**
   * 跳转到指定百分比
   * @param percent 目标百分比
   * @param andPlay 是否立即播放
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
    const { entity, config, animator, painter } = this;
    const { now } = platform;
    const { fillMode, playMode, contentMode } = config;
    const {
      currFrame,
      startFrame,
      endFrame,
      totalFrame,
      spriteCount,
      aniConfig,
    } = config.getConfig(entity!);
    const { duration, loopStart, loop, fillValue } = aniConfig;
    const isReverseMode = playMode === PLAYER_PLAY_MODE.FALLBACKS;

    // 当前帧
    let currentFrame = currFrame;
    // 片段绘制结束位置
    let tail = 0;
    let nextTail: number;
    // 上一帧
    let latestFrame: number;
    // 下一帧
    let nextFrame: number;
    // 精确帧
    let exactFrame: number;
    // 当前已完成的百分比
    let percent: number;
    // 当前需要绘制的百分比
    // let partialDrawPercent: number;
    // 是否还有剩余时间
    let hasRemained: boolean;

    // 更新动画基础信息
    animator!.setConfig(duration, loopStart, loop, fillValue);
    painter.resize(contentMode, entity!.size);

    // 分段渲染函数
    const MAX_DRAW_TIME_PER_FRAME = 8;
    const MAX_ACCELERATE_DRAW_TIME_PER_FRAME = 3;
    const MAX_DYNAMIC_CHUNK_SIZE = 34;
    const MIN_DYNAMIC_CHUNK_SIZE = 1;
    // 动态调整每次绘制的块大小
    let dynamicChunkSize = 4; // 初始块大小
    let startTime: number;
    let chunk: number;
    let elapsed: number;
    // 使用`指数退避算法`平衡渲染速度和流畅度
    const patchDraw = (before: () => void) => {
      startTime = now();
      before();

      while (tail < spriteCount) {
        // 根据当前块大小计算nextTail
        chunk = Math.min(dynamicChunkSize, spriteCount - tail);
        nextTail = (tail + chunk) | 0;
        painter.draw(entity!, currentFrame, tail, nextTail);
        tail = nextTail;
        // 动态调整块大小
        elapsed = now() - startTime;

        if (elapsed < MAX_ACCELERATE_DRAW_TIME_PER_FRAME) {
          dynamicChunkSize = Math.min(
            dynamicChunkSize * 2,
            MAX_DYNAMIC_CHUNK_SIZE
          ); // 加快绘制
        } else if (elapsed > MAX_DRAW_TIME_PER_FRAME) {
          dynamicChunkSize = Math.max(
            dynamicChunkSize / 2,
            MIN_DYNAMIC_CHUNK_SIZE
          ); // 减慢绘制
          break;
        }
      }
    };

    // const TAIL_THRESHOLD_FACTOR = 1.05;
    // const TAIL_OFFSET = 2;
    // let partialDrawPercent = 0;
    // // 普通模式
    // const patchDraw = (before: () => void) => {
    //   before();
    //   if (tail < spriteCount) {
    //     // 1.15 和 2 均为阔值，保证渲染尽快完成
    //     nextTail = hasRemained
    //       ? Math.min(
    //           (spriteCount * partialDrawPercent * TAIL_THRESHOLD_FACTOR +
    //             TAIL_OFFSET) | 0,
    //           spriteCount
    //         )
    //       : spriteCount;

    //     if (nextTail > tail) {
    //       painter.draw(entity!, currentFrame, tail, nextTail);
    //       tail = nextTail;
    //     }
    //   }
    // };

    // 动画绘制过程
    animator!.onUpdate = (timePercent: number) => {
      // benchmark.time("partial updated", () => {
      patchDraw(() => {
        percent = isReverseMode ? 1 - timePercent : timePercent;
        exactFrame = percent * totalFrame;

        if (isReverseMode) {
          nextFrame =
            (timePercent === 0 ? endFrame : Math.ceil(exactFrame)) - 1;
          // partialDrawPercent = Math.abs(1 - exactFrame + currentFrame);
          // FIXME: 倒序会有一帧的偏差，需要校准当前帧
          percent = currentFrame / totalFrame;
        } else {
          nextFrame = timePercent === 1 ? startFrame : Math.floor(exactFrame);
          // partialDrawPercent = Math.abs(exactFrame - currentFrame);
        }

        hasRemained = currentFrame === nextFrame;
      });
      // });

      if (hasRemained) return;

      painter.clearContainer();
      painter.stick();
      painter.clearSecondary();
      latestFrame = currentFrame;
      currentFrame = nextFrame;
      tail = 0;
      this.onProcess?.(~~(percent * 100) / 100, latestFrame);
    };
    animator!.onStart = () => {
      entity!.locked = true;
    };
    animator!.onEnd = () => {
      entity!.locked = false;
      // 如果不保留最后一帧渲染，则清空画布
      if (fillMode === PLAYER_FILL_MODE.NONE) {
        painter.clearContainer();
      }

      this.onEnd?.();
    };
    animator!.start();
  }
}
