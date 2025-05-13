import { LayoutNode } from "../core/LayoutNode";

export class FlowLayout {
  constructor(private readonly node: LayoutNode, private readonly offsetX: number, private readonly offsetY: number) {}

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
