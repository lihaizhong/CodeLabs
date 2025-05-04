import type {
  FrameEntity,
  MovieEntity,
  ShapeEntity,
  SpriteEntity,
} from "../extensions/protobuf";

export class VideoEntity implements PlatformVideo.Video {
  /**
   * svga 版本号
   */
  public version: string;
  /**
   * svga 文件名
   */
  public filename: string;
  /**
   * svga 尺寸
   */
  public size: PlatformVideo.VideoSize = {
    width: 0,
    height: 0
  };
  /**
   * svga 帧率
   */
  public fps: number = 20;
  /**
   * 是否可以编辑svga文件
   */
  public locked = false;
  /**
   * svga 帧数
   */
  public frames: number = 0;
  /**
   * svga 二进制图片合集
   */
  public images: RawImages = {};
  /**
   * svga 动态元素
   */
  public dynamicElements: PlatformImages = {};
  /**
   * svga 关键帧信息
   */
  public sprites: PlatformVideo.VideoSprite[] = [];

  constructor(movie: MovieEntity, filename: string) {
    const { viewBoxWidth, viewBoxHeight, fps, frames } = movie.params!;

    this.version = movie.version;
    this.filename = filename;
    this.size.width = viewBoxWidth;
    this.size.height = viewBoxHeight;
    this.fps = fps;
    this.frames = frames;
    this.images = movie.images || {};
    this.sprites = this.formatSprites(movie.sprites || []);
  }

  /**
   * 格式化精灵图
   * @param mSprites 
   * @returns 
   */
  private formatSprites(mSprites: SpriteEntity[]) {
    return mSprites.map((mSprite) => ({
      imageKey: mSprite.imageKey,
      frames: this.formatFrames(mSprite.frames || []),
    }));
  }

  /**
   * 格式化关键帧
   * @param mFrames 
   * @returns 
   */
  private formatFrames(mFrames: FrameEntity[]) {
    let lastShapes: PlatformVideo.VideoFrameShapes | undefined;

    return mFrames.map((mFrame) => {
      const { layout: FL, transform: FT, alpha: FA } = mFrame;
      // 设置Layout
      const L = {
        x: (FL?.x! + 0.5) | 0,
        y: (FL?.y! + 0.5) | 0,
        width: (FL?.width! + 0.5) | 0,
        height: (FL?.height! + 0.5) | 0,
      };

      // 设置Transform
      const T = {
        a: FT?.a ?? 1.0,
        b: FT?.b ?? 0.0,
        c: FT?.c ?? 0.0,
        d: FT?.d ?? 1.0,
        tx: FT?.tx ?? 0.0,
        ty: FT?.ty ?? 0.0,
      };

      let shapes: PlatformVideo.VideoFrameShapes = this.formatShapes(mFrame.shapes || []);

      if (mFrame.shapes[0]?.type === 3 && lastShapes) {
        shapes = lastShapes;
      } else {
        lastShapes = shapes;
      }

      const llx = T.a * L.x + T.c * L.y + T.tx;
      const lrx = T.a * (L.x + L.width) + T.c * L.y + T.tx;
      const lbx = T.a * L.x + T.c * (L.y + L.height) + T.tx;
      const rbx = T.a * (L.x + L.width) + T.c * (L.y + L.height) + T.tx;
      const lly = T.b * L.x + T.d * L.y + T.ty;
      const lry = T.b * (L.x + L.width) + T.d * L.y + T.ty;
      const lby = T.b * L.x + T.d * (L.y + L.height) + T.ty;
      const rby = T.b * (L.x + L.width) + T.d * (L.y + L.height) + T.ty;
      const nx = (Math.min(lbx, rbx, llx, lrx) + 0.5) | 0;
      const ny = (Math.min(lby, rby, lly, lry) + 0.5) | 0;

      const CP = mFrame.clipPath ?? "";
      const maskPath =
        CP.length > 0
          ? {
              d: CP,
              transform: undefined,
              styles: {
                fill: "rgba(0, 0, 0, 0)" as PlatformVideo.RGBA<0, 0, 0, 0>,
                stroke: null,
                strokeWidth: null,
                lineCap: null,
                lineJoin: null,
                miterLimit: null,
                lineDash: null,
              },
            }
          : null;

      return {
        alpha: FA ?? 0,
        layout: L,
        transform: T,
        clipPath: CP,
        shapes,
        nx,
        ny,
        maskPath,
      };
    });
  }

