import { ByteArrayOutputStream } from "../ByteArrayOutputStream";

export class PngImage {
  // png的开头是这8字节，它是固定的。0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
  private signature = [137, 80, 78, 71, 13, 10, 26, 10];

  private parseChunk(bytes: number[], type: "IHDR" | "PLTE" | "IDAT" | "IEND", offset: number, length: number) {
    switch (type) {
      case "IHDR":
        break;
      case "PLTE":
        break;
      case "IDAT":
        break;
      case "IEND":
        break;
      default:
    }
  }

  write(
    out: ByteArrayOutputStream,
    blackColor = "#000000",
    whiteColor = "#ffffff"
  ) {
    // ---------------------------------
    // PNG Signature

    out.writeBytes(this.signature);

    // ---------------------------------
    // IHDR


    // ---------------------------------
    // PLTE


    // ---------------------------------
    // IDAT


    // ---------------------------------
    // IEND
  }
}
