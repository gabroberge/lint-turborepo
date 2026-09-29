import { defineRule, eslintCompatPlugin } from "@oxlint/plugins";

import { configFor } from "./config-for";
import type { ConfiguredPlugin } from "./configured-plugin";
import type { PluginRule } from "./plugin-rule";

export function defineConfiguredPlugin(pluginName: string, rules: readonly PluginRule[]): ConfiguredPlugin {
	const plugin = eslintCompatPlugin({
		meta: { name: pluginName },
		rules: Object.fromEntries(rules.map((rule) => [rule.name, defineRule(rule)]))
	});

	return Object.assign(plugin, {
		configs: {
			all: configFor(pluginName, plugin, rules),
			recommended: configFor(
				pluginName,
				plugin,
				rules.filter((rule) => rule.meta?.docs?.recommended === true)
			)
		}
	});
}
