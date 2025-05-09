import { LayoutContext } from "./LayoutContext";

/**
 * 布局节点类
 * 表示布局树中的一个节点，可以是容器、文本或图像
 */
export class LayoutNode {
  /**
   * 节点类型
   */
  public readonly type: OctopusLayout.NodeType;
  /**
   * 节点内容
   */
  public readonly content: string;
  /**
   * 节点样式
   */
  public readonly style: OctopusLayout.NodeStyle;
  /**
   * 子节点
   */
  public readonly children: LayoutNode[] = [];
  /**
   * 父节点
   */
  public parent: LayoutNode | null = null;
  /**
   * 节点位置和尺寸
   */
  public readonly rect: OctopusLayout.NodeRect;
  /**
   * 文本测量结果
   */
  private textMetrics: OctopusLayout.TextMetrics | null = null;

  constructor(options: OctopusLayout.LayoutNodeOptions) {
    this.type = options.type;
    this.content = options.content || "";
    this.style =  this.normalizeStyle(options.style || {});
    this.rect = { x: 0, y: 0, width: 0, height: 0 };
  }

  private normalizeStyle(style: Partial<OctopusLayout.NodeStyle>): OctopusLayout.NodeStyle {
    const defaultStyle: OctopusLayout.NodeStyle = {
      display: "block",
      width: 0,
      height: 0,
      fontSize: 16,
      // 兼容iOS，Android设备，保证字体与App一致
      fontFamily: "-apple-system, BlinkMacSystemFont, SFProDisplay-Regular, sans-serif",
      lineHeight: 1.2,
      color: "#000",
      backgroundColor: "#fff",
      textAlign: OctopusLayout.TextAlign.LEFT,
      verticalAlign: OctopusLayout.VerticalAlign.TOP,
      paddingLeft: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      marginLeft: 0,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      flexDirection: OctopusLayout.FlexDirection.ROW,
      justifyContent: OctopusLayout.JustifyContent.FLEX_START,
      alignItems: OctopusLayout.AlignItems.FLEX_START,
      flexWrap: OctopusLayout.FlexWrap.NOWRAP,
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: "auto",
    }

    return { ...defaultStyle, ...style };
  }

  appendChild(child: LayoutNode): this {
    child.setParent(this);
    this.children.push(child);

    return this;
  }

  setParent(parent: LayoutNode): void {
    this.parent = parent;
  }

  /**
   * 获取节点的绝对位置
   */
  setPosition(x: number, y: number): void {
    this.rect.x = x;
    this.rect.y = y;
  }

  /**
   * 获取文本测量结果
   */
  getTextMetrics(): OctopusLayout.TextMetrics | null {
    return this.textMetrics;
  }

  /**
   * 设置文本测量结果
   */
  setTextMetrics(metrics: OctopusLayout.TextMetrics): void {
    this.textMetrics = metrics;
  }

  /**
   * 测量节点尺寸
   * @param context 布局上下文
   */
  measure(context: LayoutContext): void {
    const { style, type } = this;
    const { display, width, height } = style;
    const maxWidth = width;

    // 根据节点类型进行不同的测量
    const fontSize = style.fontSize;
    const fontFamily = style.fontFamily;
    const lineHeight = style.lineHeight;

    if (type === "text") {
      // 测量文本
      this.textMetrics = context.measureText(
        this.content,
        fontSize,
        fontFamily,
        maxWidth,
        lineHeight
      );

      if (display !== "inline" && width) {
        this.rect.width = width;
      } else {
        this.rect.width = width || this.textMetrics!.width;
      }

      if (display !== "inline" && height) {
        this.rect.height = height;
      } else {
        this.rect.height = height || this.textMetrics!.height;
      }
    } else {
      if (display !== "inline" && width) {
        this.rect.width = width;
      }

      if (display !== "inline" && height) {
        this.rect.height = height;
      }
    }

    // 递归测量子节点
    for (const child of this.children) {
      child.measure(context);
    }
  }
}
