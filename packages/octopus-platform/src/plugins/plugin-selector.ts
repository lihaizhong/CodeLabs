import { definePlugin } from "../definePlugin";

export default definePlugin<"getSelector">({
  name: "getSelector",
  install() {
    const { env, br } = this.globals;

    if (env === "h5") {
      return (selector: string) => document.querySelector(selector);
    }

    return (selector: string, component?: any) =>
      (component || br)
        .createSelectorQuery()
        .select(selector)
        .fields({ node: true, size: true });
  },
});
