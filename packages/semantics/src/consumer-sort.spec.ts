import { describe, expect, it } from "vitest";

import { evaluateClass } from "./testing/evaluate-class";
import { lines } from "./testing/lines";
import { safeSort } from "./testing/safe-sort";

import type { ClassAssumptions } from "./index";
import { NO_ASSUMPTIONS } from "./index";

/**
 * What a consumer knows about its own store library, by callee name: `atom()`
 * builds a callable value, `token()` and any `.make()` build plain values.
 */
const STORE_ASSUMPTIONS: ClassAssumptions = {
	assumeCall({ callee }) {
		if (callee.type === "Identifier") {
			return callee.name === "atom" ? "signal-factory" : callee.name === "token" ? "factory" : null;
		}

		return callee.type === "MemberExpression" &&
			callee.property.type === "Identifier" &&
			callee.property.name === "make"
			? "factory"
			: null;
	}
};

const SETTINGS = lines(
	"class Settings {",
	"\tzoom = 1.5;",
	'\ttitle = "Untitled";',
	"\tmargins = 8 * 2;",
	"\tenabled = !false;",
	'\tcolors = { primary: "#000" };',
	"\thandler = () => 0;",
	"}"
);

const INVOICE = lines(
	"class Invoice {",
	'\tzone = "EU";',
	"\tsubtotal = 100;",
	"\tvat = 0.2;",
	"\ttax = this.taxFor();",
	'\tlabel = "invoice";',
	"\tquantity = 3;",
	"\tamount = this.total;",
	'\tcurrency = "EUR";',
	"\ttaxFor(): number {",
	"\t\treturn this.subtotal * this.vat;",
	"\t}",
	"\tget total(): number {",
	"\t\treturn this.subtotal + this.tax;",
	"\t}",
	"}"
);

const HANDED_CALLBACK = lines("class A {", "\tx = 1;", "\tf = () => this.x;", "\ta = run(this.f);", "}");

const TWO_RECORDS = lines("class A {", '\tzed = record("zed");', '\talpha = record("alpha");', "}");

const TIMELINES = lines(
	"class A {",
	"\tstatic zs = 1;",
	"\tzi = 1;",
	"\tstatic ys = 2;",
	"\tstatic {",
	'\t\trecord("block");',
	"\t}",
	"\tstatic as = 3;",
	"\tai = 2;",
	"}"
);

const STORE = lines(
	'import { atom, token } from "./store";',
	"class Counter {",
	"\tzcount = atom(0);",
	"\tservice = token();",
	"\tdoubled = atom(() => this.zcount() * 2);",
	'\taudit = record("audit");',
	"}"
);

const CLIENT = lines(
	"class Client {",
	"\tlib = { make: () => 1 };",
	"\tmade = this.lib.make();",
	"\tagain = (this.lib = { make: () => 2 });",
	"\tcount = counter;",
	"}"
);

