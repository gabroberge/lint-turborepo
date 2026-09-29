import type { Plugin } from "@oxlint/plugins";

import type { Preset } from "./configured-plugin";
import type { PluginRule } from "./plugin-rule";

export function configFor(pluginName: string, plugin: Plugin, pluginRules: readonly PluginRule[]): Preset {
	return {
		plugins: { [pluginName]: plugin },
		rules: Object.fromEntries(pluginRules.map((rule) => [`${pluginName}/${rule.name}`, rule.defaultSeverity]))
	};
}
