import { Platform, pluginNow, pluginSystem } from "octopus-platform";
import { version } from "../package.json";
class EnhancedPlatform extends Platform {
    now;
    system;
    constructor() {
        super([pluginNow, pluginSystem], version);
        this.init();
    }
    installPlugin(plugin) {
        const value = plugin.install.call(this);
        Object.defineProperty(this, plugin.name, {
            get: () => value,
            enumerable: true,
            configurable: true,
        });
    }
}
export const platform = new EnhancedPlatform();
