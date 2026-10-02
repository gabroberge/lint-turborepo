import type { RecordedTest } from "./record-executable-test";

/**
 * A wiring test is redundant when it sits in a suite that already has
 * another executable test.
 */
export function isRedundantWiringTest(test: RecordedTest, tests: readonly RecordedTest[]): boolean {
	if (!test.wiring || test.suite === null) {
		return false;
	}
	return tests.some((other) => other !== test && other.suite === test.suite);
}
