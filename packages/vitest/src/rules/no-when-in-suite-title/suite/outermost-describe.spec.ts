import { describe, expect, it } from "vitest";

import { arrowFunction } from "../testing/arrow-function";
import { describeCall } from "../testing/describe-call";
import { createOutermostDescribe } from "./outermost-describe";

describe(createOutermostDescribe, () => {
	describe("isOutermost", () => {
		describe("when no describe callback has been entered", () => {
			it("returns true", () => {
				expect.assertions(1);

				const outermost = createOutermostDescribe();

				expect(outermost.isOutermost()).toBe(true);
			});
		});

		describe("when a top-level describe callback has been entered", () => {
			it("returns false", () => {
				expect.assertions(1);

				const outermost = createOutermostDescribe();
				const body = arrowFunction();
				outermost.note(describeCall(body));
				outermost.enterFunction(body);

				expect(outermost.isOutermost()).toBe(false);
			});
		});

		describe("when the enclosing describe callback has been exited", () => {
			it("returns true", () => {
				expect.assertions(1);

				const outermost = createOutermostDescribe();
				const body = arrowFunction();
				outermost.note(describeCall(body));
				outermost.enterFunction(body);
				outermost.exitFunction(body);

				expect(outermost.isOutermost()).toBe(true);
			});
		});

		describe("when the current function is a helper", () => {
			it("returns true", () => {
				expect.assertions(1);

				const outermost = createOutermostDescribe();
				outermost.enterFunction(arrowFunction());

				expect(outermost.isOutermost()).toBe(true);
			});
		});

		describe("when a nested describe callback has been entered", () => {
			it("returns false", () => {
				expect.assertions(1);

				const outermost = createOutermostDescribe();
				const outerBody = arrowFunction();
				const innerBody = arrowFunction();
				outermost.note(describeCall(outerBody));
				outermost.enterFunction(outerBody);
				outermost.note(describeCall(innerBody));
				outermost.enterFunction(innerBody);

				expect(outermost.isOutermost()).toBe(false);
			});
		});
	});
});
