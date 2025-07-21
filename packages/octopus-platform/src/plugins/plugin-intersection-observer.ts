import { definePlugin } from "../definePlugin";

export default definePlugin<"intersectionObserver", "getSelector">({
  name: "intersectionObserver",
  dependencies: ["getSelector"],
  install() {
    const { getSelector } = this;
    const { env, br } = this.globals;
    const thresholds = [0, 0.5, 1];

    if (env === "h5") {
      return (
        selector: string,
        callback: (isBeIntersection: boolean) => void
      ) => {
        const observer = new IntersectionObserver(
          (entries) => {
            callback(entries[0].intersectionRatio > 0);
          },
          { threshold: thresholds }
        );

        const element = getSelector(selector) as HTMLElement;

        if (element) {
          observer.observe(element);
        }

        return () => {
          observer.disconnect();
        };
      };
    }

    return (
      selector: string,
      callback: (isBeIntersection: boolean) => void,
      component?: any
    ) => {
      const observer = br.createIntersectionObserver(component, {
        thresholds: thresholds,
        initialRatio: 0,
      });

      observer.observe(selector, (res: any) => {
        callback(res.intersectionRatio > 0);
      });

      return () => {
        observer.disconnect();
      };
    };
  },
});
