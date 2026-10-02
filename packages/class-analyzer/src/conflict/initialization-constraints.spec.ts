import { describe, expect, it } from "vitest";

import type { ClassAssumptions } from "../assumptions/class-assumptions";
import { NO_ASSUMPTIONS } from "../assumptions/no-assumptions";
import { initializationEffects } from "../effects/initialization-effects";
import { analyzeMembers } from "../member/analyze-members";
import { conflictsOf } from "../testing/conflicts-of";
import { FRAMEWORK_ASSUMPTIONS, FRAMEWORK_IMPORT } from "../testing/framework-assumptions";
import { lines } from "../testing/lines";
import { parseWithScope } from "../testing/parse-with-scope";
import { recordingAssumptions } from "../testing/recording-assumptions";
import type { Conflict } from "./conflict";
import { conflictTable } from "./conflict-table";
import { initializationConstraints } from "./initialization-constraints";

interface AssumptionCase {
	code: string;
	first: string;
	name: string;
	second: string;
	withAssumptions: Conflict;
	withoutAssumptions: Conflict;
}

const LIB_IMPORT = 'import { log, Token } from "./lib";';

const ASSUMPTION_CASES: AssumptionCase[] = [
	{
		code: lines(FRAMEWORK_IMPORT, "class A {", "\tx = cell(1);", "\tdoubled = derive(() => this.x() * 2);", "}"),
		first: "x",
		name: "a callback passed to a signal factory",
		second: "doubled",
		withAssumptions: "none",
		withoutAssumptions: "definite"
	},
	{
		code: lines(FRAMEWORK_IMPORT, LIB_IMPORT, "class A {", "\ta = log();", "\tb = defer(() => log());", "}"),
		first: "a",
		name: "a side effect stored by a factory",
		second: "b",
		withAssumptions: "none",
		withoutAssumptions: "uncertain"
	},
	{
		code: lines(FRAMEWORK_IMPORT, LIB_IMPORT, "class A {", "\tsvc = provide(Token);", "\ta = log();", "}"),
		first: "svc",
		name: "a factory call next to an unknown call",
		second: "a",
		withAssumptions: "none",
		withoutAssumptions: "uncertain"
	},
	{
		code: lines(
			FRAMEWORK_IMPORT,
			"class A {",
			"\tcount = cell(0);",
			"\tread = this.count();",
			"\tb = someGlobal;",
			"}"
		),
		first: "read",
		name: "invoking a signal-factory field next to an outside read",
		second: "b",
		withAssumptions: "none",
		withoutAssumptions: "uncertain"
	},
	{
		code: lines(
			FRAMEWORK_IMPORT,
			"class A {",
			"\tsvc = provide(Token);",
			"\tread = this.svc();",
			"\tb = someGlobal;",
			"}"
		),
		first: "read",
		name: "invoking a plain factory field next to an outside read",
		second: "b",
		withAssumptions: "uncertain",
		withoutAssumptions: "uncertain"
	},
	{
		code: lines(FRAMEWORK_IMPORT, "class A {", "\ta = 1;", "\tb = provide(this.a);", "}"),
		first: "a",
		name: "a member read as a factory argument",
		second: "b",
		withAssumptions: "definite",
		withoutAssumptions: "definite"
	},
	{
		code: lines(
			LIB_IMPORT,
			"function derive<T>(fn: () => T): T {",
			"\treturn fn();",
			"}",
			"class A {",
			"\tx = 1;",
			"\tdoubled = derive(() => this.x * 2);",
			"}"
		),
		first: "x",
		name: "a same-named function that is not the framework's",
		second: "doubled",
		withAssumptions: "definite",
		withoutAssumptions: "definite"
	}
];

