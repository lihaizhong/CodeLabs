export const selectorQuery = jest.fn(() => ({
  in: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  fields: jest.fn().mockReturnThis(),
  exec: jest.fn(),
}));
