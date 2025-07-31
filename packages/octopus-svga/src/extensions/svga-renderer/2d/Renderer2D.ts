import { type Bitmap } from "octopus-platform";
import { PointPool, CurrentPoint } from "../../../shared/PointPool";
import {
  PlatformVideo,
  type TransformScale,
  type PlatformRenderingContext2D,
  type CanvasSize,
  PLAYER_CONTENT_MODE
} from "../../../types";

export interface ICommand {
  command: string;
  args: string;
}

export class Renderer2D {
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
  private static SVG_PATH = new Set([
    "M",
    "L",
    "H",
    "V",
    "Z",
    "C",
    "S",
    "Q",
    "m",
    "l",
    "h",
    "v",
    "z",
    "c",
    "s",
    "q",
  ]);

  private static SVG_LETTER_REGEXP = /[a-zA-Z]/;

  // 在Renderer2D类中添加新的解析方法
  private static parseSVGPath(d: string): ICommand[] {
    const { SVG_LETTER_REGEXP } = Renderer2D;
    const result: ICommand[] = [];
    let currentIndex = 0;

    // 状态：0 - 等待命令，1 - 读取参数
    let state = 0;
    let currentCommand = "";
    let currentArgs = "";

    while (currentIndex < d.length) {
      const char = d[currentIndex];

      switch (state) {
        case 0: // 等待命令
          if (SVG_LETTER_REGEXP.test(char)) {
            currentCommand = char;
            state = 1;
          }
          break;
        case 1: // 读取参数
          if (SVG_LETTER_REGEXP.test(char)) {
            // 遇到新命令，保存当前命令和参数
            result.push({
              command: currentCommand,
              args: currentArgs.trim(),
            });
            currentCommand = char;
            currentArgs = "";
          } else {
            currentArgs += char;
          }
          break;
      }

      currentIndex++;
    }

    // 处理最后一个命令
    if (currentCommand && state === 1) {
      result.push({
        command: currentCommand,
        args: currentArgs.trim(),
      });
    }

    return result;
  }

  private static fillOrStroke(
    context: PlatformRenderingContext2D,
    styles?: PlatformVideo.VideoStyles
  ): void {
    if (styles) {
      if (styles.fill) {
        context.fill();
      }

      if (styles.stroke) {
        context.stroke();
      }
    }
  }

  private static resetShapeStyles(
    context: PlatformRenderingContext2D,
    styles?: PlatformVideo.VideoStyles
  ): void {
    if (styles) {
      context.strokeStyle = styles.stroke || "transparent";

      if (styles.strokeWidth! > 0) {
        context.lineWidth = styles.strokeWidth!;
      }

      if (styles.miterLimit! > 0) {
        context.miterLimit = styles.miterLimit!;
      }

      if (styles.lineCap) {
        context.lineCap = styles.lineCap;
      }

      if (styles.lineJoin) {
        context.lineJoin = styles.lineJoin;
      }

      context.fillStyle = styles.fill || "transparent";

      if (styles.lineDash) {
        context.setLineDash(styles.lineDash);
      }
    }
  }

  /**
   * 计算缩放比例
   * @param contentMode
   * @param videoSize
   * @param canvasSize
   * @returns
   */
  private static calculateScale(
    contentMode: PLAYER_CONTENT_MODE,
    videoSize: PlatformVideo.VideoSize,
    canvasSize: CanvasSize
  ): TransformScale {
    const imageRatio = videoSize.width / videoSize.height;
    const viewRatio = canvasSize.width / canvasSize.height;
    const isAspectFit = contentMode === PLAYER_CONTENT_MODE.ASPECT_FIT;
    const shouldUseWidth =
      (imageRatio >= viewRatio && isAspectFit) ||
      (imageRatio <= viewRatio && !isAspectFit);
    const createTransform = (
      scale: number,
      translateX: number,
      translateY: number
    ) => ({
      scaleX: scale,
      scaleY: scale,
      translateX,
      translateY,
    });

    if (shouldUseWidth) {
      const scale = canvasSize.width / videoSize.width;

      return createTransform(
        scale,
        0,
        (canvasSize.height - videoSize.height * scale) / 2
      );
    }

    const scale = canvasSize.height / videoSize.height;

    return createTransform(
      scale,
      (canvasSize.width - videoSize.width * scale) / 2,
      0
    );
  }

