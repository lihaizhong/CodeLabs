export const selectorQuery = jest.fn(() => ({
  in: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  fields: jest.fn(() => ({
    node: {
      getContext: jest.fn(() => ({})),
      width: 300,
      height: 300,
    }
  })).mockReturnThis(),
  exec: jest.fn(),
}));
