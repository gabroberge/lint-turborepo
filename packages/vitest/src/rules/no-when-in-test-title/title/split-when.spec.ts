import { describe, expect, it } from "vitest";

import { splitWhen } from "./split-when";

describe(splitWhen, () => {
	it("should keep the outcome and the trailing condition", () => {
		expect.assertions(1);

		expect(splitWhen("returns null when the value is missing")).toStrictEqual({
			condition: "the value is missing",
			describeTitle: "when the value is missing",
			outcome: "returns null"
		});
	});

	it("should keep the source capitalization on the describe title", () => {
		expect.assertions(2);

		expect(splitWhen("returns null When missing")).toStrictEqual({
			condition: "missing",
			describeTitle: "When missing",
			outcome: "returns null"
		});
		expect(splitWhen("returns null WHEN missing")).toStrictEqual({
			condition: "missing",
			describeTitle: "WHEN missing",
			outcome: "returns null"
		});
	});

	it("should leave punctuation on the outcome", () => {
		expect.assertions(1);

		expect(splitWhen("returns null, when missing")).toStrictEqual({
			condition: "missing",
			describeTitle: "when missing",
			outcome: "returns null,"
		});
	});

	it("should reject a second condition word", () => {
		expect.assertions(1);

		expect(splitWhen("returns null when missing when empty")).toBeNull();
	});

	it("should reject a missing condition", () => {
		expect.assertions(1);

		expect(splitWhen("returns null when")).toBeNull();
	});

	it("should reject a missing outcome", () => {
		expect.assertions(1);

		expect(splitWhen("when the value is missing, returns null")).toBeNull();
	});

	it("should ignore a longer word that only contains those letters", () => {
		expect.assertions(1);

		expect(splitWhen("returns null whenever the cache is warm")).toBeNull();
	});
});