  private readonly pointPool: PointPool = new PointPool();

  private currentPoint: CurrentPoint;

  private lastResizeKey = "";

  private globalTransform?: PlatformVideo.Transform = undefined;

  constructor(private context: PlatformRenderingContext2D | null) {
    this.currentPoint = this.pointPool.acquire();
  }

  private setTransform(transform?: PlatformVideo.Transform): void {
    if (transform && this.context) {
      this.context!.transform(
        transform.a,
        transform.b,
        transform.c,
        transform.d,
        transform.tx,
        transform.ty
      );
    }
  }

  private drawBezier(
    d?: string,
    transform?: PlatformVideo.Transform,
    styles?: PlatformVideo.VideoStyles
  ): void {
    const { context, pointPool } = this;
    this.currentPoint = pointPool.acquire();

    context!.save();
    Renderer2D.resetShapeStyles(context!, styles);
    this.setTransform(transform);
    context!.beginPath();

    if (d) {
      // 使用状态机解析器替代正则表达式
      const commands = Renderer2D.parseSVGPath(d);

      for (const { command, args } of commands) {
        if (Renderer2D.SVG_PATH.has(command)) {
          this.drawBezierElement(
            this.currentPoint,
            command,
            args.split(/[\s,]+/).filter(Boolean)
          );
        }
      }
    }

    Renderer2D.fillOrStroke(context!, styles);
    pointPool.release(this.currentPoint);
    context!.restore();
  }

