import { definePlugin } from "../definePlugin";

export default definePlugin<"getSelector">({
  name: "getSelector",
  install() {
    const { env, br } = this.globals;

    if (env === "h5") {
      return (selector: string) =>
        document.querySelector(selector);
    }

    return (selector: string, component?: any) => {
      let query = br.createSelectorQuery();

      if (component) {
        query = query.in(component);
      }

      return query
        .select(selector)
        .fields({ node: true, size: true })
    }
  }
});
