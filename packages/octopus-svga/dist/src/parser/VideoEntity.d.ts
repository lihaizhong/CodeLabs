import type { MovieEntity } from "../extensions/svga-decoder";
export declare class VideoEntity implements PlatformVideo.Video {
    /**
     * svga 版本号
     */
    version: string;
    /**
     * svga 文件名
     */
    filename: string;
    /**
     * svga 尺寸
     */
    size: PlatformVideo.VideoSize;
    /**
     * svga 帧率
     */
    fps: number;
    /**
     * 是否可以编辑svga文件
     */
    locked: boolean;
    /**
     * svga 帧数
     */
    frames: number;
    /**
     * svga 二进制图片合集
     */
    images: RawImages;
    /**
     * svga 动态元素
     */
    dynamicElements: PlatformImages;
    /**
     * svga 关键帧信息
     */
    sprites: PlatformVideo.VideoSprite[];
    constructor(movie: MovieEntity, filename: string);
    /**
     * 格式化精灵图
     * @param mSprites
     * @returns
     */
    private formatSprites;
    /**
     * 格式化关键帧
     * @param mFrames
     * @returns
     */
    private formatFrames;
    /**
     * 格式化形状
     * @param mShapes
     * @returns
     */
    private formatShapes;
}
