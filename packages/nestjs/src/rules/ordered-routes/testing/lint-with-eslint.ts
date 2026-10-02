import { Linter } from "eslint";
import tseslint from "typescript-eslint";

import plugin from "../../../index";

export interface LintCase {
	code: string;
	name: string;
	options?: [RuleOptions];
}

export interface RuleOptions {
	methodOrder?: string[];
}

const linter = new Linter({ configType: "flat" });

export function lintWithEslint(testCase: LintCase): { fixed: boolean; messages: unknown[]; output: string } {
	const ruleConfig = testCase.options === undefined ? "error" : ["error", ...testCase.options];
	return linter.verifyAndFix(
		testCase.code,
		[
			{
				files: ["**/*.ts"],
				languageOptions: {
					parser: tseslint.parser,
					sourceType: "module"
				},
				plugins: {
					nestjs: plugin as never
				},
				rules: {
					"nestjs/ordered-routes": ruleConfig as "error"
				}
			}
		],
		{ filename: "controller.ts" }
	);
}
