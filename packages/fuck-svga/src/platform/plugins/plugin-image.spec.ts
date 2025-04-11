import { initialPlatformGlobal } from "../../__tests__/initial";
import pluginImage from "./plugin-image";

describe("pluginImage 定义", () => {
  it("image 是否被定义", () => {
    expect(pluginImage).toBeDefined();
  });

  it("image 定义是否正确", () => {
    expect(typeof pluginImage).toBe("object");
    expect(typeof pluginImage.name).toBe("string");
    expect(typeof pluginImage.install).toBe("function");
    expect(pluginImage.name).toBe("image");
  });
});

describe("pluginImage 插件", () => {
  describe("H5 环境", () => {
    const platform = { global: initialPlatformGlobal.h5 };
  
    it("检查插件是否正常安装", () => {
      const image = pluginImage.install.call(platform);

      expect(typeof image).toBe("object");
      expect(typeof image.isImage).toBe("function");
      expect(typeof image.isImageBitmap).toBe("function");
      expect(typeof image.create).toBe("function");
      expect(typeof image.load).toBe("function");
    });

    it("检查 isImage 是否正常工作", () => {
      
    })

    it("检查 isImageBitmap 是否正常工作", () => {
      
    })

    it("检查 create 是否正常工作", () => {
      
    })

    it("检查 load 是否正常工作", () => {
      
    })
  });
  
  describe("小程序(weapp, alipay, tt) 环境", () => {
    const platform = { global: initialPlatformGlobal.weapp };
  
    it("检查插件是否正常安装", () => {
      const image = pluginImage.install.call(platform);

      expect(typeof image).toBe("object");
      expect(typeof image.isImage).toBe("function");
      expect(typeof image.isImageBitmap).toBe("function");
      expect(typeof image.create).toBe("function");
      expect(typeof image.load).toBe("function");
    });

    it("检查 isImage 是否正常工作", () => {
      
    })

    it("检查 isImageBitmap 是否正常工作", () => {
      
    })

    it("检查 create 是否正常工作", () => {
      
    })

    it("检查 load 是否正常工作", () => {
      
    })
  });  
})
