import {
  pluginSelector,
  pluginCanvas,
  pluginOfsCanvas,
  pluginCodec,
  pluginDownload,
  pluginFsm,
  pluginImage,
  pluginNow,
  pluginPath,
  pluginRAF,
  createPlatform,
} from "octopus-platform";

export const platform = createPlatform(
  [
    pluginSelector,
    pluginCanvas,
    pluginOfsCanvas,
    pluginCodec,
    pluginDownload,
    pluginFsm,
    pluginImage,
    pluginNow,
    pluginPath,
    pluginRAF,
  ],
  __VERSION__
);
