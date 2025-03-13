import { Brush } from "../player/brush";
import benchmark from "../benchmark";
import { loadImage } from "../polyfill";

export class Poster {
  /**
   * SVGA 元数据
   * Video Entity
   */
  private entity: Video | undefined = undefined;

  private currFrame: number = 0;

  private brush = new Brush("poster");

  /**
   * 设置配置项
   * @param container canvas selector
   */
  public setConfig(
    container: string,
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ): Promise<void> {
    return this.brush.register(container, '', component);
  }

  /**
   * 装载 SVGA 数据元
   * @param videoEntity SVGA 数据源
   * @param currFrame
   * @returns
   */
  public mount(videoEntity: Video, currFrame?: number): Promise<void | void[]> {
    if (!videoEntity) {
      throw new Error("videoEntity undefined");
    }

    const { images, filename } = videoEntity;

    this.entity = videoEntity;
    this.currFrame = currFrame || 0;
    this.brush.clearSecondary();

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
    benchmark.time(
      "render",
      () => {
        this.brush.clearSecondary();
        this.brush.fitSize(PLAYER_CONTENT_MODE.FILL, this.entity!.size);
        this.brush.draw(this.entity!, this.currFrame, 0, this.entity!.sprites.length);
        this.brush.stick();
      }
    );
  }

  /**
   * 清理海报
   */
  public clear(): void {
    this.brush.clearContainer();
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
