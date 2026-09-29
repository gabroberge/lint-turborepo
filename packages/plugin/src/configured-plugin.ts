import type { Plugin } from "@oxlint/plugins";

import type { DefaultSeverity } from "./plugin-rule";

export interface ConfiguredPlugin extends Plugin {
	configs: PluginConfigs;
}

export interface PluginConfigs {
	all: Preset;
	recommended: Preset;
}

export interface Preset {
	plugins: Record<string, Plugin>;
	rules: Record<string, DefaultSeverity>;
}
