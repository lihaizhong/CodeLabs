import { MovieEntity } from "./serialization";

export * from "./serialization";

export function parseSvga(data: Uint8Array): MovieEntity {
  if (!(data instanceof Uint8Array)) {
    throw new Error("Invalid data type");
  }

  return MovieEntity.decode(data);
}
