import { Renderer2D } from "../extensions";
import { ResourceManager } from "../extensions";
import { getBufferFromImageData, getDataURLFromImageData } from "../helper";
import { Painter } from "../painter";

export class Poster {
  /**
   * SVGA 元数据
   * Video Entity
   */
  private entity: PlatformVideo.Video | undefined;

  /**
   * 当前的帧，默认值 0
   */
  private frame: number = 0;

  /**
   * 填充模式，类似于 content-mode。
   */
  private contentMode = PLAYER_CONTENT_MODE.FILL;

  /**
   * 是否配置完成
   */
  private isConfigured = false;

  private imageData: ImageData | null = null;

  /**
   * 刷头实例
   */
  public readonly painter: Painter;

  public resource: ResourceManager | null = null;

  private renderer: Renderer2D | null = null;

  constructor(width: number, height: number) {
    this.painter = new Painter("poster", width, height);
  }

  private async register(selector: string = "", component?: any): Promise<void> {
    await this.painter.register(selector, "", component);
    this.renderer = new Renderer2D(this.painter.YC!);
    this.resource = new ResourceManager(this.painter);
  }

  /**
   * 设置配置项
   * @param options 可配置项
   */
  public async setConfig(
    options: string | PosterConfig = {},
    component?: any
  ): Promise<void> {
    const config: PosterConfig =
      typeof options === "string" ? { container: options } : options;

    if (config.container === undefined) {
      config.container = "";
    }

    if (config.contentMode !== undefined) {
      this.contentMode = config.contentMode;
    }

    this.frame = typeof config.frame === "number" ? config.frame : 0;
    this.isConfigured = true;
    await this.register(config.container, component);
  }

  /**
   * 修改内容模式
   * @param contentMode
   */
  public setContentMode(
    contentMode: PLAYER_CONTENT_MODE
  ): void {
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
  public async mount(videoEntity: PlatformVideo.Video): Promise<void> {
    if (!videoEntity) {
      throw new Error("videoEntity undefined");
    }

    if (!this.isConfigured) {
      await this.register();
      this.isConfigured = true;
    }

    const { images, filename } = videoEntity;

    this.painter.clearContainer();
    this.resource!.release();
    this.entity = videoEntity;

    await this.resource!.loadImagesWithRecord(images, filename);
  }

  /**
   * 绘制海报
   */
  public draw(): void {
    if (!this.entity) return;

    const { painter, renderer, resource, entity, contentMode, frame } = this;

    renderer!.resize(contentMode, entity!.size, painter.X!);
    renderer!.render(
      entity!,
      resource!.materials,
      resource!.dynamicMaterials,
      frame,
      0,
      entity!.sprites.length
    );
    this.imageData = painter.XC!.getImageData(0, 0, painter.W, painter.H);
  }

  public toBuffer() {
    if (this.imageData === null) {
      throw new Error("please call the draw method first.")
    }

    return getBufferFromImageData(this.imageData);
  }

  /**
   * 获取海报元数据
   * @returns
   */
  public toDataURL(): string {
    if (this.imageData === null) {
      throw new Error("please call the draw method first.")
    }

    return getDataURLFromImageData(this.imageData)
  }

  /**
   * 销毁海报
   */
  public destroy(): void {
    this.painter.destroy();
    this.renderer?.destroy();
    this.resource?.release();
    this.resource?.cleanup();
    this.entity = undefined;
  }
}
