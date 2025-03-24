export declare class Config {
    /**
     * 最后停留的目标模式，类似于 animation-fill-mode，默认值 forwards。
     */
    fillMode: PLAYER_FILL_MODE;
    /**
     * 播放模式，默认值 forwards
     */
    playMode: PLAYER_PLAY_MODE;
    /**
     * 填充模式，类似于 content-mode。
     */
    contentMode: PLAYER_CONTENT_MODE;
    /**
     * 开始播放的帧数，默认值 0
     */
    startFrame: number;
    /**
     * 结束播放的帧数，默认值 0
     */
    endFrame: number;
    /**
     * 循环播放的开始帧，默认值 0
     */
    loopStartFrame: number;
    /**
     * 循环次数，默认值 0（无限循环）
     */
    loop: number;
    /**
     * 是否开启动画容器视窗检测，默认值 false
     * 开启后利用 Intersection Observer API 检测动画容器是否处于视窗内，若处于视窗外，停止描绘渲染帧避免造成资源消耗
     */
    register(config: Partial<PlayerConfig>): void;
    setItem<T extends keyof PlayerConfig>(key: T, value: PlayerConfig[T]): void;
    getConfig(entity: Video): {
        currFrame: number;
        startFrame: number;
        endFrame: number;
        totalFrame: number;
        spriteCount: number;
        aniConfig: {
            duration: number;
            loopStart: number;
            loop: number;
            fillValue: number;
        };
    };
}
