import { getDataURLFromImageData } from "../helper";
import { Brush } from "../player/brush";

export class Poster {
  /**
   * SVGA 元数据
   * Video Entity
   */
  private entity: Video | undefined = undefined;

  /**
   * 当前的帧，默认值 0
   */
  private frame: number = 0;

  /**
   * 填充模式，类似于 content-mode。
   */
  private contentMode = PLAYER_CONTENT_MODE.FILL;

  /**
   * 刷头实例
   */
  public readonly brush: Brush;

  constructor(width: number, height: number) {
    this.brush = new Brush("poster", width, height);
  }

  /**
   * 设置配置项
   * @param options 可配置项
   */
  public setConfig(
    options: string | PosterConfig,
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ): Promise<void> {
    let config: PosterConfig;

    if (typeof options === "string") {
      config = { container: options };
    } else {
      config = options;
    }

    if (config.contentMode) {
      this.contentMode = config.contentMode;
    }

    if (typeof config.frame === 'number') {
      this.frame = config.frame;
    } else {
      this.frame = 0
    }

    return this.brush.register(config.container, '', component);
  }

  public setContentMode(contentMode: PLAYER_CONTENT_MODE): void {
    this.contentMode = contentMode;
  }

  /**
   * 装载 SVGA 数据元
   * @param videoEntity SVGA 数据源
   * @param currFrame
   * @returns
   */
  public mount(videoEntity: Video): Promise<void | void[]> {
    if (!videoEntity) {
      throw new Error("videoEntity undefined");
    }

    const { images, filename } = videoEntity;

    this.brush.clearContainer();
    this.brush.clearMaterials();
    this.brush.updateDynamicImages(videoEntity.dynamicElements);
    this.entity = videoEntity;

    return this.brush.loadImages(images, filename);
  }

  /**
   * 开始绘画事件回调
   */
  public onStart?: PosterEventCallback;

  /**
   * 结束绘画事件回调
   */
  public onEnd?: PosterEventCallback;

  /**
   * 绘制海报
   */
  public draw(): void {
    if (!this.entity) return;

    const { brush, entity, contentMode, frame, onStart, onEnd } = this;

    onStart?.();
    brush.resize(contentMode, entity!.size);
    brush.draw(entity!, frame, 0, entity!.sprites.length);
    onEnd?.();
  }

  /**
   * 获取海报元数据
   * @returns 
   */
  public toDataURL(): string {
    return getDataURLFromImageData(this.brush.getImageData());
  }

  /**
   * 销毁海报
   */
  public destroy(): void {
    this.brush.destroy();
    this.entity = undefined;
  }
}
