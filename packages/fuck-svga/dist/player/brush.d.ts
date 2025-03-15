type TBrushMode = "poster" | "animation";
export declare class Brush {
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
     * canvas宽度
     */
    private W;
    /**
     * canvas高度
     */
    private H;
    /**
     * 粉刷模式
     */
    private model;
    private IM;
    globalTransform?: GlobalTransform;
    constructor(mode?: TBrushMode);
    private setModel;
    /**
     * 注册画笔，根据环境判断生成最优的绘制方式
     * @param selector
     * @param ofsSelector
     * @param component
     */
    register(selector: string, ofsSelector?: string, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<void>;
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    loadImages(images: RawImages, filename: string): Promise<void>;
    /**
     * 创建图片标签
     * @returns
     */
    createImage(): PlatformImage;
    /**
     * 生成图片
     * @param type
     * @param encoderOptions
     * @returns
     */
    getImage(type?: string, encoderOptions?: number): string;
    getRect(): ViewportRect;
    fitSize(contentMode: PLAYER_CONTENT_MODE, videoSize: ViewportRect): void;
    /**
     * 注册刷新屏幕的回调函数
     * @param cb
     */
    flush(cb: () => void): void;
    /**
     * 清理素材库
     */
    clearMaterials(): void;
    clearContainer: () => void;
    clearSecondary: () => void;
    /**
     * 绘制图片片段
     * @param videoEntity
     * @param currentFrame
     * @param start
     * @param end
     */
    draw(videoEntity: Video, currentFrame: number, start: number, end: number): void;
    stick: () => void;
    /**
     * 销毁画笔
     */
    destroy(): void;
}
export {};
