import { createPlatform, pluginNow } from "octopus-platform";

export const platform = createPlatform([pluginNow], __VERSION__);
