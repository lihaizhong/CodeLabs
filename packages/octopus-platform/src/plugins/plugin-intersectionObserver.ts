// import { definePlugin } from "../definePlugin";

// declare interface OctopusPlatformPlugins {
//   openInObserver: (
//     callback: (isBeIntersection: boolean) => void,
//     selector: string,
//     component?: any
//   ) => () => void;
// }

// export default definePlugin<"openInObserver", "getSelector">({
//   name: "openInObserver",
//   dependencies: ["getSelector"],
//   install() {
//     const { getSelector } = this;
//     const { env, br } = this.globals;
//     const thresholds = [0, 0.5, 1];

//     if (env === "h5") {
//       return (
//         callback: (isBeIntersection: boolean) => void,
//         selector: string
//       ) => {
//         const observer = new IntersectionObserver(
//           (entries) => callback(entries[0].intersectionRatio > 0),
//           { threshold: thresholds }
//         );

//         const element = getSelector(selector) as HTMLElement;

//         if (element) {
//           observer.observe(element);
//         }

//         return () => {
//           observer.disconnect();
//         };
//       };
//     }

//     return (
//       callback: (isBeIntersection: boolean) => void,
//       selector: string,
//       component?: any
//     ) => {
//       const observer = br.createIntersectionObserver(component, {
//         thresholds,
//         initialRatio: 0,
//         nativeMode: true,
//       });

//       observer.relativeToViewport().observe(selector, (res: any) =>
//         callback(res.intersectionRatio > 0)
//       );

//       return () => {
//         observer.disconnect();
//       };
//     };
//   },
// });
