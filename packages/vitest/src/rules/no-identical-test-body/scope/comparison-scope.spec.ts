import { describe, expect, it } from "vitest";

import { arrowFunction } from "../testing/arrow-function";
import { describeCall } from "../testing/describe-call";
import { createComparisonScope } from "./comparison-scope";

describe(createComparisonScope, () => {
	describe("when the same identity is recorded twice in the file", () => {
		it("treats only the later copy as a repeat", () => {
			expect.assertions(3);

			const scope = createComparisonScope();

			expect(scope.isLaterCopy("body")).toBe(false);
			expect(scope.isLaterCopy("body")).toBe(true);
			expect(scope.isLaterCopy("body")).toBe(true);
		});
	});

	describe("when two identities are recorded in the file", () => {
		it("treats them as distinct", () => {
			expect.assertions(2);

			const scope = createComparisonScope();
			scope.isLaterCopy("first");

			expect(scope.isLaterCopy("second")).toBe(false);
			expect(scope.isLaterCopy("first")).toBe(true);
		});
	});

	describe("when a describe is entered", () => {
		it("does not share identities with the file", () => {
			expect.assertions(3);

			const scope = createComparisonScope();
			const body = arrowFunction();
			scope.rememberDescribe(describeCall(body));
			scope.isLaterCopy("body");
			scope.enterFunction(body);

			expect(scope.isLaterCopy("body")).toBe(false);
			expect(scope.isLaterCopy("body")).toBe(true);

			scope.exitFunction(body);

			expect(scope.isLaterCopy("body")).toBe(true);
		});
	});

	describe("when two sibling describes are entered", () => {
		it("does not share identities between them", () => {
			expect.assertions(2);

			const scope = createComparisonScope();
			const first = arrowFunction();
			const second = arrowFunction();
			scope.rememberDescribe(describeCall(first));
			scope.enterFunction(first);
			scope.isLaterCopy("body");
			scope.exitFunction(first);
			scope.rememberDescribe(describeCall(second));
			scope.enterFunction(second);

			expect(scope.isLaterCopy("body")).toBe(false);

			scope.exitFunction(second);

			expect(scope.isLaterCopy("body")).toBe(false);
		});
	});

	describe("when a describe is nested inside another", () => {
		it("does not share identities with the parent", () => {
			expect.assertions(3);

			const scope = createComparisonScope();
			const outer = arrowFunction();
			const inner = arrowFunction();
			scope.rememberDescribe(describeCall(outer));
			scope.enterFunction(outer);
			scope.isLaterCopy("body");
			scope.rememberDescribe(describeCall(inner));
			scope.enterFunction(inner);

			expect(scope.isLaterCopy("body")).toBe(false);

			scope.exitFunction(inner);

			expect(scope.isLaterCopy("body")).toBe(true);

			scope.exitFunction(outer);

			expect(scope.isLaterCopy("body")).toBe(false);
		});
	});

	describe("when a function was never remembered as a describe", () => {
		it("stays in the file scope", () => {
			expect.assertions(2);

			const scope = createComparisonScope();
			const helper = arrowFunction();
			scope.isLaterCopy("body");
			scope.enterFunction(helper);

			expect(scope.isLaterCopy("body")).toBe(true);

			scope.exitFunction(helper);

			expect(scope.isLaterCopy("body")).toBe(true);
		});
	});
});
