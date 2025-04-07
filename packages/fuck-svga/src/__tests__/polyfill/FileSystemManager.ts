export const fileSystemManager = jest.fn(() => ({
  access: jest.fn((options) => {}),
  writeFile: jest.fn((options) => {}),
  readFile: jest.fn((options) => {}),
  removeFile: jest.fn((options) => {}),
}));
