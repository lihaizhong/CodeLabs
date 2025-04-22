import { generateImageFromCode } from "./qrcode-helper";

describe("qrcode-helper", () => {
  it("should be defined", () => {
    expect(generateImageFromCode).toBeDefined();
  });
});
