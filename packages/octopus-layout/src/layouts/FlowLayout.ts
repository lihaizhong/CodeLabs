import { LayoutNode } from "../core/LayoutNode";

export class FlowLayout {
  constructor(private readonly node: LayoutNode) {}

  calculate() {
    const { style, rect, children } = this.node;
    const {
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
    } = style;
  }
}
