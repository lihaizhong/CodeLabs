import "weui";
import { LayoutEngine, LayoutNode, CanvasRenderer } from "octopus-layout-engine";

window.addEventListener("DOMContentLoaded", () => {
  const $palette = document.getElementById("palette");
  const layoutEngine = new LayoutEngine({
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
  });
  const layoutRenderer = new CanvasRenderer($palette, window.devicePixelRatio);
  const node = new LayoutNode({
    type: "text",
    content: "Hello World",
    style: {
      fontSize: 16,
      color: "#FFFFFF"
    },
  });

  layoutEngine.setRenderer(layoutRenderer);
})
