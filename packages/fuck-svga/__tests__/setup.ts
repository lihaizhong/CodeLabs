import { TextEncoder, TextDecoder } from "util";
import { ImageBitmapMock, initialPlatformGlobal } from "./mocks";

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
  OffscreenCanvas: jest.fn(),
  requestAnimationFrame: jest.fn(),
  wx: initialPlatformGlobal("weapp").br,
  tt: initialPlatformGlobal("tt").br,
  my: initialPlatformGlobal("alipay").br,
});
