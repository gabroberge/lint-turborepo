import type { Linter } from "eslint";
import { Linter as ESLintLinter } from "eslint";
import tseslint from "typescript-eslint";

import { preferProtectedOutputsRule } from "../prefer-protected-outputs";
import { eslintRule } from "./eslint-rule";

const linter = new ESLintLinter({ configType: "flat" });

export function lint(code: string): { messages: Linter.LintMessage[]; output: string } {
	const config: Linter.Config[] = [
		{
			files: ["**/*.ts"],
			languageOptions: {
				parser: tseslint.parser,
				parserOptions: {
					ecmaVersion: "latest",
					sourceType: "module"
				},
				sourceType: "module"
			},
			plugins: {
				angular: {
					rules: {
						"prefer-protected-outputs": eslintRule(preferProtectedOutputsRule)
					}
				}
			},
			rules: {
				"angular/prefer-protected-outputs": "error"
			}
		}
	];

	return {
		messages: linter.verify(code, config, { filename: "index.ts" }),
		output: linter.verifyAndFix(code, config, { filename: "index.ts" }).output
	};
}
