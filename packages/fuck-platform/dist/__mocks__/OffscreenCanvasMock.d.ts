import { OffscreenCanvasRenderingContext2DMock } from "./OffscreenCanvasRenderingContext2DMock";
export declare class OffscreenCanvasMock {
    width: number;
    height: number;
    constructor(width: number, height: number);
    getContext(_contextId: string): OffscreenCanvasRenderingContext2DMock;
}
