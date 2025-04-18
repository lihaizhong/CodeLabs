export class ImageBitmapMock {
  constructor(
    public readonly width: number,
    public readonly height: number
  ) {}

  close() {
    return jest.fn().mockReturnValue("image bitmap closed");
  }
}
