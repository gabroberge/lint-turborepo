import { describe, expect, it } from "vitest";

import { call } from "../testing/call";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { title } from "../testing/title";
import { testTitleFromCall } from "./from-call";

describe(testTitleFromCall, () => {
	describe("titled call", () => {
		it("should return the it title argument", () => {
			expect.assertions(1);

			const titleNode = title("returns false");
			const node = call(identifier("it"), [titleNode]);

			expect(testTitleFromCall(node)).toStrictEqual({ callee: "it", title: titleNode });
		});

		it("should return the test title argument", () => {
			expect.assertions(1);

			const titleNode = title("returns the fallback");
			const node = call(identifier("test"), [titleNode]);

			expect(testTitleFromCall(node)).toStrictEqual({ callee: "test", title: titleNode });
		});

		it("should return the title of it.skip", () => {
			expect.assertions(1);

			const titleNode = title("returns false");
			const node = call(member(identifier("it"), "skip"), [titleNode]);

			expect(testTitleFromCall(node)).toStrictEqual({ callee: "it", title: titleNode });
		});

		it("should return the title after a factory call", () => {
			expect.assertions(1);

			const titleNode = title("handles %s");
			const node = call(call(member(identifier("it"), "each"), []), [titleNode]);

			expect(testTitleFromCall(node)).toStrictEqual({ callee: "it", title: titleNode });
		});
	});

	describe("call without a title", () => {
		it("should ignore a factory call", () => {
			expect.assertions(1);

			expect(testTitleFromCall(call(member(identifier("it"), "each"), []))).toBeNull();
		});

		it("should ignore describe", () => {
			expect.assertions(1);

			expect(testTitleFromCall(call(identifier("describe"), [title("invalid value")]))).toBeNull();
		});

		it("should ignore a call with no arguments", () => {
			expect.assertions(1);

			expect(testTitleFromCall(call(identifier("it"), []))).toBeNull();
		});

		it("should ignore a spread first argument", () => {
			expect.assertions(1);

			const spread = {
				argument: identifier("titles"),
				type: "SpreadElement"
			};

			expect(testTitleFromCall(call(identifier("it"), [spread]))).toBeNull();
		});
	});
});
