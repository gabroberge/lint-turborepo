import { describe, expect, it } from "vitest";

import type { Options } from "./options/options";
import { lines } from "./testing/lines";
import { lint } from "./testing/lint";
import { lintWithOxlint } from "./testing/lint-with-oxlint";
import { ruleOptions } from "./testing/rule-options";

interface ParityCase {
	code: string;
	name: string;
	options?: Options;
}

const cases: ParityCase[] = [
	{
		code: lines(
			'import { Component, computed, inject, input, model, OnInit, output, signal } from "@angular/core";',
			"",
			"class Store {}",
			"",
			'@Component({ selector: "app-root", template: "" })',
			"export class Root implements OnInit {",
			"\thelper(): void {}",
			"\tngOnInit(): void {}",
			"\tstatic count = 0;",
			"\tconstructor() {}",
			'\ttitle = "root";',
			"\t/** Derived. */",
			"\ttotal = computed(() => this.selected() + 1);",
			"\tselected = signal(0); // state",
			"\tchanged = output<number>();",
			"\tvalue = model(0);",
			"\tsize = input(1);",
			"\tprivate readonly store = inject(Store);",
			"}"
		),
		name: "a component in reverse order"
	},
	{
		code: lines(
			'import { signal } from "@angular/core";',
			"",
			"class Picker {",
			'\tlabel = "x";',
			'\tdefaultSelection = "first";',
			"\tzoom = 1;",
			"\tselected = signal(this.defaultSelection);",
			"}"
		),
		name: "a signal initialized from a plain field"
	},
	{
		code: lines("class Spaced {", "\ta = 1;", "", "", "\tb = 2;", "\tconstructor() {}", "\tc(): void {}", "}"),
		name: "blank lines"
	},
	{
		code: lines(
			"class Visible {",
			"\tc = 3;",
			"",
			"\tpublic d = 4;",
			"\tprotected b = 2;",
			"\tprivate a = 1;",
			"\tconstructor() {}",
			"}"
		),
		name: "custom visibility and spacing",
		options: { newlinesBetween: "never", newlinesWithin: "ignore", visibility: ["private", "protected", "public"] }
	},
	{
		code: lines("class Subject {", "\tb = foo();", "\ta = foo();", "\tc = 1;", "}"),
		name: "initializers that may interact"
	},
	{
		code: lines("class Subject {", "\tz = 1;", '\tb = eval("this.z");', "}"),
		name: "a direct eval reading a field"
	},
	{
		code: lines("class Subject {", "\tb = 1; a = 2;", "}"),
		name: "two members on one line"
	}
];

describe("ordered-class-members with oxlint", { timeout: 120_000 }, () => {
	it.each(cases)("fixes $name like ESLint", ({ code, options }) => {
		expect.assertions(2);

		const eslint = lint(code, ruleOptions(options));
		const oxlint = lintWithOxlint(code, ruleOptions(options));

		expect(oxlint.output).toBe(eslint.output);
		expect(lintWithOxlint(oxlint.output, ruleOptions(options))).toStrictEqual({
			output: oxlint.output,
			status: lint(oxlint.output, ruleOptions(options)).messages.length === 0 ? 0 : 1
		});
	});
});
