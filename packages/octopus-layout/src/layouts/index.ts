import { LayoutNode } from "src/core/LayoutNode";
import { TextMeasurement } from "src/utils/TextMeasurement";

export class LayoutContext {
  private textMeasurement: TextMeasurement;

  constructor(
    private readonly context:
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
  ) {
    this.textMeasurement = new TextMeasurement(context);
  }

  calculate(node: LayoutNode) {
    const { type, style, rect, children } = node;

    switch (type) {
      case OctopusLayout.NodeType.TEXT: {
        break;
      }
      case OctopusLayout.NodeType.CONTAINER: {
        if (style.display === "flex") {} else {}
        break;
      }
      case OctopusLayout.NodeType.IMAGE: {
        break;
      }
      default:
    }
  }
}
