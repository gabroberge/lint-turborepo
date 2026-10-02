import { describe, expect, it } from "vitest";

import { assumptionOf } from "../testing/assumption-of";
import { classWith } from "../testing/class-with";
import { coreImport } from "../testing/core-import";
import { lines } from "../testing/lines";
import { angularAssumptions } from "./angular-assumptions";

describe(angularAssumptions, () => {
	it.each([
		{ name: "signal", value: "signal(1)" },
		{ name: "computed", value: "computed(() => 1)" },
		{ name: "linkedSignal", value: "linkedSignal(() => 1)" },
		{ name: "input", value: "input(1)" },
		{ name: "input", value: "input.required<number>()" },
		{ name: "model", value: "model(1)" },
		{ name: "model", value: "model.required<number>()" },
		{ name: "viewChild", value: 'viewChild("ref")' },
		{ name: "contentChildren", value: 'contentChildren("ref")' },
		{ name: "signal", value: "(signal)(1)" },
		{ name: "signal", value: "signal!(1)" },
		{ name: "signal", value: "(signal as typeof signal)(1)" },
		{ name: "signal", value: "signal?.(1)" }
	])("should assume $value returns a signal", ({ name, value }) => {
		expect.assertions(1);

		expect(assumptionOf(classWith(coreImport(name), value))).toBe("signal-factory");
	});

	it.each([
		{ name: "inject", value: "inject(Token)" },
		{ name: "output", value: "output<number>()" }
	])("should assume $value runs nothing observable", ({ name, value }) => {
		expect.assertions(1);

		expect(assumptionOf(classWith(coreImport(name), value))).toBe("factory");
	});

	it.each([
		{ name: "effect", value: "effect(() => undefined)" },
		{ name: "toSignal", value: "toSignal(source)" },
		{ name: "resource", value: "resource({ loader: () => load() })" }
	])("should assume nothing about $value", ({ name, value }) => {
		expect.assertions(1);

		expect(assumptionOf(classWith(coreImport(name), value))).toBeNull();
	});

	it("should follow an aliased import", () => {
		expect.assertions(1);

		expect(assumptionOf(classWith('import { signal as ngSignal } from "@angular/core";', "ngSignal(1)"))).toBe(
			"signal-factory"
		);
	});

	it("should follow a namespace import", () => {
		expect.assertions(2);

		const imports = 'import * as ng from "@angular/core";';

		expect(assumptionOf(classWith(imports, "ng.input.required<number>()"))).toBe("signal-factory");
		expect(assumptionOf(classWith(imports, "ng.inject(Token)"))).toBe("factory");
	});

	it("should assume nothing about a local function named like an Angular API", () => {
		expect.assertions(1);

		const code = lines(
			"function signal<T>(value: T): () => T {",
			"\treturn () => value;",
			"}",
			"class A {",
			"\tfield = signal(1);",
			"}"
		);

		expect(assumptionOf(code)).toBeNull();
	});

	it("should assume nothing about an import from another module", () => {
		expect.assertions(1);

		expect(assumptionOf(classWith('import { signal } from "./lib";', "signal(1)"))).toBeNull();
	});
});
