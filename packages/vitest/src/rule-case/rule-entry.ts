import type { Linter } from "eslint";

export function ruleEntry(options: readonly unknown[] | undefined): Linter.RuleEntry {
	if (options === undefined) {
		return "error";
	}

	return ["error", ...options] as Linter.RuleEntry;
}
