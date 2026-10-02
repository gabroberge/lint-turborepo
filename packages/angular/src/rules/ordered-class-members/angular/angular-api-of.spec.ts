import { describe, expect, it } from "vitest";

import { apiOf } from "../testing/api-of";
import { classWith } from "../testing/class-with";
import { innerApiOf } from "../testing/inner-api-of";
import { lines } from "../testing/lines";
import { angularApiOf } from "./angular-api-of";

describe(angularApiOf, () => {
	it.each([
		{
			expected: "signal",
			imports: 'import { signal } from "@angular/core";',
			name: "a named import",
			value: "signal(1)"
		},
		{
			expected: "signal",
			imports: 'import { signal as ngSignal } from "@angular/core";',
			name: "an aliased import",
			value: "ngSignal(1)"
		},
		{
			expected: "signal",
			imports: 'import * as ng from "@angular/core";',
			name: "a namespace import",
			value: "ng.signal(1)"
		},
		{
			expected: "input.required",
			imports: 'import { input } from "@angular/core";',
			name: "a required input",
			value: "input.required<number>()"
		},
		{
			expected: "input.required",
			imports: 'import { input as ngInput } from "@angular/core";',
			name: "an aliased required input",
			value: "ngInput.required<number>()"
		},
		{
			expected: "input.required",
			imports: 'import * as ng from "@angular/core";',
			name: "a namespaced required input",
			value: "ng.input.required<number>()"
		},
		{
			expected: "signal",
			imports: 'import { signal } from "@angular/core";',
			name: "a wrapped callee",
			value: "(signal)(1)"
		}
	])("should resolve $name", ({ expected, imports, value }) => {
		expect.assertions(1);

		expect(apiOf(classWith(imports, value))).toBe(expected);
	});

	it.each([
		{ imports: 'import type { signal } from "@angular/core";', name: "a type-only import", value: "signal(1)" },
		{
			imports: 'import { type signal } from "@angular/core";',
			name: "a type-only specifier",
			value: "signal(1)"
		},
		{
			imports: "function signal(value: number): number {\n\treturn value;\n}",
			name: "a local function sharing the name",
			value: "signal(1)"
		},
		{
			imports: 'import { signal } from "@preact/signals";',
			name: "an import of another module",
			value: "signal(1)"
		},
		{ imports: "", name: "a global", value: "signal(1)" },
		{ imports: 'import * as ng from "@angular/core";', name: "a namespace call", value: "ng(1)" },
		{
			imports: 'import * as ng from "@angular/core";',
			name: "a computed namespace member",
			value: 'ng["signal"](1)'
		},
		{
			imports: 'import { required } from "./lib";',
			name: "a non-Angular required call",
			value: "required.required()"
		},
		{ imports: 'import { input } from "@angular/core";', name: "another member of an API", value: "input.other()" },
		{ imports: 'import { make } from "./lib";', name: "a call result", value: "make()()" }
	])("should ignore $name", ({ imports, value }) => {
		expect.assertions(1);

		expect(apiOf(classWith(imports, value))).toBeNull();
	});

	it("should ignore a parameter shadowing an import", () => {
		expect.assertions(1);

		const code = lines(
			'import { signal } from "@angular/core";',
			"class A {",
			"\tx = ((signal: (value: number) => number) => signal(1))((value) => value);",
			"}"
		);

		expect(innerApiOf(code)).toBeNull();
	});
});
