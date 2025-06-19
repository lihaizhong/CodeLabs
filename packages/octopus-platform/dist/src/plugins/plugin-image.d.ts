export interface EnhancedPlatform extends OctopusPlatform.Platform {
    local: OctopusPlatform.PlatformPlugin["local"];
    path: OctopusPlatform.PlatformPlugin["path"];
    decode: OctopusPlatform.PlatformPlugin["decode"];
}
/**
 * 图片加载插件
 * @package plugin-fsm 本地文件存储能力
 * @package plugin-path 路径处理能力
 * @package plugin-decode 解码能力
 */
declare const _default: OctopusPlatform.PlatformPluginOptions<"image">;
export default _default;
