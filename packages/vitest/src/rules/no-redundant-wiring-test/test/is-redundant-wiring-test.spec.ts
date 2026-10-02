import { describe, expect, it } from "vitest";

import { functionNode } from "../testing/function-node";
import { recordedTest } from "../testing/recorded-test";
import { isRedundantWiringTest } from "./is-redundant-wiring-test";

describe(isRedundantWiringTest, () => {
	it("should reject a lone wiring test", () => {
		expect.assertions(1);

		const suite = functionNode();
		const wiring = recordedTest({ suite, wiring: true });

		expect(isRedundantWiringTest(wiring, [wiring])).toBe(false);
	});

	it("should reject a wiring test with no suite", () => {
		expect.assertions(1);

		const wiring = recordedTest({ suite: null, wiring: true });
		const other = recordedTest({ suite: functionNode(), wiring: false });

		expect(isRedundantWiringTest(wiring, [wiring, other])).toBe(false);
	});

	it("should reject a behavioral test even when the suite has another test", () => {
		expect.assertions(1);

		const suite = functionNode();
		const behavioral = recordedTest({ suite, wiring: false });
		const other = recordedTest({ suite, wiring: true });

		expect(isRedundantWiringTest(behavioral, [behavioral, other])).toBe(false);
	});

	it("should accept a wiring test when the suite has another executable test", () => {
		expect.assertions(1);

		const suite = functionNode();
		const wiring = recordedTest({ suite, wiring: true });
		const other = recordedTest({ suite, wiring: false });

		expect(isRedundantWiringTest(wiring, [wiring, other])).toBe(true);
	});
});
