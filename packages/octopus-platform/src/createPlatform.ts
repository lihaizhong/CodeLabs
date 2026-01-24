import { OctopusPlatform } from "./platform";
import type { OctopusPlatformPluginOptions } from "./definePlugin";
import type { OctopusPlatformPlugins } from "./typings";
import { installPlugin } from "./installPlugin";

/**
 * 创建平台实例的工厂函数
 *
 * 通过工厂函数创建平台实例，无需继承。
 * TypeScript 会根据插件列表自动推断实例的属性类型。
 *
 * @param plugins - 插件列表
 * @param version - 应用版本
 * @returns 平台实例，自动推断插件属性类型
 */
export function createPlatform<T extends readonly OctopusPlatformPluginOptions<any, any>[]>(
  plugins: T,
  version?: string
): OctopusPlatform<never> & Pick<OctopusPlatformPlugins, T[number]["name"]> {
  // 内部类：继承 OctopusPlatform 并实现 installPlugin
  class InternalPlatform extends OctopusPlatform<never> {
    constructor() {
      super(plugins as any, version);
      this.init(); // 在基类中调用 init
    }

    public installPlugin(plugin: OctopusPlatformPluginOptions<any, any>): void {
      // 使用 installPlugin.ts 中的实现（包含类型断言）
      installPlugin(this as any, plugin as any);
    }
  }

  return new InternalPlatform() as any;
}