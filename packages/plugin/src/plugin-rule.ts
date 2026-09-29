import type { Rule } from "@oxlint/plugins";

export type DefaultSeverity = "error" | "warn";

export type PluginRule = PluginRuleExtension & Rule;

export interface PluginRuleExtension {
	defaultSeverity: DefaultSeverity;
	name: string;
}
