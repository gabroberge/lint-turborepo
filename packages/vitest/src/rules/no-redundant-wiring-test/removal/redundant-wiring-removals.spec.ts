import { describe, expect, it } from "vitest";

import { functionNode } from "../testing/function-node";
import { recordedTest } from "../testing/recorded-test";
import { redundantWiringRemovals } from "./redundant-wiring-removals";

describe(redundantWiringRemovals, () => {
	it("should omit a lone wiring test", () => {
		expect.assertions(1);

		const suite = functionNode();
		const wiring = recordedTest({ suite, wiring: true });

		expect(redundantWiringRemovals("", [wiring])).toStrictEqual([]);
	});

	it("should omit a wiring test with no suite", () => {
		expect.assertions(1);

		const wiring = recordedTest({ suite: null, wiring: true });
		const other = recordedTest({ suite: functionNode(), wiring: false });

		expect(redundantWiringRemovals("", [wiring, other])).toStrictEqual([]);
	});

	it("should report a wiring test when the suite has another executable test", () => {
		expect.assertions(1);

		const suite = functionNode();
		const wiring = recordedTest({ suite, wiring: true });
		const other = recordedTest({ suite, wiring: false });

		expect(redundantWiringRemovals("", [wiring, other])).toStrictEqual([{ node: wiring.node, range: null }]);
	});

	it("should leave a newline between two adjacent removable wiring tests", () => {
		expect.assertions(1);

		const suite = functionNode();
		const source = 'it("a", () => {});\nit("b", () => {});\n';
		const first = recordedTest({
			source,
			statement: 'it("a", () => {})',
			suite,
			wiring: true
		});
		const second = recordedTest({
			source,
			statement: 'it("b", () => {})',
			suite,
			wiring: true
		});

		expect(redundantWiringRemovals(source, [first, second])).toStrictEqual([
			{ node: first.node, range: [0, source.indexOf("\n")] },
			{ node: second.node, range: [source.indexOf("\n") + 1, source.length] }
		]);
	});
});
