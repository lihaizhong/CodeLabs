import { TextEncoder, TextDecoder } from "util";
import {
  ImageBitmapMock,
  initialPlatformGlobal,
  OffscreenCanvasMock,
  OffscreenCanvasRenderingContext2DMock,
  requestAnimationFrame,
  cancelAnimationFrame,
} from "../__mocks__";

// 向全局模块引入 TextEncoder 和 TextDecoder
Object.assign(global, {
  TextDecoder,
  TextEncoder,
  createImageBitmap: jest.fn((_: Blob, options?: ImageBitmapOptions) =>
    Promise.resolve(
      new ImageBitmapMock(
        options?.resizeWidth || 100,
        options?.resizeWidth || 100
      )
    )
  ),
  ImageBitmap: ImageBitmapMock,
  OffscreenCanvas: OffscreenCanvasMock,
  OffscreenCanvasRenderingContext2D: OffscreenCanvasRenderingContext2DMock,
  requestAnimationFrame,
  cancelAnimationFrame,
  wx: initialPlatformGlobal("weapp").br,
  tt: initialPlatformGlobal("tt").br,
  my: initialPlatformGlobal("alipay").br,
});

Object.defineProperty(global.navigator, "userAgent", {
  get() {
    return "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
  },
});
