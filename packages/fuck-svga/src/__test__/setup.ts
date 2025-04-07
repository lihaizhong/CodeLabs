import { TextEncoder, TextDecoder } from "util";
import { initialPlatformGlobal } from "./initial";

// 向全局模块引入 TextEncoder 和 TextDecoder
Object.assign(global, {
  TextDecoder,
  TextEncoder,
  CanvasRenderingContext2D: () => {},
  wx: initialPlatformGlobal.weapp.br,
  tt: initialPlatformGlobal.tt.br,
  my: initialPlatformGlobal.alipay.br,
});
