import { describe, expect, it } from "vitest";

import { arrayExpression } from "../testing/array-expression";
import { identifier } from "../testing/identifier";
import { spread } from "../testing/spread";
import { stringLiteral } from "../testing/string-literal";
import { parsePaths } from "./parse-paths";

describe(parsePaths, () => {
	it("treats a missing argument as the controller root", () => {
		expect.assertions(1);

		expect(parsePaths([])).toStrictEqual({ paths: [""], type: "static" });
	});

	describe("when the argument is a string", () => {
		it("returns that path", () => {
			expect.assertions(1);

			expect(parsePaths([stringLiteral("active")])).toStrictEqual({ paths: ["active"], type: "static" });
		});
	});

	describe("when the argument is an array of strings", () => {
		it("returns those paths", () => {
			expect.assertions(1);

			expect(parsePaths([arrayExpression([stringLiteral("active"), stringLiteral(":id")])])).toStrictEqual({
				paths: ["active", ":id"],
				type: "static"
			});
		});
	});

	describe("when a path is not a static string", () => {
		it("returns dynamic", () => {
			expect.assertions(1);

			expect(parsePaths([identifier("dynamicPath")])).toStrictEqual({ type: "dynamic" });
		});
	});

	describe("when the array is empty or contains a hole or spread", () => {
		it.each([
			{ argument: arrayExpression([]), name: "empty" },
			{ argument: arrayExpression([null]), name: "hole" },
			{ argument: arrayExpression([spread(identifier("paths"))]), name: "spread" }
		])("returns dynamic for an $name array", ({ argument }) => {
			expect.assertions(1);

			expect(parsePaths([argument])).toStrictEqual({ type: "dynamic" });
		});
	});
});
