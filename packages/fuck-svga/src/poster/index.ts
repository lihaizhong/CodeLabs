import { getDataURLFromImageData } from "../helper";
import { Painter } from "../painter";

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
  public readonly painter: Painter;

  constructor(width: number, height: number) {
    this.painter = new Painter("poster", width, height);
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

    return this.painter.register(config.container, '', component);
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
  public mount(videoEntity: Video): Promise<void[]> {
    if (!videoEntity) {
      throw new Error("videoEntity undefined");
    }

    const { images, filename } = videoEntity;

    this.painter.clearContainer();
    this.painter.clearMaterials();
    this.painter.updateDynamicImages(videoEntity.dynamicElements);
    this.entity = videoEntity;

    return this.painter.loadImages(images, filename);
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

    const { painter, entity, contentMode, frame, onStart, onEnd } = this;

    onStart?.();
    painter.resize(contentMode, entity!.size);
    painter.draw(entity!, frame, 0, entity!.sprites.length);
    onEnd?.();
  }

  /**
   * 获取海报元数据
   * @returns 
   */
  public toDataURL(): string {
    return getDataURLFromImageData(this.painter.getImageData());
  }

  /**
   * 销毁海报
   */
  public destroy(): void {
    this.painter.destroy();
    this.entity = undefined;
  }
}
