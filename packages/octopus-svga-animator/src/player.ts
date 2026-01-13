import type { PlatformCanvas } from "octopus-svga-engine";
import {
  Painter,
  ResourceManager,
  Animator,
  platform,
} from "octopus-svga-engine";
import type {
  PlatformVideo,
  PlayerConfigOptions,
  PlayerConfig,
  PlayerEventCallback,
  PlayerProcessEventCallback,
} from "octopus-svga-engine";
import {
  PLAYER_PLAY_MODE,
  PLAYER_FILL_MODE,
  PLAYER_CONTENT_MODE,
} from "octopus-svga-engine";
import {
  DynamicElementManager,
  TextOptions,
  QRCodeOptions,
  CanvasOptions,
} from "./dynamic-element";

/**
 * SVGA 播放器
 */
export class Player {
  /**
   * SVGA 元数据
   */
  private entity: PlatformVideo.Video | undefined;

  /**
   * 当前配置项
   */
  private config: PlayerConfig = {
    loop: 0,
    fillMode: PLAYER_FILL_MODE.FORWARDS,
    playMode: PLAYER_PLAY_MODE.FORWARDS,
    contentMode: PLAYER_CONTENT_MODE.ASPECT_FIT,
    startFrame: 0,
    endFrame: 0,
    loopStartFrame: 0,
  };

  /**
   * 资源管理器
   */
  public resource: ResourceManager | null = null;

  /**
   * 画布渲染器
   */
  public readonly painter = new Painter();

  /**
   * 动画控制器
   */
  private readonly animator: Animator = new Animator();

/**
   * 动态元素管理器
   */
  private dynamicElementManager: DynamicElementManager | null = null;

  /**
   * 设置配置项
   * @param options 可配置项
   * @param component 组件对象（小程序中使用）
   */
  public async setConfig(
    options: string | PlayerConfigOptions,
    component?: any
  ): Promise<void> {
    const config: PlayerConfigOptions =
      typeof options === "string" ? { container: options } : options;
    const { container, secondary } = config;

    // 合并配置
    Object.assign(this.config, config);

    // 注册画布
    await this.painter.register(container, secondary, component);

    // 创建资源管理器
    this.resource = new ResourceManager(this.painter);

    // 创建动态元素管理器
    this.dynamicElementManager = new DynamicElementManager(this.painter);

    // 设置动画帧回调
    this.animator.onAnimate = platform.rAF.bind(
      null,
      this.painter.F as PlatformCanvas
    );
  }

  /**
   * 更新配置项
   * @param key 配置项键
   * @param value 配置项值
   */
  public setItem<T extends keyof PlayerConfig>(
    key: T,
    value: PlayerConfig[T]
  ): void {
    this.config[key] = value;
  }

  /**
   * 装载 SVGA 数据
   * @param videoEntity SVGA 数据源
   * @returns Promise<void>
   */
  public async mount(videoEntity: PlatformVideo.Video): Promise<void> {
    if (!videoEntity) throw new Error("videoEntity undefined");

    const { images, filename } = videoEntity;

    // 停止动画
    this.animator.stop();

    // 清空画布
    this.painter.clearSecondary();

    // 释放资源
    this.resource?.release();

    // 保存实体
    this.entity = videoEntity;

    // 加载图片资源
    if (this.resource) {
      await this.resource.loadImagesWithRecord(images, filename);
    }
  }

  /**
   * 开始播放事件回调
   */
  public onStart?: PlayerEventCallback;
  /**
   * 重新播放事件回调
   */
  public onResume?: PlayerEventCallback;
  /**
   * 暂停播放事件回调
   */
  public onPause?: PlayerEventCallback;
  /**
   * 停止播放事件回调
   */
  public onStop?: PlayerEventCallback;
  /**
   * 播放中事件回调
   * @param percent 播放进度 (0-1)
   * @param frame 当前帧数
   */
  public onProcess?: PlayerProcessEventCallback;
  /**
   * 结束播放事件回调
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
    if (this.animator.resume()) {
      this.onResume?.();
    }
  }

  /**
   * 暂停播放
   */
  public pause(): void {
    if (this.animator.pause()) {
      this.onPause?.();
    }
  }

