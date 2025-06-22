import { MovieEntity } from "./serialization";

export * from "./serialization";

export function createVideoEntity(data: Uint8Array, filename: string) {
  if (data instanceof Uint8Array) {
    const video = MovieEntity.decode(data);

    video.filename = filename;

    return video;
  }

  throw new Error("Invalid data type");
}