describe("safe alphabetical sort", () => {
	describe("independent initializers", () => {
		it("should reorder literals and pure expressions alphabetically", () => {
			expect.assertions(2);

			const { blocked, order } = safeSort(SETTINGS);

			expect(order).toStrictEqual(["colors", "enabled", "handler", "margins", "title", "zoom"]);
			expect(blocked).toStrictEqual([]);
		});

		it("should not change what the class observes", () => {
			expect.assertions(1);

			expect(evaluateClass(safeSort(SETTINGS).source, "Settings")).toStrictEqual(
				evaluateClass(SETTINGS, "Settings")
			);
		});
	});

	describe("direct initialization dependencies", () => {
		it("should keep a field after the field it reads", () => {
			expect.assertions(1);

			expect(
				safeSort(lines("class A {", "\tzeta = 1;", "\tbeta = this.zeta + 1;", "\talpha = 0;", "}")).order
			).toStrictEqual(["alpha", "zeta", "beta"]);
		});

		it("should keep reads through a method and a getter in order while unrelated members move around them", () => {
			expect.assertions(2);

			const { blocked, order } = safeSort(INVOICE);

			expect(order).toStrictEqual([
				"currency",
				"label",
				"quantity",
				"subtotal",
				"taxFor",
				"total",
				"vat",
				"tax",
				"amount",
				"zone"
			]);
			expect(blocked).toStrictEqual([]);
		});

		it("should not change what the class observes", () => {
			expect.assertions(2);

			const reordered = evaluateClass(safeSort(INVOICE).source, "Invoice");

			expect(reordered).toStrictEqual(evaluateClass(INVOICE, "Invoice"));
			expect(reordered.instance["amount"]).toBe(120);
		});

		it("should differ from a naive alphabetical sort, which the evaluation detects", () => {
			expect.assertions(1);

			const naive = lines("class A {", "\talpha = 0;", "\tbeta = this.zeta + 1;", "\tzeta = 1;", "}");

			expect(evaluateClass(naive, "A")).not.toStrictEqual(
				evaluateClass(lines("class A {", "\tzeta = 1;", "\tbeta = this.zeta + 1;", "\talpha = 0;", "}"), "A")
			);
		});
	});

	describe("function fields", () => {
		describe("when the function is only stored", () => {
			it("should not pin the field it reads", () => {
				expect.assertions(1);

				expect(safeSort(lines("class A {", "\tx = 1;", "\tf = () => this.x;", "}")).order).toStrictEqual([
					"f",
					"x"
				]);
			});
		});

		describe("when the function is called eagerly", () => {
			it("should keep the caller after the field the function reads", () => {
				expect.assertions(1);

				expect(
					safeSort(lines("class A {", "\tx = 1;", "\tf = () => this.x;", "\ta = this.f();", "}")).order
				).toStrictEqual(["f", "x", "a"]);
			});
		});

		describe("when the function is handed to unknown code", () => {
			it("should keep the caller after the field the function reads", () => {
				expect.assertions(1);

				expect(safeSort(HANDED_CALLBACK).order).toStrictEqual(["f", "x", "a"]);
			});

			it("should not change what the class observes", () => {
				expect.assertions(2);

				const reordered = evaluateClass(safeSort(HANDED_CALLBACK).source, "A");

				expect(reordered).toStrictEqual(evaluateClass(HANDED_CALLBACK, "A"));
				expect(reordered.instance["a"]).toBe(1);
			});
		});
	});

	describe("unknown calls", () => {
		describe("when two unknown calls would swap", () => {
			it("should keep them in source order and report the withheld move", () => {
				expect.assertions(2);

				const { blocked, order } = safeSort(TWO_RECORDS);

				expect(order).toStrictEqual(["zed", "alpha"]);
				expect(blocked).toStrictEqual([["zed", "alpha"]]);
			});

			it("should keep the side-effect log", () => {
				expect.assertions(2);

				const reordered = evaluateClass(safeSort(TWO_RECORDS).source, "A");

				expect(reordered).toStrictEqual(evaluateClass(TWO_RECORDS, "A"));
				expect(reordered.log).toStrictEqual(["zed", "alpha"]);
			});
		});

		describe("when an unknown call would swap with a literal", () => {
			it("should move the literal", () => {
				expect.assertions(2);

				const { blocked, order } = safeSort(lines("class A {", '\tzed = record("zed");', "\talpha = 1;", "}"));

				expect(order).toStrictEqual(["alpha", "zed"]);
				expect(blocked).toStrictEqual([]);
			});
		});

		describe("when an unknown call would swap with a read of a reassigned outside binding", () => {
			it("should withhold the move", () => {
				expect.assertions(2);

				const { blocked, order } = safeSort(
					lines(
						"let mode = 1;",
						"export function setMode(next: number): void {",
						"\tmode = next;",
						"}",
						"class A {",
						'\tzed = record("zed");',
						"\talpha = mode;",
						"}"
					)
				);

				expect(order).toStrictEqual(["zed", "alpha"]);
				expect(blocked).toStrictEqual([["zed", "alpha"]]);
			});
		});

		describe("when an unknown call would swap with a read of a constant outside binding", () => {
			it("should move the read", () => {
				expect.assertions(2);

				const { blocked, order } = safeSort(
					lines("const mode = 1;", "class A {", '\tzed = record("zed");', "\talpha = mode;", "}")
				);

				expect(order).toStrictEqual(["alpha", "zed"]);
				expect(blocked).toStrictEqual([]);
			});
		});
	});

	describe("static and instance initialization", () => {
		it("should move instance fields past static ones and keep static fields around a static block", () => {
			expect.assertions(2);

			const { blocked, order } = safeSort(TIMELINES);

			expect(order).toStrictEqual(["ai", "ys", "zi", "zs", "static block", "as"]);
			expect(blocked).toStrictEqual([
				["zs", "static block"],
				["static block", "as"]
			]);
		});

		it("should not order side effects of different timelines against each other", () => {
			expect.assertions(2);

			const { blocked, order } = safeSort(
				lines("class A {", '\tstatic zs = record("zs");', '\tai = record("ai");', "}")
			);

			expect(order).toStrictEqual(["ai", "zs"]);
			expect(blocked).toStrictEqual([]);
		});

		it("should not change what the class observes", () => {
			expect.assertions(1);

			expect(evaluateClass(safeSort(TIMELINES).source, "A")).toStrictEqual(evaluateClass(TIMELINES, "A"));
		});
	});

	describe("initializers the analysis cannot see through", () => {
		it.each([
			["this escaping", "class A {\n\tz = register(this);\n\ta = 1;\n}\n"],
			["a dynamic member access", "class A {\n\tz = this[key];\n\ta = 1;\n}\n"],
			["an inherited member", "class A extends Base {\n\tz = this.fromBase;\n\ta = 1;\n}\n"],
			["super", "class A extends Base {\n\tz = super.toString();\n\ta = 1;\n}\n"]
		])("should keep %s in source order and report the withheld move", (_name, code) => {
			expect.assertions(2);

			const { blocked, order } = safeSort(code);

			expect(order).toStrictEqual(["z", "a"]);
			expect(blocked).toStrictEqual([["z", "a"]]);
		});

		it("should still move plain fields of a derived class", () => {
			expect.assertions(2);

			const { blocked, order } = safeSort(lines("class A extends Base {", "\tz = 2;", "\ta = 1;", "}"));

			expect(order).toStrictEqual(["a", "z"]);
			expect(blocked).toStrictEqual([]);
		});
	});

	describe("class assumptions", () => {
		describe("when no assumptions are given", () => {
			it("should keep store calls in order", () => {
				expect.assertions(2);

				const { blocked, order } = safeSort(STORE, NO_ASSUMPTIONS);

				expect(order).toStrictEqual(["zcount", "service", "doubled", "audit"]);
				expect(blocked).toStrictEqual([
					["zcount", "service"],
					["service", "doubled"],
					["zcount", "audit"]
				]);
			});
		});

		describe("when the store library is described", () => {
			it("should sort store calls freely", () => {
				expect.assertions(2);

				const { blocked, order } = safeSort(STORE, STORE_ASSUMPTIONS);

				expect(order).toStrictEqual(["audit", "doubled", "service", "zcount"]);
				expect(blocked).toStrictEqual([]);
			});
		});

		describe("when a factory is reached through a member", () => {
			it("should keep the member read before its use and its reassignment after", () => {
				expect.assertions(2);

				const { blocked, order } = safeSort(CLIENT, STORE_ASSUMPTIONS);

				expect(order).toStrictEqual(["count", "lib", "made", "again"]);
				expect(blocked).toStrictEqual([]);
			});

			it("should withhold the move past the unknown call without assumptions", () => {
				expect.assertions(2);

				const { blocked, order } = safeSort(CLIENT, NO_ASSUMPTIONS);

				expect(order).toStrictEqual(["lib", "made", "again", "count"]);
				expect(blocked).toStrictEqual([["made", "count"]]);
			});

			it("should not change what the class observes", () => {
				expect.assertions(2);

				const reordered = evaluateClass(safeSort(CLIENT, STORE_ASSUMPTIONS).source, "Client");

				expect(reordered).toStrictEqual(evaluateClass(CLIENT, "Client"));
				expect(reordered.instance["made"]).toBe(1);
			});
		});
	});
});
