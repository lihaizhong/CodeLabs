export declare class Poster {
    /**
     * SVGA 元数据
     * Video Entity
     */
    private entity;
    private frame;
    private contentMode;
    private brush;
    /**
     * 设置配置项
     * @param options 可配置项
     */
    setConfig(options: string | PosterConfig, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<void>;
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @param currFrame
     * @returns
     */
    mount(videoEntity: Video): Promise<void | void[]>;
    /**
     * 开始绘画事件回调
     */
    onStart?: PosterEventCallback;
    /**
     * 结束绘画事件回调
     */
    onEnd?: PosterEventCallback;
    /**
     * 替换元素
     * @param key
     * @param element
     * @returns
     */
    setReplaceElement(key: string, element: ReplaceElement): void;
    /**
     * 通过url替换元素
     * @param key
     * @param url
     * @returns
     */
    setReplaceElementByUrl(key: string, url: string): Promise<void>;
    /**
     * 设置动态元素
     * @param key
     * @param element
     * @returns
     */
    setDynamicElement(key: string, element: DynamicElement): void;
    /**
     * 通过url设置动态元素
     * @param key
     * @param url
     * @returns
     */
    setDynamicElementByUrl(key: string, url: string): Promise<void>;
    /**
     * 绘制海报
     */
    draw(): void;
    /**
     * 清理海报
     */
    clear(): void;
    /**
     * 销毁海报
     */
    destroy(): void;
    /**
     * 获取海报元数据
     * @param type
     * @param encoderOptions
     * @returns
     */
    toDataURL(type?: string, encoderOptions?: number): string;
}
