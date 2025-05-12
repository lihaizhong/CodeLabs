import { LayoutContext } from "./LayoutContext";

/**
 * 布局节点类
 * 表示布局树中的一个节点，可以是容器、文本或图像
 */
export class LayoutNode {
  private static readonly DEFAULT_STYLE: Required<OctopusLayout.NodeStyle> = {
    display: "block",
    fontSize: 16,
    // 兼容iOS，Android设备，保证字体与App一致
    fontFamily: "-apple-system, BlinkMacSystemFont, SFProDisplay-Regular, sans-serif",
    fontWeight: 400,
    lineHeight: 1.2,
    color: "#000",
    backgroundColor: "#fff",
    textAlign: OctopusLayout.TextAlign.LEFT,
    verticalAlign: OctopusLayout.VerticalAlign.TOP,
    // 宽高
    width: 0,
    height: 0,
    // padding
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    // margin
    marginLeft: 0,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    // flex
    flexDirection: OctopusLayout.FlexDirection.ROW,
    justifyContent: OctopusLayout.JustifyContent.FLEX_START,
    alignItems: OctopusLayout.AlignItems.FLEX_START,
    flexWrap: OctopusLayout.FlexWrap.NOWRAP,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
  }

  private static readonly DEFAULT_RECT: Required<OctopusLayout.NodeRect> = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  /**
   * 节点类型
   */
  public readonly type: OctopusLayout.NodeType | "unknown" = "unknown";
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
    this.content = options.content || "";
    this.style = { ...LayoutNode.DEFAULT_STYLE, ...options.style };
    this.rect = Object.create(LayoutNode.DEFAULT_RECT);
    this.children = (options.children || []).map((child) => {
      child.setParent(this);

      return child;
    });

    if (options.type) {
      this.type = options.type;
    }
    
    switch (this.type) {
      case OctopusLayout.NodeType.TEXT: {
        this.style.display = "inline";
        break;
      }
      case OctopusLayout.NodeType.CONTAINER: {
        if (this.style.display === "inline") {
          this.style.display = "block";
        }
        break;
      }
      case OctopusLayout.NodeType.IMAGE: {
        this.style.display = "block";
        break;
      }
      default: {
        if (this.style.display === "inline") {
          this.type = OctopusLayout.NodeType.TEXT;
        } else {
          this.type = OctopusLayout.NodeType.CONTAINER;
        }
      }
    }
  }

  /**
   * 设置父节点
   * @param parent 
   */
  setParent(parent: LayoutNode): void {
    this.parent = parent;
  }

  /**
   * 设置节点的绝对位置
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
    const { style, type, content } = this;
    const { width, height } = style;

    // 根据节点类型进行不同的测量
    const { fontWeight, fontSize, fontFamily, lineHeight } = style;

    if (type === "text") {
      const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      // 测量文本
      this.textMetrics = context.measureText(
        content,
        font,
        width,
        lineHeight
      );
      // 设置文本节点的宽度和高度
      this.rect.width = this.textMetrics!.width;
      this.rect.height = this.textMetrics!.height;
    } else {
      // 测量容器宽度和高度
      this.rect.width = width;
      this.rect.height = height;
    }

    // 递归测量子节点
    for (const child of this.children) {
      child.measure(context);
    }
  }
}
