import Reader from "./io/Reader";
import { MovieEntity } from "./serialization";

export * from "./serialization";

export function createVideoEntity(data: Uint8Array, filename: string) {
  if (data instanceof Uint8Array) {
    const reader = new Reader(data);
    const video = MovieEntity.decode(reader);

    video.filename = filename;
    reader.preflight.clear();

    return video;
  }

  throw new Error("Invalid data type");
}
