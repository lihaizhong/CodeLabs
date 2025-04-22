import { QRCodeResult, SplitConfig } from "./media-parser";
export declare class Scanner {
    /**
     * 媒体解析器
     */
    private mediaParser;
    /**
     * 轮询器
     */
    private poll;
    /**
     * 视频元素
     */
    private videoElement;
    /**
     * 图像元素
     */
    private imageElement;
    /**
     * 扫描结果回调函数
     */
    private onResult;
    /**
     * 扫描配置
     */
    private scanConfig;
    /**
     * 版本号
     */
    version: string;
    /**
     * 创建一个二维码轮询扫描器
     * @param onResult 扫描结果回调函数
     * @param interval 轮询间隔（毫秒），默认100ms
     */
    constructor(onResult: (results: QRCodeResult[]) => void, interval?: number);
    /**
     * 设置要扫描的视频元素
     * @param element HTML视频元素
     */
    setVideoElement(element: HTMLVideoElement): void;
    /**
     * 设置要扫描的图像元素
     * @param element HTML图像元素
     */
    setImageElement(element: HTMLImageElement): void;
    /**
     * 设置扫描配置
     * @param config 扫描配置
     */
    setScanConfig(config: SplitConfig): void;
    /**
     * 设置轮询间隔
     * @param interval 轮询间隔（毫秒）
     */
    setInterval(interval: number): void;
    /**
     * 开始轮询扫描
     */
    start(): void;
    /**
     * 停止轮询扫描
     */
    stop(): void;
    /**
     * 执行一次扫描
     * @returns 扫描结果
     */
    private scan;
}
