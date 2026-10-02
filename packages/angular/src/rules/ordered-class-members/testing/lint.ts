import type { Linter } from "eslint";
import { Linter as ESLintLinter } from "eslint";
import tseslint from "typescript-eslint";

import plugin from "../../../index";
import type { RuleOptions } from "./rule-options";

const linter = new ESLintLinter({ configType: "flat" });

export interface LintResult {
	messages: Linter.LintMessage[];
	output: string;
}

/** Lint through the real plugin with ESLint: the first pass's messages, and the output once every fix is applied. */
export function lint(code: string, options: RuleOptions = []): LintResult {
	return {
		messages: linter.verify(code, config(options), { filename: "index.ts" }),
		output: linter.verifyAndFix(code, config(options), { filename: "index.ts" }).output
	};
}

function config(options: RuleOptions): Linter.Config[] {
	return [
		{
			files: ["**/*.ts"],
			languageOptions: {
				parser: tseslint.parser,
				parserOptions: { ecmaVersion: "latest", sourceType: "module" },
				sourceType: "module"
			},
			plugins: { angular: plugin as never },
			rules: { "angular/ordered-class-members": ["error", ...options] }
		}
	];
}
