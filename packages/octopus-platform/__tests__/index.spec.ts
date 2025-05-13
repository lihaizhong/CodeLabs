import { Platform } from "../src/platform";
// import { initialPlatformGlobal } from "../__mocks__";

describe("Platform 定义", () => {
  it("Platform 是否被定义", () => {
    expect(Platform).toBeDefined();
  });

//   it("Platform 定义是否正确", () => {
//     const platform = new Platform([]);

//     expect(typeof platform).toBe("object");
//     expect(typeof platform.global).toBe("object");
//     expect(typeof platform.noop).toBe("function");
//     expect(typeof platform.switch).toBe("function");
//   });

//   it("检查 global 属性是否正确", () => {
//     const platform = new Platform([]);
//     const { global } = platform;

//     expect(typeof global.env).toBe("string");
//     expect(typeof global.br).toBe("object");
//     expect(typeof global.dpr).toBe("number");
//   });
// });

// describe("platform 整体测试", () => {
//   const platform = new Platform([]);

//   describe("H5 环境", () => {
//     beforeEach(() => {
//       platform.switch("h5");
//     });

//     it("检查 global 是否正确", () => {
//       const platformGlobal = initialPlatformGlobal("h5");

//       expect(platform.global.env).toBe(platformGlobal.env);
//       expect(platform.global.dpr).toBe(platformGlobal.dpr);
//     });
//   });

//   describe("小程序(weapp) 环境", () => {
//     beforeEach(() => {
//       platform.switch("weapp");
//     });

//     it("检查 global 是否正确", () => {
//       const platformGlobal = initialPlatformGlobal("weapp");

//       expect(platform.global.env).toBe(platformGlobal.env);
//       expect(platform.global.dpr).toBe(platformGlobal.dpr);
//     });
//   });

//   describe("小程序(alipay) 环境", () => {
//     beforeEach(() => {
//       platform.switch("alipay");
//     });

//     it("检查 global 是否正确", () => {
//       const platformGlobal = initialPlatformGlobal("alipay");

//       expect(platform.global.env).toBe(platformGlobal.env);
//       expect(platform.global.dpr).toBe(platformGlobal.dpr);
//     });
//   });

//   describe("小程序(tt) 环境", () => {
//     beforeEach(() => {
//       platform.switch("tt");
//     });

//     it("检查 global 是否正确", () => {
//       const platformGlobal = initialPlatformGlobal("tt");

//       expect(platform.global.env).toBe(platformGlobal.env);
//       expect(platform.global.dpr).toBe(platformGlobal.dpr);
//     });
//   });
});
