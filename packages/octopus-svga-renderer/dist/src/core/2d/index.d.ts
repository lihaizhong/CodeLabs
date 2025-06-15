export interface ICommand {
    command: string;
    args: string;
}
export declare class Renderer2D implements PlatformRenderer {
    private readonly context;
    /**
     * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths
     * 绘制路径的不同指令：
     * * 直线命令
     * - M: moveTo，移动到指定点，不绘制直线。
     * - L: lineTo，从起始点绘制一条直线到指定点。
     * - H: horizontal lineTo，从起始点绘制一条水平线到指定点。
     * - V: vertical lineTo，从起始点绘制一条垂直线到指定点。
     * - Z: closePath，从起始点绘制一条直线到路径起点，形成一个闭合路径。
     * * 曲线命令
     * - C: bezierCurveTo，绘制三次贝塞尔曲线。
     * - S: smooth curveTo，绘制平滑三次贝塞尔曲线。
     * - Q: quadraticCurveTo，绘制两次贝塞尔曲线。
     * - T: smooth quadraticCurveTo，绘制平滑两次贝塞尔曲线。
     * * 弧线命令
     * - A: arcTo，从起始点绘制一条弧线到指定点。
     */
    private static SVG_PATH;
    private static SVG_LETTER_REGEXP;
    private static parseSVGPath;
    private pointPool;
    private globalTransform?;
    constructor(context: PlatformRenderingContext2D);
    private setTransform;
    private fillOrStroke;
    private resetShapeStyles;
    private drawBezier;
    private drawBezierElement;
    private drawEllipse;
    private drawRect;
    private drawShape;
    private drawSprite;
    getGlobalTransform(): PlatformVideo.Transform | undefined;
    setGlobalTransform(transform?: PlatformVideo.Transform): void;
    render(videoEntity: PlatformVideo.Video, materials: Map<string, OctopusPlatform.Bitmap>, dynamicMaterials: Map<string, OctopusPlatform.Bitmap>, currentFrame: number, head: number, tail: number): void;
}
