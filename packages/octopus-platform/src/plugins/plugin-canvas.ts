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
    const { env, dpr } = this.globals;
    const intervals = [50, 100, 100];

    function initCanvas<T extends keyof GetCanvasResult>(
      canvas: PlatformCanvas | null,
      width: number,
      height: number,
      type: "2d" | "webgl" | "webgl2" | "webgpu"
    ): GetCanvasResult[T] {
      if (!canvas) {
        throw new Error("canvas not found.");
      }

      // const MAX_SIZE = 1365;
      const context = canvas!.getContext(type) as unknown as GetCanvasResult[T]["context"];
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
      return <T extends keyof GetCanvasResult = "2d">(selector: string, options: any) => {
        const type = options?.type || "2d";

        return retry(() => {
          // FIXME: Taro 对 canvas 做了特殊处理，canvas 元素的 id 会被加上 canvas-id 的前缀
          const canvas = (getSelector(
            `canvas[canvas-id=${selector.slice(1)}]`
          ) || getSelector(selector)) as HTMLCanvasElement;

          return initCanvas<T>(
            canvas,
            canvas?.clientWidth,
            canvas?.clientHeight,
            type
          );
        }, intervals);
      };
    }

    return <T extends keyof GetCanvasResult = "2d">(selector: string, options?: any) => {
      let type: "2d" | "webgl" | "webgl2" | "webgpu";
      let component: any;

      if (options) {
        // 如果是小程序组件对象
        if (typeof options.setData === "function") {
          type = "2d";
          component = options;
        } else {
          type = options.type || "2d";
          component = null;
        }
      } else {
        type = "2d";
        component = null;
      }

      return retry(
        () =>
          new Promise<GetCanvasResult[T]>((resolve, reject) => {
            let query = getSelector(selector, component);

            query.exec((res: any) => {
              const { node, width, height } = res[0] || {};

              try {
                resolve(initCanvas<T>(node, width, height, type));
              } catch (e) {
                reject(e);
              }
            });
          }),
        intervals
      );
    };
  },
});
