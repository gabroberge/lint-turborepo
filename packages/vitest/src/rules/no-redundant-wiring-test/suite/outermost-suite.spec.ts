import { describe, expect, it } from "vitest";

import { callback } from "../testing/callback";
import { describeCall } from "../testing/describe-call";
import { itCall } from "../testing/it-call";
import { createOutermostSuite } from "./outermost-suite";

describe(createOutermostSuite, () => {
	it("should have no suite before a describe is entered", () => {
		expect.assertions(1);

		const suite = createOutermostSuite();

		expect(suite.outermost()).toBeNull();
	});

	it("should treat the first entered describe as the suite", () => {
		expect.assertions(1);

		const suite = createOutermostSuite();
		const body = callback();
		suite.note(describeCall(body));
		suite.enterFunction(body);

		expect(suite.outermost()).toBe(body);
	});

	it("should keep the outermost describe when a nested describe is entered", () => {
		expect.assertions(1);

		const suite = createOutermostSuite();
		const outer = callback();
		const inner = callback();
		suite.note(describeCall(outer));
		suite.enterFunction(outer);
		suite.note(describeCall(inner));
		suite.enterFunction(inner);

		expect(suite.outermost()).toBe(outer);
	});

	it("should keep the outermost describe after a nested describe exits", () => {
		expect.assertions(1);

		const suite = createOutermostSuite();
		const outer = callback();
		const inner = callback();
		suite.note(describeCall(outer));
		suite.enterFunction(outer);
		suite.note(describeCall(inner));
		suite.enterFunction(inner);
		suite.exitFunction(inner);

		expect(suite.outermost()).toBe(outer);
	});

	it("should treat a later top-level describe as a different suite", () => {
		expect.assertions(2);

		const suite = createOutermostSuite();
		const first = callback();
		const second = callback();
		suite.note(describeCall(first));
		suite.enterFunction(first);
		suite.exitFunction(first);
		suite.note(describeCall(second));
		suite.enterFunction(second);

		expect(suite.outermost()).toBe(second);
		expect(suite.outermost()).not.toBe(first);
	});

	it("should ignore a function that is not a describe callback", () => {
		expect.assertions(1);

		const suite = createOutermostSuite();
		const helper = callback();
		suite.enterFunction(helper);

		expect(suite.outermost()).toBeNull();
	});

	it("should ignore a call that is not a describe", () => {
		expect.assertions(1);

		const suite = createOutermostSuite();
		const body = callback();
		suite.note(itCall(body));
		suite.enterFunction(body);

		expect(suite.outermost()).toBeNull();
	});
});
