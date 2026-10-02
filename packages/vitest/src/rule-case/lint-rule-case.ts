import type { Rule } from "@oxlint/plugins";
import type { Linter } from "eslint";
import { Linter as ESLintLinter } from "eslint";
import tseslint from "typescript-eslint";

import { eslintRule } from "./eslint-rule";
import type { ExpectedMessage } from "./project-messages";
import { ruleEntry } from "./rule-entry";

const linter = new ESLintLinter({ configType: "flat" });

export interface LintResult {
	messages: Linter.LintMessage[];
	output: string;
}

export interface RuleTestCase {
	code: string;
	errors?: readonly ExpectedMessage[];
	filename?: string;
	name: string;
	options?: readonly unknown[];
	output?: string | null;
}

export function lintRuleCase(rule: Rule, ruleName: string, testCase: RuleTestCase): LintResult {
	const filename = testCase.filename ?? "example.spec.ts";
	const entry = ruleEntry(testCase.options);

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
				nestjs: {
					rules: {
						[ruleName]: eslintRule(rule)
					}
				}
			},
			rules: {
				[`nestjs/${ruleName}`]: entry
			}
		}
	];

	const messages = linter.verify(testCase.code, config, { filename });
	const output = linter.verifyAndFix(testCase.code, config, { filename }).output;

	return { messages, output };
}
