import { TextEncoder, TextDecoder } from "util";
import { initialPlatformGlobal } from "./mocks";

// 向全局模块引入 TextEncoder 和 TextDecoder
Object.assign(global, {
  TextDecoder,
  TextEncoder,
  createImageBitmap: jest.fn(() => Promise.resolve("create bitmap success")),
  ImageBitmap: jest.fn(),
  wx: initialPlatformGlobal("weapp").br,
  tt: initialPlatformGlobal("tt").br,
  my: initialPlatformGlobal("alipay").br,
});
