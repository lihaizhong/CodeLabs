import { SE } from "./env";
export { Parser } from "./parser";
export { Player } from "./player";
export { Poster } from "./poster";
export { VideoManager } from "./parser/video-manager";
export { Brush } from "./player/brush";
export { getOffscreenCanvas, getCanvas } from "./polyfill";
export declare const Svga: {
    env: {
        is: (environment: SE) => boolean;
        not: (environment: SE) => boolean;
        get: () => SE;
        set: (environment: SE) => void;
    };
    SUPPORTED_ENV: typeof SE;
};
