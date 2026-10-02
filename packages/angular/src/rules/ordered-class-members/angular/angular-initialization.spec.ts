import type { Conflict } from "@gabroberge/typescript-class-analyzer";
import { describe, expect, it } from "vitest";

import { analyzeInitialization } from "../testing/analyze-initialization";
import { lines } from "../testing/lines";
import { angularAssumptions } from "./angular-assumptions";

interface ConflictCase {
	code: string;
	expected: Conflict;
	first: string;
	name: string;
	second: string;
}

const NG_IMPORT = 'import { computed, effect, inject, input, signal, untracked } from "@angular/core";';
const INTEROP_IMPORT = 'import { toSignal } from "@angular/core/rxjs-interop";';
const LIB_IMPORT = 'import { log, makeFn, source$, Token } from "./lib";';
/** A module binding that is reassigned, so reading it reads mutable outside state. */
const MUTABLE_COUNTER = lines("let counter = 0;", "export function bump(): void {", "\tcounter += 1;", "}");

const CASES: ConflictCase[] = [
	{
		code: lines(NG_IMPORT, "class A {", "\tx = signal(1);", "\tdoubled = computed(() => this.x() * 2);", "}"),
		expected: "none",
		first: "x",
		name: "a read deferred by an Angular computed",
		second: "doubled"
	},
	{
		code: lines(
			"function computed<T>(fn: () => T): T {",
			"\treturn fn();",
			"}",
			"class A {",
			"\tx = 1;",
			"\tdoubled = computed(() => this.x * 2);",
			"}"
		),
		expected: "definite",
		first: "x",
		name: "a read inside a callback of a local computed function",
		second: "doubled"
	},
	{
		code: lines(
			NG_IMPORT,
			"class A {",
			"\tcount = signal(0);",
			"\tdoubled = computed(() => this.count() * 2);",
			"\tquadrupled = this.doubled() * 2;",
			"}"
		),
		expected: "definite",
		first: "count",
		name: "an eager call of a computed reading another signal",
		second: "quadrupled"
	},
	{
		code: lines(NG_IMPORT, LIB_IMPORT, "class A {", "\tsvc = inject(Token);", "\ta = log();", "}"),
		expected: "none",
		first: "svc",
		name: "an inject call and an unknown call",
		second: "a"
	},
	{
		code: lines(
			NG_IMPORT,
			"class A {",
			"\tcount = signal(0);",
			"\tdoubled = computed(() => this.count() * 2);",
			"\tsnapshot = untracked(this.doubled);",
			"}"
		),
		expected: "definite",
		first: "doubled",
		name: "an Angular call outside the order-insensitive factories",
		second: "snapshot"
	},
	{
		code: lines(INTEROP_IMPORT, LIB_IMPORT, "class A {", "\tvalue = toSignal(source$);", "\ta = log();", "}"),
		expected: "uncertain",
		first: "value",
		name: "a toSignal call and another side effect",
		second: "a"
	},
	{
		code: lines(NG_IMPORT, LIB_IMPORT, "class A {", "\tlogger = effect(() => log());", "\ta = log();", "}"),
		expected: "uncertain",
		first: "logger",
		name: "an effect call and another side effect",
		second: "a"
	}
];

describe(angularAssumptions, () => {
	describe("conflicts the class analyzer finds", () => {
		it.each(CASES)("should find $expected conflict for $name", ({ code, expected, first, second }) => {
			expect.assertions(1);

			expect(analyzeInitialization(code).conflict(first, second)).toBe(expected);
		});
	});

	describe("eager calls of fields against a read of mutable outside state", () => {
		it("should not find a conflict for an eager call of an input", () => {
			expect.assertions(1);

			const code = lines(
				NG_IMPORT,
				MUTABLE_COUNTER,
				"class A {",
				"\tvalue = input(0);",
				"\tdoubled = this.value() * 2;",
				"\tsnapshot = counter;",
				"}"
			);

			expect(analyzeInitialization(code).conflict("doubled", "snapshot")).toBe("none");
		});

		it("should find an uncertain conflict for an eager call of a field holding an unknown function", () => {
			expect.assertions(1);

			const code = lines(
				LIB_IMPORT,
				MUTABLE_COUNTER,
				"class A {",
				"\tfn = makeFn();",
				"\tresult = this.fn();",
				"\tsnapshot = counter;",
				"}"
			);

			expect(analyzeInitialization(code).conflict("result", "snapshot")).toBe("uncertain");
		});
	});
});
