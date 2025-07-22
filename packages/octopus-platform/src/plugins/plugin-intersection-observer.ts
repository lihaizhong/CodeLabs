import { definePlugin } from "../definePlugin";

declare interface OctopusPlatformPlugins {
  openInObserver: (
    callback: (isBeIntersection: boolean) => void,
    selector: string,
    component?: any
  ) => () => void;
}

export default definePlugin<"walkIn">({
  name: "walkIn",
  install() {
    const { env, br } = this.globals;
    const thresholds = [0, 0.5, 1];

    if (env === "h5") {
      return (
        callback: (isBeIntersection: boolean) => void,
        selector: string,
        options: any = {}
      ) => {
        let observer: IntersectionObserver | null = new IntersectionObserver(
          (entries) => callback(entries[0].intersectionRatio > 0),
          {
            threshold: thresholds,
            root: options.root ? document.querySelector(options.root) : null,
          }
        );

        const elements = document.querySelectorAll(selector);

        if (elements.length) {
          for (let i = 0; i < elements.length; i++) {
            observer.observe(elements[i]);
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
      options: any = {}
    ) => {
      let observer: any = br.createIntersectionObserver(options.component, {
        thresholds,
        initialRatio: 0,
        nativeMode: true,
      });

      if (options.root) {
        observer.relativeTo(options.root);
      } else {
        observer.relativeToViewport();
      }

      observer.observe(selector, (res: any) =>
        callback(res.intersectionRatio > 0)
      );

      return () => {
        observer.disconnect();
        observer = null;
      };
    };
  },
});
