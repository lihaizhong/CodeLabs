import { PlatformCanvas } from "../typings";
import { definePlugin } from "../definePlugin";

export interface GetCanvasResult {
  canvas: PlatformCanvas;
  context: CanvasRenderingContext2D;
}

// 扩展OctopusPlatformPlugins接口
declare module "../definePlugin" {
  interface OctopusPlatformPlugins {
    getCanvas: (selector: string, component?: any) => Promise<GetCanvasResult>;
  }
}

/**
 * 通过选择器匹配获取canvas实例
 * @returns
 */
export default definePlugin<"getCanvas">({
  name: "getCanvas",
  install() {
    const { retry } = this;
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
      const querySelector = (selector: string) =>
        document.querySelector(selector);

      return (selector: string) =>
        retry<GetCanvasResult>(() => {
          // FIXME: Taro 对 canvas 做了特殊处理，canvas 元素的 id 会被加上 canvas-id 的前缀
          const canvas = (querySelector(
            `canvas[canvas-id=${selector.slice(1)}]`
          ) || querySelector(selector)) as HTMLCanvasElement;

          return initCanvas(canvas, canvas?.clientWidth, canvas?.clientHeight);
        }, intervals);
    }

    return (selector: string, component?: any) =>
      retry<GetCanvasResult>(
        () =>
          new Promise<GetCanvasResult>((resolve, reject) => {
            let query = br.createSelectorQuery();
            if (component) {
              query = query.in(component);
            }

            query
              .select(selector)
              .fields({ node: true, size: true }, (res: any) => {
                const { node, width, height } = res || {};

                try {
                  resolve(initCanvas(node, width, height));
                } catch (e) {
                  reject(e);
                }
              })
              .exec();
          }),
        intervals
      );
  },
});
