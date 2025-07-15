import { Renderer2D, ResourceManager } from "../../extensions";
import { Painter } from "../painter";
import {
  type PlatformVideo,
  type PosterConfig,
  type PosterConfigOptions,
  PLAYER_CONTENT_MODE,
} from "../../types";

export class Poster {
  /**
   * SVGA 元数据
   * Video Entity
   */
  private entity: PlatformVideo.Video | undefined;

  /**
   * 海报配置项
   */
  private readonly config: PosterConfig = {
    /**
     * 主屏，绘制海报的 Canvas 元素
     */
    container: "",
    /**
     * 填充模式，类似于 content-mode。
     */
    contentMode: PLAYER_CONTENT_MODE.FILL,
    /**
     * 绘制成海报的帧，默认是0。
     */
    frame: 0,
  };

  /**
   * 是否配置完成
   */
  private isConfigured = false;

  /**
   * 刷头实例
   */
  public readonly painter: Painter;

  /**
   * 资源管理器
   */
  public resource: ResourceManager | null = null;

  /**
   * 渲染器实例
   */
  private renderer: Renderer2D | null = null;

  constructor(width: number, height: number) {
    this.painter = new Painter("poster", width, height);
  }

  /**
   * 注册 SVGA 海报
   * @param selector 容器选择器
   * @param component 组件
   */
  private async register(
    selector: string = "",
    component?: any
  ): Promise<void> {
    await this.painter.register(selector, "", component);
    this.renderer = new Renderer2D(this.painter.YC!);
    this.resource = new ResourceManager(this.painter);
  }

  /**
   * 设置配置项
   * @param options 可配置项
   */
  public async setConfig(
    options: string | PosterConfigOptions = {},
    component?: any
  ): Promise<void> {
    if (typeof options === "string") {
      this.config.container = options;
    } else {
      Object.assign(this.config, options);
    }

    this.isConfigured = true;
    await this.register(this.config.container, component);
  }

  /**
   * 修改内容模式
   * @param contentMode
   */
  public setContentMode(contentMode: PLAYER_CONTENT_MODE): void {
    this.config.contentMode = contentMode;
  }

  /**
   * 设置当前帧
   * @param frame
   */
  public setFrame(frame: number): void {
    this.config.frame = frame;
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

    const { painter, renderer, resource, entity, config } = this;

    renderer!.resize(config.contentMode, entity!.size, painter.X!);
    renderer!.render(
      entity!,
      resource!.materials,
      resource!.dynamicMaterials,
      config.frame,
      0,
      entity!.sprites.length
    );
  }

  /**
   * 获取海报的 ImageData 数据
   */
  public toImageData(): ImageData {
    const { XC: context, W: width, H: height } = this.painter;

    return context!.getImageData(0, 0, width, height);
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
