// import benchmark from "octopus-benchmark";
import Reader from "./io/Reader";
import { MovieEntity } from "./serialization";

export type * from "./serialization";

export function createVideoEntity(data: Uint8Array, filename: string) {
  if (data instanceof Uint8Array) {
    const reader = new Reader(data);
    const video = MovieEntity.decode(reader);

    // benchmark.log('preflight cache size', reader.preflight.size);
    // benchmark.log('preflight hit count', reader.preflight.hitCount);
    video.filename = filename;
    reader.preflight.clear();

    return video;
  }

  throw new Error("Invalid data type");
}
