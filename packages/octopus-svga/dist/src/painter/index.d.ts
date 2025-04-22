type PaintMode = "poster" | "animation";
export declare class Painter {
    private readonly mode;
    /**
     * 主屏的 Canvas 元素
     * Main Screen
     */
    private X;
    /**
     * 主屏的 Context 对象
     * Main Context
     */
    private XC;
    /**
     * 副屏的 Canvas 元素
     * Secondary Screen
     */
    private Y;
    /**
     * 副屏的 Context 对象
     * Secondary Context
     */
    private YC;
    /**
     * 画布的宽度
     */
    private W;
    /**
     * 画布的高度
     */
    private H;
    /**
     * 粉刷模式
     */
    private model;
    private IM;
    private lastResizeKey;
    private lastTransform?;
    globalTransform?: Transform;
    /**
     *
     * @param mode
     *  - poster: 海报模式
     *  - animation: 动画模式
     *  - 默认为 animation
     * @param W 海报模式必须传入
     * @param H 海报模式必须传入
     */
    constructor(mode?: PaintMode, width?: number, height?: number);
    private setModel;
    /**
     * 注册画笔，根据环境判断生成最优的绘制方式
     * @param selector
     * @param ofsSelector
     * @param component
     */
    register(selector: string, ofsSelector?: string, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<void>;
    /**
     * 更新动态图片集
     * @param images
     */
    updateDynamicImages(images: PlatformImages): void;
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    loadImages(images: RawImages, filename: string): Promise<void[]>;
    /**
     * 创建图片标签
     * @returns
     */
    createImage(): PlatformImage;
    /**
     * 生成图片
     * @returns
     */
    getImageData(): ImageData;
    /**
     * 计算缩放比例
     * @param contentMode
     * @param videoSize
     * @returns
     */
    private calculateScale;
    /**
     * 调整画布尺寸
     * @param contentMode
     * @param videoSize
     * @returns
     */
    resize(contentMode: PLAYER_CONTENT_MODE, videoSize: VideoSize): void;
    /**
     * 注册刷新屏幕的回调函数
     * @param cb
     */
    flush(cb: () => void): void;
    clearContainer: () => void;
    clearSecondary: () => void;
    /**
     * 清理素材库
     */
    clearMaterials(): void;
    /**
     * 绘制图片片段
     * @param videoEntity
     * @param currentFrame
     * @param start
     * @param end
     */
    draw(videoEntity: Video, currentFrame: number, start: number, end: number): void;
    stick(): void;
    /**
     * 销毁画笔
     */
    destroy(): void;
}
export {};
