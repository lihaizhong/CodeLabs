export declare class Painter {
    private readonly mode;
    /**
     * 主屏的 Canvas 元素
     * Main Screen
     */
    X: OctopusPlatform.PlatformCanvas | OctopusPlatform.PlatformOffscreenCanvas | null;
    /**
     * 主屏的 Context 对象
     * Main Context
     */
    XC: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    /**
     * 副屏的 Canvas 元素
     * Secondary Screen
     */
    Y: OctopusPlatform.PlatformCanvas | OctopusPlatform.PlatformOffscreenCanvas | null;
    /**
     * 副屏的 Context 对象
     * Secondary Context
     */
    YC: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    /**
     * 画布的宽度
     */
    W: number;
    /**
     * 画布的高度
     */
    H: number;
    /**
     * 粉刷模式
     */
    private model;
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
    register(selector: string, ofsSelector?: string, component?: any): Promise<void>;
    clearContainer: () => void;
    clearSecondary: () => void;
    stick(): void;
    /**
     * 销毁画笔
     */
    destroy(): void;
}