  private drawBezierElement(
    currentPoint: CurrentPoint,
    method: string,
    args: string[]
  ): void {
    const { context } = this;

    switch (method) {
      case "M":
        currentPoint.x = +args[0];
        currentPoint.y = +args[1];
        context!.moveTo(currentPoint.x, currentPoint.y);
        break;
      case "m":
        currentPoint.x += +args[0];
        currentPoint.y += +args[1];
        context!.moveTo(currentPoint.x, currentPoint.y);
        break;
      case "L":
        currentPoint.x = +args[0];
        currentPoint.y = +args[1];
        context!.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "l":
        currentPoint.x += +args[0];
        currentPoint.y += +args[1];
        context!.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "H":
        currentPoint.x = +args[0];
        context!.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "h":
        currentPoint.x += +args[0];
        context!.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "V":
        currentPoint.y = +args[0];
        context!.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "v":
        currentPoint.y += +args[0];
        context!.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "C":
        currentPoint.x1 = +args[0];
        currentPoint.y1 = +args[1];
        currentPoint.x2 = +args[2];
        currentPoint.y2 = +args[3];
        currentPoint.x = +args[4];
        currentPoint.y = +args[5];
        context!.bezierCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x2,
          currentPoint.y2,
          currentPoint.x,
          currentPoint.y
        );
        break;
      case "c":
        currentPoint.x1 = currentPoint.x + +args[0];
        currentPoint.y1 = currentPoint.y + +args[1];
        currentPoint.x2 = currentPoint.x + +args[2];
        currentPoint.y2 = currentPoint.y + +args[3];
        currentPoint.x += +args[4];
        currentPoint.y += +args[5];
        context!.bezierCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x2,
          currentPoint.y2,
          currentPoint.x,
          currentPoint.y
        );
        break;
      case "S":
        if (
          currentPoint.x1 !== undefined &&
          currentPoint.y1 !== undefined &&
          currentPoint.x2 !== undefined &&
          currentPoint.y2 !== undefined
        ) {
          currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
          currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
          currentPoint.x2 = +args[0];
          currentPoint.y2 = +args[1];
          currentPoint.x = +args[2];
          currentPoint.y = +args[3];
          context!.bezierCurveTo(
            currentPoint.x1,
            currentPoint.y1,
            currentPoint.x2,
            currentPoint.y2,
            currentPoint.x,
            currentPoint.y
          );
        } else {
          currentPoint.x1 = +args[0];
          currentPoint.y1 = +args[1];
          currentPoint.x = +args[2];
          currentPoint.y = +args[3];
          context!.quadraticCurveTo(
            currentPoint.x1,
            currentPoint.y1,
            currentPoint.x,
            currentPoint.y
          );
        }
        break;
      case "s":
        if (
          currentPoint.x1 !== undefined &&
          currentPoint.y1 !== undefined &&
          currentPoint.x2 !== undefined &&
          currentPoint.y2 !== undefined
        ) {
          currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
          currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
          currentPoint.x2 = currentPoint.x + +args[0];
          currentPoint.y2 = currentPoint.y + +args[1];
          currentPoint.x += +args[2];
          currentPoint.y += +args[3];
          context!.bezierCurveTo(
            currentPoint.x1,
            currentPoint.y1,
            currentPoint.x2,
            currentPoint.y2,
            currentPoint.x,
            currentPoint.y
          );
        } else {
          currentPoint.x1 = currentPoint.x + +args[0];
          currentPoint.y1 = currentPoint.y + +args[1];
          currentPoint.x += +args[2];
          currentPoint.y += +args[3];
          context!.quadraticCurveTo(
            currentPoint.x1,
            currentPoint.y1,
            currentPoint.x,
            currentPoint.y
          );
        }
        break;
      case "Q":
        currentPoint.x1 = +args[0];
        currentPoint.y1 = +args[1];
        currentPoint.x = +args[2];
        currentPoint.y = +args[3];
        context!.quadraticCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x,
          currentPoint.y
        );
        break;
      case "q":
        currentPoint.x1 = currentPoint.x + +args[0];
        currentPoint.y1 = currentPoint.y + +args[1];
        currentPoint.x += +args[2];
        currentPoint.y += +args[3];
        context!.quadraticCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x,
          currentPoint.y
        );
        break;
      case "Z":
      case "z":
        context!.closePath();
        break;
    }
  }

  private drawEllipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    transform?: PlatformVideo.Transform,
    styles?: PlatformVideo.VideoStyles
  ): void {
    const { context } = this;

    context!.save();
    Renderer2D.resetShapeStyles(context!, styles);
    this.setTransform(transform);

    x -= radiusX;
    y -= radiusY;

    const w = radiusX * 2;
    const h = radiusY * 2;
    const kappa = 0.5522848;
    const ox = (w / 2) * kappa;
    const oy = (h / 2) * kappa;
    const xe = x + w;
    const ye = y + h;
    const xm = x + w / 2;
    const ym = y + h / 2;

    context!.beginPath();
    context!.moveTo(x, ym);
    context!.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    context!.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    context!.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    context!.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

    Renderer2D.fillOrStroke(context!, styles);
    context!.restore();
  }

  private drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    cornerRadius: number,
    transform?: PlatformVideo.Transform,
    styles?: PlatformVideo.VideoStyles
  ): void {
    const { context } = this;

    context!.save();
    Renderer2D.resetShapeStyles(context!, styles);
    this.setTransform(transform);

    let radius = cornerRadius;

    if (width < 2 * radius) {
      radius = width / 2;
    }

    if (height < 2 * radius) {
      radius = height / 2;
    }

    context!.beginPath();
    context!.moveTo(x + radius, y);
    context!.arcTo(x + width, y, x + width, y + height, radius);
    context!.arcTo(x + width, y + height, x, y + height, radius);
    context!.arcTo(x, y + height, x, y, radius);
    context!.arcTo(x, y, x + width, y, radius);
    context!.closePath();

    Renderer2D.fillOrStroke(context!, styles);
    context!.restore();
  }

  private drawShape(shape: PlatformVideo.VideoFrameShape): void {
    const { type, path, transform, styles } = shape;

    switch (type) {
      case PlatformVideo.SHAPE_TYPE.SHAPE:
        this.drawBezier(path.d, transform, styles);
        break;
      case PlatformVideo.SHAPE_TYPE.ELLIPSE:
        this.drawEllipse(
          path.x ?? 0,
          path.y ?? 0,
          path.radiusX ?? 0,
          path.radiusY ?? 0,
          transform,
          styles
        );
        break;
      case PlatformVideo.SHAPE_TYPE.RECT:
        this.drawRect(
          path.x ?? 0,
          path.y ?? 0,
          path.width ?? 0,
          path.height ?? 0,
          path.cornerRadius ?? 0,
          transform,
          styles
        );
        break;
    }
  }

  private drawSprite(
    frame: PlatformVideo.VideoFrame | PlatformVideo.HiddenVideoFrame,
    bitmap?: Bitmap,
    dynamicElement?: Bitmap
  ): void {
    if (frame.alpha === 0) return;

    const { context } = this;
    const { alpha, transform, layout, shapes } =
      frame as PlatformVideo.VideoFrame;
    const { a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0 } = transform ?? {};

    context!.save();
    this.setTransform(this.globalTransform);
    context!.globalAlpha = alpha;
    context!.transform(a, b, c, d, tx, ty);

    if (bitmap) {
      context!.drawImage(
        bitmap as CanvasImageSource,
        0,
        0,
        layout.width,
        layout.height
      );
    }

    if (dynamicElement) {
      context!.drawImage(
        dynamicElement as CanvasImageSource,
        (layout.width - dynamicElement.width) / 2,
        (layout.height - dynamicElement.height) / 2
      );
    }

    for (let i = 0; i < shapes.length; i++) {
      this.drawShape(shapes[i]);
    }

    context!.restore();
  }

  /**
   * 调整画布尺寸
   * @param contentMode
   * @param videoSize
   * @param canvasSize
   * @returns
   */
  public resize(
    contentMode: PLAYER_CONTENT_MODE,
    videoSize: PlatformVideo.VideoSize,
    canvasSize: CanvasSize
  ): void {
    const { width: canvasWidth, height: canvasHeight } = canvasSize;
    const { width: videoWidth, height: videoHeight } = videoSize;
    const resizeKey = `${contentMode}-${videoWidth}-${videoHeight}-${canvasWidth}-${canvasHeight}`;
    const lastTransform = this.globalTransform;

    if (this.lastResizeKey === resizeKey && lastTransform) {
      return;
    }

    let scale: TransformScale = {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0,
    };

    if (contentMode === PLAYER_CONTENT_MODE.FILL) {
      scale.scaleX = canvasWidth / videoWidth;
      scale.scaleY = canvasHeight / videoHeight;
    } else {
      scale = Renderer2D.calculateScale(contentMode, videoSize, canvasSize);
    }

    this.lastResizeKey = resizeKey;
    this.globalTransform = {
      a: scale.scaleX,
      b: 0.0,
      c: 0.0,
      d: scale.scaleY,
      tx: scale.translateX,
      ty: scale.translateY,
    };
  }

  public render(
    videoEntity: PlatformVideo.Video,
    materials: Map<string, Bitmap>,
    dynamicMaterials: Map<string, Bitmap>,
    currentFrame: number,
    head: number,
    tail: number
  ): void {
    let sprite: PlatformVideo.VideoSprite;
    let imageKey: string;
    let bitmap: Bitmap | undefined;
    let dynamicElement: Bitmap | undefined;

    for (let i = head; i < tail; i++) {
      sprite = videoEntity.sprites[i];
      imageKey = sprite.imageKey;
      bitmap = materials.get(imageKey);
      dynamicElement = dynamicMaterials.get(imageKey);

      this.drawSprite(sprite.frames[currentFrame], bitmap, dynamicElement);
    }
  }

  public destroy() {
    this.globalTransform = undefined;
    this.lastResizeKey = "";
    this.context = null;
  }
}
