import { describe, expect, it } from "vitest";

import { preferImmutableResourceRule } from "./prefer-immutable-resource";
import { lines } from "./testing/lines";
import { lint } from "./testing/lint";

const preferImmutableResource = {
	messageId: "preferImmutableResource",
	ruleId: "angular/prefer-immutable-resource"
};

describe("prefer-immutable-resource meta", () => {
	it("errors by default", () => {
		expect.assertions(1);

		expect(preferImmutableResourceRule.defaultSeverity).toBe("error");
	});

	it("is recommended", () => {
		expect.assertions(1);

		expect(preferImmutableResourceRule.meta?.docs?.recommended).toBe(true);
	});

	it("offers an autofix", () => {
		expect.assertions(1);

		expect(preferImmutableResourceRule.meta?.fixable).toBe("code");
	});
});

describe("prefer-immutable-resource", () => {
	it("reports a resource() field", () => {
		expect.assertions(2);

		const code = lines("class App {", "	users = resource({ loader: async () => [] });", "}");
		const result = lint(code);

		expect(result.messages).toMatchObject([preferImmutableResource]);
		expect(result.output).toBe(
			lines("class App {", "	readonly users = resource({ loader: async () => [] });", "}")
		);
	});

	it("reports an rxResource() field", () => {
		expect.assertions(2);

		const code = lines("class App {", "	items = rxResource({ stream: () => of([]) });", "}");
		const result = lint(code);

		expect(result.messages).toMatchObject([preferImmutableResource]);
		expect(result.output).toBe(
			lines("class App {", "	readonly items = rxResource({ stream: () => of([]) });", "}")
		);
	});

	it("reports a ResourceRef annotation", () => {
		expect.assertions(2);

		const code = lines("class App {", "	extra!: ResourceRef<unknown[]>;", "}");
		const result = lint(code);

		expect(result.messages).toMatchObject([preferImmutableResource]);
		expect(result.output).toBe(lines("class App {", "	readonly extra!: ResourceRef<unknown[]>;", "}"));
	});

	it("inserts readonly after an existing modifier", () => {
		expect.assertions(2);

		const code = lines("class App {", "	public users = resource({ loader: async () => [] });", "}");
		const result = lint(code);

		expect(result.messages).toMatchObject([preferImmutableResource]);
		expect(result.output).toBe(
			lines("class App {", "	public readonly users = resource({ loader: async () => [] });", "}")
		);
	});

	it("accepts a readonly resource() field", () => {
		expect.assertions(2);

		const code = lines("class App {", "	readonly users = resource({ loader: async () => [] });", "}");
		const result = lint(code);

		expect(result.messages).toStrictEqual([]);
		expect(result.output).toBe(code);
	});

	it("accepts a readonly ResourceRef annotation", () => {
		expect.assertions(2);

		const code = lines("class App {", "	readonly extra!: ResourceRef<unknown[]>;", "}");
		const result = lint(code);

		expect(result.messages).toStrictEqual([]);
		expect(result.output).toBe(code);
	});

	it("accepts an unrelated field", () => {
		expect.assertions(2);

		const code = lines("class App {", "	title = 'app';", "}");
		const result = lint(code);

		expect(result.messages).toStrictEqual([]);
		expect(result.output).toBe(code);
	});
});
