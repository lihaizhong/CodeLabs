import { Renderer2D } from "./Renderer2D";
// import { render } from "./renderer";

export function createRenderer(context: PlatformRenderingContext2D): PlatformRenderer {
  return new Renderer2D(context);
}

// export function createRenderer(
//   context: PlatformRenderingContext2D
// ): PlatformRenderer {
//   let globalTransform: PlatformVideo.Transform | undefined = void 0;

//   return {
//     getGlobalTransform() {
//       return globalTransform;
//     },
//     setGlobalTransform(transform?: PlatformVideo.Transform) {
//       globalTransform = transform;
//     },
//     render(
//       videoEntity: PlatformVideo.Video,
//       materials: Map<string, OctopusPlatform.Bitmap>,
//       dynamicMaterials: Map<string, OctopusPlatform.Bitmap>,
//       currentFrame: number,
//       head: number,
//       tail: number
//     ) {
//       render(
//         context,
//         videoEntity,
//         materials,
//         dynamicMaterials,
//         currentFrame,
//         head,
//         tail,
//         globalTransform
//       );
//     },
//   };
// }