  /**
   * 停止播放
   */
  public stop(): void {
    this.animator.stop();
    this.painter.clearContainer();
    this.painter.clearSecondary();
    this.onStop?.();
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.animator.stop();
    this.painter.destroy();
    this.resource?.release();
    this.resource?.cleanup();
    this.entity = undefined;
  }

  /**
   * 跳转到指定帧
   * @param frame 目标帧
   * @param andPlay 是否立即播放
   */
  public stepToFrame(frame: number, andPlay = false): void {
    if (!this.entity || frame < 0 || frame >= this.entity.frames) return;

    this.pause();
    this.config.loopStartFrame = frame;
    if (andPlay) {
      this.start();
    }
  }

  /**
   * 跳转到指定百分比
   * @param percent 目标百分比 (0-1)
   * @param andPlay 是否立即播放
   */
  public stepToPercentage(percent: number, andPlay = false): void {
    if (!this.entity) return;

    const { frames } = this.entity;
    let frame = percent < 0 ? 0 : Math.round(percent * frames);

    if (frame >= frames) {
      frame = frames - 1;
    }

    this.stepToFrame(frame, andPlay);
  }

  /**
   * 替换指定 key 的图片
   * @param key 动态元素的 key
   * @param source 图片源（URL 或 Uint8Array）
   * @returns Promise<Bitmap>
   */
  public async setImage(key: string, source: string | Uint8Array) {
    if (!this.dynamicElementManager) {
      throw new Error("Dynamic element manager not initialized");
    }

    const bitmap = await this.dynamicElementManager.setImage(key, source);

    // 将动态素材添加到 ResourceManager
    if (this.resource) {
      this.resource.dynamicMaterials.set(key, bitmap);
    }

    return bitmap;
  }

  /**
   * 添加动态文本
   * @param key 动态元素的 key
   * @param text 文本内容
   * @param options 文本选项
   * @returns Promise<Bitmap>
   */
  public async setText(key: string, text: string, options?: TextOptions) {
    if (!this.dynamicElementManager) {
      throw new Error("Dynamic element manager not initialized");
    }

    const bitmap = await this.dynamicElementManager.setText(key, text, options);

    // 将动态素材添加到 ResourceManager
    if (this.resource) {
      this.resource.dynamicMaterials.set(key, bitmap);
    }

    return bitmap;
  }

  /**
   * 添加二维码
   * @param key 动态元素的 key
   * @param content 二维码内容
   * @param options 二维码选项
   * @returns Promise<Bitmap>
   */
  public async setQRCode(key: string, content: string, options?: QRCodeOptions) {
    if (!this.dynamicElementManager) {
      throw new Error("Dynamic element manager not initialized");
    }

    const bitmap = await this.dynamicElementManager.setQRCode(key, content, options);

    // 将动态素材添加到 ResourceManager
    if (this.resource) {
      this.resource.dynamicMaterials.set(key, bitmap);
    }

    return bitmap;
  }

  /**
   * 添加自定义画布内容
   * @param key 动态元素的 key
   * @param context 画布上下文
   * @param options 画布选项
   * @returns Promise<Bitmap>
   */
  public async setCanvas(
    key: string,
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    options?: CanvasOptions
  ) {
    if (!this.dynamicElementManager) {
      throw new Error("Dynamic element manager not initialized");
    }

    const bitmap = await this.dynamicElementManager.setCanvas(key, context, options);

    // 将动态素材添加到 ResourceManager
    if (this.resource) {
      this.resource.dynamicMaterials.set(key, bitmap);
    }

    return bitmap;
  }

  /**
   * 移除动态素材
   * @param key 动态元素的 key
   */
  public removeDynamicElement(key: string): void {
    if (!this.dynamicElementManager) {
      return;
    }

    this.dynamicElementManager.remove(key);
    if (this.resource) {
      this.resource.dynamicMaterials.delete(key);
    }
  }

  /**
   * 清空所有动态素材
   */
  public clearDynamicElements(): void {
    if (!this.dynamicElementManager) {
      return;
    }

    this.dynamicElementManager.clear();
    if (this.resource) {
      this.resource.dynamicMaterials.clear();
    }
  }

