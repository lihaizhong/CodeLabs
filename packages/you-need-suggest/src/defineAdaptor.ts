export const defineAdaptor = <T>(
  callback: (
    options?: T
  ) => (inputValue: string, comparedValue: string) => number
) => callback;
