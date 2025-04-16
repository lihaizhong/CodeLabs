import { definePlugin } from "../definePlugin";

/**
 * 用于获取canvas
 * @returns
 */
export default definePlugin<"getCanvas">({
  name: "getCanvas",
  install() {
    const { env, br, dpr } = this.global;

    function initCanvas(
      canvas: PlatformCanvas | null,
      width: number,
      height: number
    ) {
      if (!canvas) {
        throw new Error("canvas not found.");
      }

      const MAX_SIZE = 1365
      const context = canvas!.getContext("2d");
      let virtualWidth = width * dpr
      let virtualHeight = height * dpr

      // 微信小程序限制canvas最大尺寸为 1365 * 1365
      if (env === 'weapp' && (virtualWidth > MAX_SIZE || virtualHeight > MAX_SIZE)) {
        if (virtualWidth > virtualHeight) {
          virtualHeight = (virtualHeight / virtualWidth) * MAX_SIZE
          virtualWidth = MAX_SIZE
        } else {
          virtualWidth = (virtualWidth / virtualHeight) * MAX_SIZE
          virtualHeight = MAX_SIZE
        }
      }

      canvas!.width = virtualWidth
      canvas!.height = virtualHeight

      return { canvas, context };
    }

    if (env === "h5") {
      const querySelector = (selector: string) => document.querySelector(selector);

      return (selector: string) => new Promise((resolve) => {
        // FIXME: Taro 对 canvas 做了特殊处理，canvas 元素的 id 会被加上 canvas-id 的前缀
        const canvas = (querySelector(`canvas[canvas-id=${selector.slice(1)}]`) || querySelector(selector)) as HTMLCanvasElement;
        const { clientWidth, clientHeight } = canvas || {};

        resolve(initCanvas(canvas, clientWidth, clientHeight));
      });
    }

    return (
      selector: string,
      component?: WechatMiniprogram.Component.TrivialInstance | null
    ) => {
      return new Promise((resolve) => {
        let query = (br as WechatMiniprogram.Wx).createSelectorQuery();

        if (component) {
          query = query.in(component);
        }

        query
          .select(selector)
          .fields({ node: true, size: true }, (res) => {
            const { node, width, height } = res || {};

            resolve(initCanvas(node, width, height));
          })
          .exec();
      });
    };
  },
});
