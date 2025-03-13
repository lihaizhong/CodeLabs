import { Brush } from "../player/brush";
import benchmark from "../benchmark";
import { loadImage } from "../polyfill";

export class Poster {
  /**
   * SVGA 元数据
   * Video Entity
   */
  private entity: Video | undefined = undefined;

  private frame: number = 0;

  private contentMode = PLAYER_CONTENT_MODE.FILL;

  private brush = new Brush("poster");

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
    }

    return this.brush.register(config.container, '', component);
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

    this.entity = videoEntity;
    this.clear();

    return this.brush.loadImage(images, filename);
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
   * 替换元素
   * @param key
   * @param element
   * @returns 
   */
  public setReplaceElement(key: string, element: ReplaceElement): void {
    if (!this.entity) return;

    this.entity!.replaceElements[key] = element;
  }

  /**
   * 通过url替换元素
   * @param key
   * @param url
   * @returns 
   */
  public async setReplaceElementByUrl(key: string, url: string): Promise<void> {
    if (!this.entity) return;

    this.entity!.replaceElements[key] = await loadImage(this.brush, url, url);
  }

  /**
   * 设置动态元素
   * @param key
   * @param element
   * @returns 
   */
  public setDynamicElement(key: string, element: DynamicElement) {
    if (!this.entity) return;

    this.entity!.dynamicElements[key] = element;
  }

  /**
   * 通过url设置动态元素
   * @param key
   * @param url
   * @returns 
   */
  public async setDynamicElementByUrl(key: string, url: string): Promise<void> {
    if (!this.entity) return;

    this.entity!.dynamicElements[key] = await loadImage(this.brush, url, url);
  }

  /**
   * 绘制海报
   */
  public draw(): void {
    const { brush, entity, contentMode, frame } = this;

    benchmark.time(
      "render",
      () => {
        brush.clearSecondary();
        brush.fitSize(contentMode, entity!.size);
        brush.draw(entity!, frame, 0, entity!.sprites.length);
        brush.stick();
      }
    );
  }

  /**
   * 清理海报
   */
  public clear(): void {
    const { brush } = this;

    brush.clearContainer();
    brush.clearSecondary();
    brush.clearMaterials();
  }

  /**
   * 销毁海报
   */
  public destroy(): void {
    this.brush.destroy();
    this.entity = undefined;
  }

  /**
   * 获取海报元数据
   * @param type 
   * @param encoderOptions 
   * @returns 
   */
  public toDataURL(type?: string, encoderOptions?: number): string {
    return this.brush.getImage(type, encoderOptions);
  }
}
