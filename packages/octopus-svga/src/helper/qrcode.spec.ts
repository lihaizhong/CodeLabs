import { generateImageFromCode } from "./qrcode";

describe("qrcode-helper", () => {
  it("should be defined", () => {
    expect(generateImageFromCode).toBeDefined();
  });
});
