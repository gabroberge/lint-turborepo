import type { RuleTestCase } from "./lint-rule-case";

export function expectedOutput(testCase: RuleTestCase): string {
	return testCase.output ?? testCase.code;
}
