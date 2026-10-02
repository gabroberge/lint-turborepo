import type { Linter } from "eslint";
import { Linter as ESLintLinter } from "eslint";
import tseslint from "typescript-eslint";

import { requireArraySpeciesRule } from "../require-array-species";
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
				typescript: {
					rules: {
						"require-array-species": eslintRule(requireArraySpeciesRule)
					}
				}
			},
			rules: {
				"typescript/require-array-species": "warn"
			}
		}
	];

	return {
		messages: linter.verify(code, config, { filename: "index.ts" }),
		output: linter.verifyAndFix(code, config, { filename: "index.ts" }).output
	};
}
