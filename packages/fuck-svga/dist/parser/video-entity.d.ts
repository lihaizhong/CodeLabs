import type { MovieEntity } from "fuck-protobuf";
export declare class VideoEntity implements Video {
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
    size: {
        width: number;
        height: number;
    };
    /**
     * svga 帧率
     */
    fps: number;
    /**
     * svga 帧数
     */
    frames: number;
    /**
     * svga 二进制图片合集
     */
    images: RawImages;
    /**
     * svga 替代元素
     */
    replaceElements: ReplaceElements;
    /**
     * svga 动态元素
     */
    dynamicElements: DynamicElements;
    /**
     * svga 关键帧信息
     */
    sprites: VideoSprite[];
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
