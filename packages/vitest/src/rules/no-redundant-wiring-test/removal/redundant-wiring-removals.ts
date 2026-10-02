import type { ESTree } from "@oxlint/plugins";

import { isRedundantWiringTest } from "../test/is-redundant-wiring-test";
import type { RecordedTest } from "../test/record-executable-test";
import { removalRange } from "./removal-range";
import { separateAdjacentRemovalRanges } from "./separate-adjacent-removal-ranges";

export interface WiringRemoval {
	node: ESTree.CallExpression;
	range: [number, number] | null;
}

interface FixableWiringRemoval {
	node: ESTree.CallExpression;
	range: [number, number];
}

/**
 * Removal reports for redundant wiring tests. Ranges are comment-safe, or
 * null when the statement cannot be removed. Adjacent ranges keep a newline
 * so both ESLint fixes apply.
 */
export function redundantWiringRemovals(source: string, tests: readonly RecordedTest[]): WiringRemoval[] {
	const reports: WiringRemoval[] = [];

	for (const test of tests) {
		if (!isRedundantWiringTest(test, tests)) {
			continue;
		}

		const range = removalRange(source, test.statement);
		reports.push({ node: test.node, range });
	}

	const fixable = reports
		.filter((report): report is FixableWiringRemoval => report.range !== null)
		.toSorted((left, right) => left.range[0] - right.range[0]);

	separateAdjacentRemovalRanges(
		source,
		fixable.map((report) => report.range)
	);

	return reports;
}
