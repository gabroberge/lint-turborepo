import { type FunctionNode } from "@gabroberge/oxlint-estree";

import type { RecognizedTest } from "../recognize/test";
import { type IsolatedCoverage, isolatedCoverage } from "./isolated-coverage";

/**
 * Tests whose body covers one property on its own, with a countable `it` /
 * `test` or static `.each`. A nested helper, a non-isolated instantiation, or
 * mixed keys is not this coverage.
 */
export function observeTests(tests: readonly RecognizedTest[]): IsolatedCoverage[] {
	const callbacks = new WeakSet<FunctionNode>();
	for (const test of tests) {
		callbacks.add(test.callback);
	}

	return tests.map((test) => isolatedCoverage(test, callbacks)).filter((coverage) => coverage !== null);
}
