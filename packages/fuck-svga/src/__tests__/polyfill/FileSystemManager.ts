export const fileSystemManager = jest.fn(() => ({
  access: jest.fn(() => {}),
  writeFile: jest.fn(() => {}),
  readFile: jest.fn(() => {}),
  removeFile: jest.fn(() => {}),
}));