  /**
   * 格式化形状
   * @param mShapes 
   * @returns 
   */
  private formatShapes(mShapes: ShapeEntity[]): PlatformVideo.VideoFrameShapes {
    const shapes: PlatformVideo.VideoFrameShapes = [];

    for (let mShape of mShapes) {
      const mStyles = mShape.styles;

      if (mStyles == null) {
        continue;
      }

      const lineDash: number[] = [];
      const { lineDashI: LD1, lineDashII: LD2, lineDashIII: LD3 } = mStyles;
      if (LD1 > 0) {
        lineDash.push(LD1);
      }

      if (LD2 > 0) {
        if (lineDash.length < 1) {
          lineDash.push(0);
        }
        lineDash.push(LD2);
      }

      if (LD3 > 0) {
        if (lineDash.length < 2) {
          lineDash.push(0);
          lineDash.push(0);
        }
        lineDash[2] = LD3;
      }

      let lineCap: CanvasLineCap | null = null;
      switch (mStyles.lineCap) {
        case 0:
          lineCap = "butt";
          break;
        case 1:
          lineCap = "round";
          break;
        case 2:
          lineCap = "square";
          break;
      }

      let lineJoin: CanvasLineJoin | null = null;
      switch (mStyles.lineJoin) {
        case 2:
          lineJoin = "bevel";
          break;
        case 1:
          lineJoin = "round";
          break;
        case 0:
          lineJoin = "miter";
          break;
      }

      const { fill: StF, stroke: StS } = mStyles;
      let fill: PlatformVideo.RGBA<number, number, number, number> | null = null;
      if (StF) {
        fill = `rgba(${(StF.r * 255) | 0}, ${(StF.g * 255) | 0}, ${
          (StF.b * 255) | 0
        }, ${(StF.a * 1) | 0})`;
      }

      let stroke: PlatformVideo.RGBA<number, number, number, number> | null = null;
      if (StS) {
        stroke = `rgba(${(StS.r * 255) | 0}, ${(StS.g * 255) | 0}, ${
          (StS.b * 255) | 0
        }, ${(StS.a * 1) | 0})`;
      }

      const SS = {
        lineDash,
        fill,
        stroke,
        lineCap,
        lineJoin,
        strokeWidth: mStyles.strokeWidth,
        miterLimit: mStyles.miterLimit,
      };
      const { transform: ShF, shape, rect, ellipse } = mShape;
      const ST = {
        a: ShF?.a ?? 1.0,
        b: ShF?.b ?? 0.0,
        c: ShF?.c ?? 0.0,
        d: ShF?.d ?? 1.0,
        tx: ShF?.tx ?? 0.0,
        ty: ShF?.ty ?? 0.0,
      };

      if (mShape.type === 0 && shape) {
        shapes.push({
          type: PlatformVideo.SHAPE_TYPE.SHAPE,
          path: shape,
          styles: SS,
          transform: ST,
        });
      } else if (mShape.type === 1 && rect) {
        shapes.push({
          type: PlatformVideo.SHAPE_TYPE.RECT,
          path: rect,
          styles: SS,
          transform: ST,
        });
      } else if (mShape.type === 2 && ellipse) {
        shapes.push({
          type: PlatformVideo.SHAPE_TYPE.ELLIPSE,
          path: ellipse,
          styles: SS,
          transform: ST,
        });
      }
    }

    return shapes;
  }
}
