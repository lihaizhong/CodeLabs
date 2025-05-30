import { PointPool, CurrentPoint } from "./PointPool";

export class Renderer2D implements PlatformRenderer {
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

  private pointPool: PointPool = new PointPool();

  private globalTransform?: PlatformVideo.Transform = void 0;

  constructor(private readonly context: PlatformRenderingContext2D) {}

  private setTransform(transform?: PlatformVideo.Transform): void {
    if (transform) {
      this.context.transform(
        transform.a,
        transform.b,
        transform.c,
        transform.d,
        transform.tx,
        transform.ty
      );
    }
  }

  private fillOrStroke(styles?: PlatformVideo.VideoStyles): void {
    if (styles) {
      const { context } = this;

      if (styles.fill) {
        context.fill();
      }

      if (styles.stroke) {
        context.stroke();
      }
    }
  }

  private resetShapeStyles(styles?: PlatformVideo.VideoStyles): void {
    if (styles) {
      const { context } = this;

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

  private drawBezier(
    d?: string,
    transform?: PlatformVideo.Transform,
    styles?: PlatformVideo.VideoStyles
  ): void {
    const { context, pointPool } = this;
    const currentPoint = pointPool.acquire();

    context.save();
    this.resetShapeStyles(styles);
    this.setTransform(transform);
    context.beginPath();

    if (d) {
      // 优化字符串处理逻辑，减少正则表达式使用
      const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g) || [];

      for (const command of commands) {
        const firstLetter = command[0];

        if (Renderer2D.SVG_PATH.has(firstLetter)) {
          const args = command
            .substring(1)
            .trim()
            .split(/[\s,]+/)
            .filter(Boolean);

          this.drawBezierElement(currentPoint, firstLetter, args);
        }
      }
    }

    this.fillOrStroke(styles);
    pointPool.release(currentPoint);
    context.restore();
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
        context.moveTo(currentPoint.x, currentPoint.y);
        break;
      case "m":
        currentPoint.x += +args[0];
        currentPoint.y += +args[1];
        context.moveTo(currentPoint.x, currentPoint.y);
        break;
      case "L":
        currentPoint.x = +args[0];
        currentPoint.y = +args[1];
        context.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "l":
        currentPoint.x += +args[0];
        currentPoint.y += +args[1];
        context.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "H":
        currentPoint.x = +args[0];
        context.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "h":
        currentPoint.x += +args[0];
        context.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "V":
        currentPoint.y = +args[0];
        context.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "v":
        currentPoint.y += +args[0];
        context.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "C":
        currentPoint.x1 = +args[0];
        currentPoint.y1 = +args[1];
        currentPoint.x2 = +args[2];
        currentPoint.y2 = +args[3];
        currentPoint.x = +args[4];
        currentPoint.y = +args[5];
        context.bezierCurveTo(
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
        context.bezierCurveTo(
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
          currentPoint.x1 !== void 0 &&
          currentPoint.y1 !== void 0 &&
          currentPoint.x2 !== void 0 &&
          currentPoint.y2 !== void 0
        ) {
          currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
          currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
          currentPoint.x2 = +args[0];
          currentPoint.y2 = +args[1];
          currentPoint.x = +args[2];
          currentPoint.y = +args[3];
          context.bezierCurveTo(
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
          context.quadraticCurveTo(
            currentPoint.x1,
            currentPoint.y1,
            currentPoint.x,
            currentPoint.y
          );
        }
        break;
      case "s":
        if (
          currentPoint.x1 !== void 0 &&
          currentPoint.y1 !== void 0 &&
          currentPoint.x2 !== void 0 &&
          currentPoint.y2 !== void 0
        ) {
          currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
          currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
          currentPoint.x2 = currentPoint.x + +args[0];
          currentPoint.y2 = currentPoint.y + +args[1];
          currentPoint.x += +args[2];
          currentPoint.y += +args[3];
          context.bezierCurveTo(
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
          context.quadraticCurveTo(
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
        context.quadraticCurveTo(
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
        context.quadraticCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x,
          currentPoint.y
        );
        break;
      case "Z":
      case "z":
        context.closePath();
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

    context.save();
    this.resetShapeStyles(styles);
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

    context.beginPath();
    context.moveTo(x, ym);
    context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

    this.fillOrStroke(styles);
    context.restore();
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

    context.save();
    this.resetShapeStyles(styles);
    this.setTransform(transform);

    let radius = cornerRadius;

    if (width < 2 * radius) {
      radius = width / 2;
    }
    
    if (height < 2 * radius) {
      radius = height / 2;
    }
    
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();

    this.fillOrStroke(styles);
    context.restore();
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
    frame: PlatformVideo.VideoFrame,
    bitmap?: OctopusPlatform.Bitmap,
    dynamicElement?: OctopusPlatform.Bitmap
  ): void {
    if (frame.alpha < 0.05) return;

    const { context } = this;
    const { alpha, transform, layout, shapes, maskPath } = frame;
    const { a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0 } = transform ?? {};

    context.save();
    this.setTransform(this.globalTransform);
    context.globalAlpha = alpha;
    context.transform(a, b, c, d, tx, ty);

    if (bitmap) {
      if (maskPath) {
        this.drawBezier(maskPath.d, maskPath.transform, maskPath.styles);
        context.clip();
      }

      context.drawImage(
        bitmap as CanvasImageSource,
        0,
        0,
        layout.width,
        layout.height
      );
    }

    if (dynamicElement) {
      context.drawImage(
        dynamicElement as CanvasImageSource,
        (layout.width - dynamicElement.width) / 2,
        (layout.height - dynamicElement.height) / 2
      );
    }

    for (let i = 0; i < shapes.length; i++) {
      this.drawShape(shapes[i]);
    }

    context.restore();
  }

  getGlobalTransform(): PlatformVideo.Transform | undefined {
    return this.globalTransform;
  }

  setGlobalTransform(transform?: PlatformVideo.Transform): void {
    this.globalTransform = transform;
  }

  render(
    videoEntity: PlatformVideo.Video,
    materials: Map<string, OctopusPlatform.Bitmap>,
    dynamicMaterials: Map<string, OctopusPlatform.Bitmap>,
    currentFrame: number,
    head: number,
    tail: number
  ): void {
    const { sprites } = videoEntity;
    let sprite: PlatformVideo.VideoSprite;
    let imageKey: string;
    let bitmap: OctopusPlatform.Bitmap | undefined;
    let dynamicElement: OctopusPlatform.Bitmap | undefined;

    for (let i = head; i < tail; i++) {
      sprite = sprites[i];
      imageKey = sprite.imageKey;
      bitmap = materials.get(imageKey);
      dynamicElement = dynamicMaterials.get(imageKey);

      this.drawSprite(sprite.frames[currentFrame], bitmap, dynamicElement);
    }
  }
}
