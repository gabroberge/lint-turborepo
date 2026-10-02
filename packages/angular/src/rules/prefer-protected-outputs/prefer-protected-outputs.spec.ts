import { describe, expect, it } from "vitest";

import { preferProtectedOutputsRule } from "./prefer-protected-outputs";
import { lines } from "./testing/lines";
import { lint } from "./testing/lint";

const preferProtectedOutput = {
	messageId: "preferProtectedOutput",
	ruleId: "angular/prefer-protected-outputs"
};

describe("prefer-protected-outputs meta", () => {
	it("errors by default", () => {
		expect.assertions(1);

		expect(preferProtectedOutputsRule.defaultSeverity).toBe("error");
	});

	it("is recommended", () => {
		expect.assertions(1);

		expect(preferProtectedOutputsRule.meta?.docs?.recommended).toBe(true);
	});

	it("offers an autofix", () => {
		expect.assertions(1);

		expect(preferProtectedOutputsRule.meta?.fixable).toBe("code");
	});
});

describe("prefer-protected-outputs", () => {
	it("reports an implicit-public output() field", () => {
		expect.assertions(2);

		const code = lines("class App {", "	clicked = output();", "}");
		const result = lint(code);

		expect(result.messages).toMatchObject([preferProtectedOutput]);
		expect(result.output).toBe(lines("class App {", "	protected clicked = output();", "}"));
	});

	it("rewrites a public output() field", () => {
		expect.assertions(2);

		const code = lines("class App {", "	public saved = output<string>();", "}");
		const result = lint(code);

		expect(result.messages).toMatchObject([preferProtectedOutput]);
		expect(result.output).toBe(lines("class App {", "	protected saved = output<string>();", "}"));
	});

	it("rewrites a private output() field", () => {
		expect.assertions(2);

		const code = lines("class App {", "	private closed = output();", "}");
		const result = lint(code);

		expect(result.messages).toMatchObject([preferProtectedOutput]);
		expect(result.output).toBe(lines("class App {", "	protected closed = output();", "}"));
	});

	it("inserts protected before readonly", () => {
		expect.assertions(2);

		const code = lines("class App {", "	readonly clicked = output();", "}");
		const result = lint(code);

		expect(result.messages).toMatchObject([preferProtectedOutput]);
		expect(result.output).toBe(lines("class App {", "	protected readonly clicked = output();", "}"));
	});

	it("reports an OutputEmitterRef annotation", () => {
		expect.assertions(2);

		const code = lines("class App {", "	events!: OutputEmitterRef<void>;", "}");
		const result = lint(code);

		expect(result.messages).toMatchObject([preferProtectedOutput]);
		expect(result.output).toBe(lines("class App {", "	protected events!: OutputEmitterRef<void>;", "}"));
	});

	it("accepts a protected output() field", () => {
		expect.assertions(2);

		const code = lines("class App {", "	protected clicked = output();", "}");
		const result = lint(code);

		expect(result.messages).toStrictEqual([]);
		expect(result.output).toBe(code);
	});

	it("accepts a protected readonly OutputEmitterRef annotation", () => {
		expect.assertions(2);

		const code = lines("class App {", "	protected readonly events!: OutputEmitterRef<void>;", "}");
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