describe(initializationConstraints, () => {
	it("should be the conflict table of the members' initialization effects", () => {
		expect.assertions(2);

		const code = lines(
			FRAMEWORK_IMPORT,
			"class Cart {",
			"\titems = cell<string[]>([]);",
			"\ttotal = derive(() => this.items().length);",
			"\tready = this.total() > 0;",
			"\tapi = connect();",
			'\tlabel = "cart";',
			"\tadd(): void {}",
			"}"
		);
		const { body, sourceCode } = parseWithScope(code);
		const members = analyzeMembers(body);
		const effects = initializationEffects(sourceCode, body, members, FRAMEWORK_ASSUMPTIONS);
		const fromTable = conflictTable(members, effects);
		const direct = initializationConstraints(sourceCode, body, members, FRAMEWORK_ASSUMPTIONS);
		const pairs = members.flatMap((earlier, index) =>
			members.slice(index + 1).map((later) => [earlier, later] as const)
		);

		expect(effects.map((effect) => effect === null)).toStrictEqual([false, false, false, false, false, true]);
		expect(pairs.map(([earlier, later]) => fromTable(earlier, later))).toStrictEqual(
			pairs.map(([earlier, later]) => direct(earlier, later))
		);
	});

	describe("with and without assumptions", () => {
		it.each(ASSUMPTION_CASES)(
			"should find $withAssumptions and $withoutAssumptions conflicts for $name",
			({ code, first, second, withAssumptions, withoutAssumptions }) => {
				expect.assertions(2);

				const pair = `${first}-${second}`;

				expect(conflictsOf(code, FRAMEWORK_ASSUMPTIONS)[pair]).toBe(withAssumptions);
				expect(conflictsOf(code, NO_ASSUMPTIONS)[pair]).toBe(withoutAssumptions);
			}
		);

		it("should ask the assumptions about every call of an initializer", () => {
			expect.assertions(1);

			const seen: string[] = [];
			const code = lines(
				LIB_IMPORT,
				"class A {",
				"\ta = log(Token);",
				"\tb = this.m();",
				"\tm(): number {",
				"\t\treturn 1;",
				"\t}",
				"}"
			);

			conflictsOf(code, recordingAssumptions(seen));

			expect(new Set(seen)).toStrictEqual(new Set(["log", "MemberExpression"]));
		});
	});

	describe("when a factory is reached through the analyzed object", () => {
		const makeIsFactory: ClassAssumptions = {
			assumeCall: (call) =>
				call.callee.type === "MemberExpression" &&
				call.callee.property.type === "Identifier" &&
				call.callee.property.name === "make"
					? "factory"
					: null
		};
		const code = lines(
			"class A {",
			"\tlib = { make: (): number => 1 };",
			"\ta = this.lib.make();",
			"\tb = (this.lib = { make: (): number => 2 });",
			"}"
		);

		it("should still read the member holding the factory", () => {
			expect.assertions(2);

			const conflicts = conflictsOf(code, makeIsFactory);

			expect(conflicts["lib-a"]).toBe("definite");
			expect(conflicts["a-b"]).toBe("definite");
		});
	});

	it("should constrain a realistic class end to end", () => {
		expect.assertions(1);

		const code = lines(
			FRAMEWORK_IMPORT,
			LIB_IMPORT,
			"export class Counter {",
			"\tstatic instances = 0;",
			"\tstatic label = `counter-${Counter.instances}`;",
			"\tservice = provide(Token);",
			"\tcount = cell(0);",
			"\tdoubled = derive(() => this.count() * 2);",
			"\tsnapshot = this.doubled();",
			"\tlogged = log();",
			"\tlater = log();",
			"\tincrement(): void {",
			"\t\tthis.count.set(this.count() + 1);",
			"\t}",
			"}"
		);

		expect(
			Object.fromEntries(
				Object.entries(conflictsOf(code, FRAMEWORK_ASSUMPTIONS)).filter(([, conflict]) => conflict !== "none")
			)
		).toStrictEqual({
			"count-snapshot": "definite",
			"doubled-snapshot": "definite",
			"instances-label": "definite",
			"logged-later": "uncertain",
			"snapshot-later": "uncertain",
			"snapshot-logged": "uncertain"
		});
	});
});
