export declare class UserMedia {
    /**
     * 媒体流
     */
    private stream;
    /**
     * 视频元素
     */
    private videoElement;
    /**
     * 媒体约束条件
     */
    private constraints;
    /**
     * 创建一个用户媒体管理器
     * @param videoElement 视频元素
     */
    constructor(videoElement: HTMLVideoElement);
    /**
     * 设置媒体约束条件
     * @param constraints 媒体约束条件
     */
    setConstraints(constraints: MediaStreamConstraints): void;
    /**
     * 设置使用前置或后置摄像头
     * @param useFront 是否使用前置摄像头
     */
    setFacingMode(useFront: boolean): void;
    /**
     * 设置视频分辨率
     * @param width 宽度
     * @param height 高度
     */
    setResolution(width: number, height: number): void;
    /**
     * 启动摄像头并播放视频
     * @returns Promise<MediaStream> 媒体流
     */
    start(): Promise<MediaStream>;
    /**
     * 停止摄像头
     */
    stop(): void;
    hasEnoughData(): boolean;
    /**
     * 切换摄像头（前置/后置）
     * @returns Promise<MediaStream> 新的媒体流
     */
    switchCamera(): Promise<MediaStream>;
    /**
     * 获取当前媒体流
     * @returns MediaStream | null 当前媒体流
     */
    getStream(): MediaStream | null;
    /**
     * 获取视频轨道的能力信息
     * @returns MediaTrackCapabilities | null 能力信息
     */
    getCapabilities(): MediaTrackCapabilities | null;
    /**
     * 获取可用的媒体设备列表
     * @returns Promise<MediaDeviceInfo[]> 设备列表
     */
    static getDevices(): Promise<MediaDeviceInfo[]>;
    /**
     * 将流绑定到视频元素
     * @private
     */
    private attachStreamToVideo;
}
