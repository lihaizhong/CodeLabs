import { OffscreenCanvasRenderingContext2DMock } from "./OffscreenCanvasRenderingContext2DMock";

export class OffscreenCanvasMock {
  constructor(public width: number, public height: number) {}

  getContext(_contextId: string) {
    // @ts-ignore
    return new OffscreenCanvasRenderingContext2DMock(this);
  }
}