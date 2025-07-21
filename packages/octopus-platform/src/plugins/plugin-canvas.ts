import type { GetCanvasResult, PlatformCanvas } from "../typings";
import { definePlugin } from "../definePlugin";

/**
 * 通过选择器匹配获取canvas实例
 * @returns
 */
export default definePlugin<"getCanvas", "getSelector">({  
  name: "getCanvas",
  dependencies: ["getSelector"],
  install() {
    const { retry, getSelector } = this;
    const { env, br, dpr } = this.globals;
    const intervals = [50, 100, 100];

    function initCanvas(
      canvas: PlatformCanvas | null,
      width: number,
      height: number
    ): GetCanvasResult {
      if (!canvas) {
        throw new Error("canvas not found.");
      }

      // const MAX_SIZE = 1365;
      const context = canvas!.getContext("2d")!;
      // let virtualWidth = width * dpr;
      // let virtualHeight = height * dpr;

      // // 微信小程序限制canvas最大尺寸为 1365 * 1365
      // if (
      //   env === "weapp" &&
      //   (virtualWidth > MAX_SIZE || virtualHeight > MAX_SIZE)
      // ) {
      //   if (virtualWidth > virtualHeight) {
      //     virtualHeight = (virtualHeight / virtualWidth) * MAX_SIZE;
      //     virtualWidth = MAX_SIZE;
      //   } else {
      //     virtualWidth = (virtualWidth / virtualHeight) * MAX_SIZE;
      //     virtualHeight = MAX_SIZE;
      //   }
      // }

      // canvas!.width = virtualWidth;
      // canvas!.height = virtualHeight;

      canvas!.width = width * dpr;
      canvas!.height = height * dpr;

      return { canvas, context };
    }

    if (env === "h5") {
      return (selector: string) =>
        retry<GetCanvasResult>(() => {
          // FIXME: Taro 对 canvas 做了特殊处理，canvas 元素的 id 会被加上 canvas-id 的前缀
          const canvas = (getSelector(
            `canvas[canvas-id=${selector.slice(1)}]`
          ) || getSelector(selector)) as HTMLCanvasElement;

          return initCanvas(canvas, canvas?.clientWidth, canvas?.clientHeight);
        }, intervals);
    }

    return (selector: string, component?: any) =>
      retry<GetCanvasResult>(
        () =>
          new Promise<GetCanvasResult>((resolve, reject) => {
            let query = getSelector(selector, component);

            query.exec((res: any) => {
              const { node, width, height } = res[0] || {};

              try {
                resolve(initCanvas(node, width, height));
              } catch (e) {
                reject(e);
              }
            });
          }),
        intervals
      );
  },
});
