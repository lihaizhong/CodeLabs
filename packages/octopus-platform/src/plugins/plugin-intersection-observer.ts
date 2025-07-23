import type { MiniProgramIntersectionObserver, WalkInOptions } from "../typings";
import { definePlugin } from "../definePlugin";

export default definePlugin<"walkIn">({
  name: "walkIn",
  install() {
    const { env, br } = this.globals;
    const thresholds = [0, 0.5, 1];

    if (env === "h5") {
      return (
        callback: (isBeIntersection: boolean) => void,
        selector: string,
        options: WalkInOptions = {}
      ) => {
        let observer: IntersectionObserver | null = new IntersectionObserver(
          (entries) => callback(entries[0].intersectionRatio > 0),
          {
            threshold: thresholds,
            root: options.root ? document.querySelector(options.root) : null,
          }
        );

        if (options.observeAll) {
          document.querySelectorAll(selector)?.forEach((element) => observer!.observe(element));
        } else {
          const element = document.querySelector(selector);

          if (element) {
            observer!.observe(element);
          }
        }

        return () => {
          observer!.disconnect();
          observer = null;
        };
      };
    }

    return (
      callback: (isBeIntersection: boolean) => void,
      selector: string,
      options: WalkInOptions = {}
    ) => {
      let observer: MiniProgramIntersectionObserver | null = br.createIntersectionObserver(options.component, {
        thresholds,
        initialRatio: 0,
        observeAll: options.observeAll,
        // nativeMode: true,
      });

      if (options.root) {
        observer!.relativeTo(options.root);
      } else {
        observer!.relativeToViewport();
      }

      observer!.observe(selector, (res: any) =>
        callback(res.intersectionRatio > 0)
      );

      return () => {
        observer!.disconnect();
        observer = null;
      };
    };
  },
});
