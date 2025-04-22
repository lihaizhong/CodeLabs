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

  private isConfigured = false;

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
    options: string | PosterConfig = {},
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ): Promise<void> {
    const config: PosterConfig = typeof options === "string" ? { container: options } : options;

    if (config.container === undefined) {
      config.container = "";
    }

    if (config.contentMode !== undefined) {
      this.contentMode = config.contentMode;
    }

    this.frame = typeof config.frame === 'number' ? config.frame : 0;

    this.isConfigured = true;
    return this.painter.register(config.container, '', component);
  }

  /**
   * 修改内容模式
   * @param contentMode 
   */
  public setContentMode(contentMode: PLAYER_CONTENT_MODE): void {
    this.contentMode = contentMode;
  }

  /**
   * 设置当前帧
   * @param frame
   */
  public setFrame(frame: number): void {
    this.frame = frame;
  }

  /**
   * 装载 SVGA 数据元
   * @param videoEntity SVGA 数据源
   * @param currFrame
   * @returns
   */
  public async mount(videoEntity: Video): Promise<void[]> {
    if (!videoEntity) {
      throw new Error("videoEntity undefined");
    }

    if (!this.isConfigured) {
      this.painter.register('', '', null);
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
