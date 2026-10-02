import type { Rule } from "@oxlint/plugins";
import type { Rule as ESLintRule } from "eslint";

export function eslintRule(rule: Rule): ESLintRule.RuleModule {
	return rule as unknown as ESLintRule.RuleModule;
}
