import { describe, expect, it } from "vitest";

import { callback } from "../testing/callback";
import { describeCall } from "../testing/describe-call";
import { itCall } from "../testing/it-call";
import { createDescribeNesting } from "./describe-nesting";

describe(createDescribeNesting, () => {
	describe("isBelowSuite", () => {
		describe("when no describe has been entered", () => {
			it("returns false", () => {
				expect.assertions(1);

				const nesting = createDescribeNesting();

				expect(nesting.isBelowSuite()).toBe(false);
			});
		});

		describe("when only the outermost describe is entered", () => {
			it("returns false", () => {
				expect.assertions(1);

				const nesting = createDescribeNesting();
				const suite = callback();
				nesting.note(describeCall(suite));
				nesting.enter(suite);

				expect(nesting.isBelowSuite()).toBe(false);
			});
		});

		describe("when a nested describe is entered", () => {
			it("returns true", () => {
				expect.assertions(1);

				const nesting = createDescribeNesting();
				const suite = callback();
				const nested = callback();
				nesting.note(describeCall(suite));
				nesting.enter(suite);
				nesting.note(describeCall(nested));
				nesting.enter(nested);

				expect(nesting.isBelowSuite()).toBe(true);
			});
		});

		describe("when three describe levels are entered", () => {
			it("returns true", () => {
				expect.assertions(1);

				const nesting = createDescribeNesting();
				const suite = callback();
				const subject = callback();
				const scenario = callback();
				nesting.note(describeCall(suite));
				nesting.enter(suite);
				nesting.note(describeCall(subject));
				nesting.enter(subject);
				nesting.note(describeCall(scenario));
				nesting.enter(scenario);

				expect(nesting.isBelowSuite()).toBe(true);
			});
		});

		describe("when the function is not a describe callback", () => {
			it("returns false", () => {
				expect.assertions(1);

				const nesting = createDescribeNesting();
				const helper = callback();
				nesting.enter(helper);

				expect(nesting.isBelowSuite()).toBe(false);
			});
		});

		describe("when a helper sits inside a nested describe", () => {
			it("returns true", () => {
				expect.assertions(1);

				const nesting = createDescribeNesting();
				const suite = callback();
				const nested = callback();
				const helper = callback();
				nesting.note(describeCall(suite));
				nesting.enter(suite);
				nesting.note(describeCall(nested));
				nesting.enter(nested);
				nesting.enter(helper);

				expect(nesting.isBelowSuite()).toBe(true);
			});
		});

		describe("when the nested describe has exited", () => {
			it("returns false", () => {
				expect.assertions(1);

				const nesting = createDescribeNesting();
				const suite = callback();
				const nested = callback();
				nesting.note(describeCall(suite));
				nesting.enter(suite);
				nesting.note(describeCall(nested));
				nesting.enter(nested);
				nesting.exit(nested);

				expect(nesting.isBelowSuite()).toBe(false);
			});
		});
	});

	describe("note", () => {
		describe("when the call is not a describe", () => {
			it("does not count the callback toward nesting", () => {
				expect.assertions(1);

				const nesting = createDescribeNesting();
				const body = callback();
				nesting.note(itCall(body));
				nesting.enter(body);

				expect(nesting.isBelowSuite()).toBe(false);
			});
		});
	});
});