  /**
   * 开始绘制动画
   */
  private startAnimation(): void {
    const { entity, config, animator, painter, resource } = this;
    if (!entity || !resource) return;

    const { materials, dynamicMaterials } = resource;
    const { fillMode, playMode, contentMode } = config;

    // 计算帧范围
    const totalFrames = entity.frames;
    const startFrame = config.startFrame || 0;
    const endFrame = config.endFrame || totalFrames - 1;
    const loopStartFrame = config.loopStartFrame || 0;

    // 计算有效帧数
    const effectiveFrames = endFrame - startFrame + 1;
    const spriteCount = entity.sprites.length;

    // 计算动画时长（毫秒）
    const duration = (effectiveFrames / entity.fps) * 1000;
    const loopDuration = config.loop === 0 ? Infinity : duration * config.loop;
    const loopStartOffset = (loopStartFrame / totalFrames) * duration;

    // 当前帧
    let currentFrame = startFrame;
    // 片段绘制结束位置
    let tail = 0;
    // 上一帧
    let latestFrame: number;
    // 下一帧
    let nextFrame: number;
    // 精确帧
    let exactFrame: number;
    // 当前百分比
    let percent: number;
    // 是否还有剩余时间
    let hasRemained: boolean;

    // 更新动画配置
    animator.setConfig(duration, loopStartOffset, config.loop, 0);
    painter.resize(contentMode, entity.size);

    // 分段渲染函数
    const MAX_DRAW_TIME_PER_FRAME = 8;
    const MAX_ACCELERATE_DRAW_TIME_PER_FRAME = 3;
    const MAX_DYNAMIC_CHUNK_SIZE = 34;
    const MIN_DYNAMIC_CHUNK_SIZE = 1;

    const render = (head: number, tail: number) =>
      painter.draw(
        entity,
        materials,
        dynamicMaterials,
        currentFrame,
        head,
        tail
      );

    // 动态调整每次绘制的块大小
    let dynamicChunkSize = 4;
    let startTime: number;
    let chunk: number;
    let elapsed: number;

    // 使用指数退避算法平衡渲染速度和流畅度
    const patchDraw = (before: () => void) => {
      startTime = platform.now();
      before();

      while (tail < spriteCount) {
        chunk = Math.min(dynamicChunkSize, spriteCount - tail);
        const nextTail = (tail + chunk) | 0;
        render(tail, nextTail);
        tail = nextTail;

        elapsed = platform.now() - startTime;

        if (elapsed < MAX_ACCELERATE_DRAW_TIME_PER_FRAME) {
          dynamicChunkSize = Math.min(
            dynamicChunkSize * 2,
            MAX_DYNAMIC_CHUNK_SIZE
          );
        } else if (elapsed > MAX_DRAW_TIME_PER_FRAME) {
          dynamicChunkSize = Math.max(
            dynamicChunkSize / 2,
            MIN_DYNAMIC_CHUNK_SIZE
          );
          break;
        }
      }
    };

    // 动画绘制过程
    animator.onUpdate = (timePercent: number) => {
      patchDraw(() => {
        percent = playMode === PLAYER_PLAY_MODE.FALLBACKS
          ? 1 - timePercent
          : timePercent;
        exactFrame = percent * effectiveFrames;

        if (playMode === PLAYER_PLAY_MODE.FALLBACKS) {
          nextFrame =
            (timePercent === 0 ? endFrame : Math.ceil(exactFrame)) - 1;
          percent = currentFrame / totalFrames;
        } else {
          nextFrame =
            timePercent === 1 ? startFrame : Math.floor(exactFrame);
        }

        hasRemained = currentFrame === nextFrame;
      });

      if (hasRemained) return;

      if (tail < spriteCount) {
        render(tail, spriteCount);
      }

      painter.clearContainer();
      painter.stick();
      painter.clearSecondary();
      latestFrame = currentFrame;
      currentFrame = nextFrame;
      tail = 0;
      this.onProcess?.(~~(percent * 100) / 100, latestFrame);
    };

    animator.onStart = () => {
      entity.locked = true;
    };

    animator.onEnd = () => {
      entity.locked = false;
      if (fillMode === PLAYER_FILL_MODE.NONE) {
        painter.clearContainer();
      }
      this.onEnd?.();
    };

    animator.start();
  }
}