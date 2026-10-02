import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";

import { decisionParse } from "../testing/decision-parse";
import { decisionPointsIn } from "./decision-points-in";
import { guardOf } from "./guard-of";

const NO_BOUNDARIES: ReadonlySet<ESTree.Node> = new Set();

const COMPONENT = `
@Component({ selector: "app-cart", template: "" })
export class CartComponent {
	private readonly items = signal<Item[]>([]);

	checkout(coupon?: string, express = false): void {
		const items = this.items();
		if (items.length === 0) {
			this.toast?.show("empty");
			return;
		}

		const discount = coupon ? this.discounts.get(coupon) ?? noDiscount : 0;
		for (const item of items) {
			item.total ??= item.price * item.quantity;
		}

		this.router.navigate(express ? ["/express"] : ["/checkout"], { state: { discount } });
	}
}
`;

/** `kind/label` of the guard of the outermost node whose source is `source`, or `null`. */
function guardIn(code: string, source: string, type?: string): string | null {
	const parsed = decisionParse(code);
	const guard = guardOf(parsed.find(source, type), decisionPointsIn([parsed.program], NO_BOUNDARIES));
	return guard === null ? null : `${guard.decision.kind}/${guard.outcome.label}`;
}

describe(guardOf, () => {
	describe("if statements", () => {
		const code = "before(); if (test) { yes(); } else { no(); } after();";

		it.each([
			["before()", null],
			["test", null],
			["yes()", "if/then"],
			["{ yes(); }", "if/then"],
			["no()", "if/else"],
			["after()", null],
			[code.slice(10, -9), null]
		])("should guard %s by %s", (source, expected) => {
			expect.assertions(1);

			expect(guardIn(code, source)).toBe(expected);
		});

		it("should guard a node by the innermost of nested ifs", () => {
			expect.assertions(1);

			const parsed = decisionParse("if (outer) { if (inner) { deep(); } }");
			const guard = guardOf(parsed.find("deep()"), decisionPointsIn([parsed.program], NO_BOUNDARIES));

			expect(guard?.decision.node).toBe(parsed.find("if (inner) { deep(); }"));
		});

		it("should guard the test of an else-if by the outer else", () => {
			expect.assertions(1);

			expect(guardIn("if (a) b(); else if (second) c();", "second")).toBe("if/else");
		});
	});

	describe("expressions", () => {
		it.each([
			["x = test ? yes : no;", "test", null],
			["x = test ? yes : no;", "yes", "conditional/true"],
			["x = test ? yes : no;", "no", "conditional/false"],
			["left && right;", "left", null],
			["left && right;", "right", "logical-and/right"],
			["left || right;", "right", "logical-or/right"],
			["left ?? right;", "right", "nullish/right"],
			["first && second || third;", "first", null],
			["first && second || third;", "second", "logical-and/right"],
			["first && second || third;", "third", "logical-or/right"],
			["first && second || third;", "first && second", null],
			["cache ??= compute();", "cache", null],
			["cache ??= compute();", "compute()", "logical-assignment/assign"],
			["function f(param = fallback()) {}", "param", null],
			["function f(param = fallback()) {}", "fallback()", "default-value/default"],
			["const { a = fallback } = o;", "fallback", "default-value/default"]
		])("in %s should guard %s by %s", (code, source, expected) => {
			expect.assertions(1);

			expect(guardIn(code, source)).toBe(expected);
		});
	});

	describe("switch statements", () => {
		const code = "switch (subject) { case key: one(); case other: two(); break; default: three(); }";

		it.each([
			["subject", null],
			["key", null],
			["one()", "switch/case 0"],
			["other", null],
			["two()", "switch/case 1"],
			["break;", "switch/case 1"],
			["three()", "switch/default"]
		])("should guard %s by %s", (source, expected) => {
			expect.assertions(1);

			expect(guardIn(code, source)).toBe(expected);
		});
	});

	describe("loops", () => {
		it.each([
			["for (let i = init; i < limit; i++) { body(); }", "init", null],
			["for (let i = init; i < limit; i++) { body(); }", "i < limit", null],
			["for (let i = init; i < limit; i++) { body(); }", "i++", null],
			["for (let i = init; i < limit; i++) { body(); }", "body()", "loop/body"],
			["for (const item of items) use(item);", "items", null],
			["for (const item of items) use(item);", "use(item)", "loop/body"],
			["for (const key in object) use(key);", "use(key)", "loop/body"],
			["while (more) work();", "more", null],
			["while (more) work();", "work()", "loop/body"],
			["do { again(); } while (more);", "again()", null],
			["do { again(); } while (more);", "more", null]
		])("in %s should guard %s by %s", (code, source, expected) => {
			expect.assertions(1);

			expect(guardIn(code, source)).toBe(expected);
		});
	});

	describe("try statements", () => {
		const code = "try { risky(); } catch (error) { handle(error); } finally { cleanup(); }";

		it.each([
			["risky()", null],
			["error", "catch/catch"],
			["handle(error)", "catch/catch"],
			["cleanup()", null]
		])("should guard %s by %s", (source, expected) => {
			expect.assertions(1);

			expect(guardIn(code, source)).toBe(expected);
		});
	});

	describe("optional chains", () => {
		const code = "x = target?.method(argument).next?.(other);";

		it.each([
			["target", null],
			["method", "optional-chain/continue"],
			["argument", "optional-chain/continue"],
			["other", "optional-chain/continue"]
		])("should guard %s by %s", (source, expected) => {
			expect.assertions(1);

			expect(guardIn(code, source)).toBe(expected);
		});

		it("should guard the arguments of the last link by that link", () => {
			expect.assertions(1);

			const parsed = decisionParse(code);
			const guard = guardOf(parsed.find("other"), decisionPointsIn([parsed.program], NO_BOUNDARIES));

			expect(guard?.decision.node).toBe(parsed.find("target?.method(argument).next?.(other)", "CallExpression"));
		});

		it("should guard an earlier argument by the first link", () => {
			expect.assertions(1);

			const parsed = decisionParse(code);
			const guard = guardOf(parsed.find("argument"), decisionPointsIn([parsed.program], NO_BOUNDARIES));

			expect(guard?.decision.node).toBe(parsed.find("target?.method"));
		});

		it("should not guard code after a parenthesized chain", () => {
			expect.assertions(1);

			expect(guardIn("x = (target?.inner).outer;", "outer")).toBeNull();
		});
	});

	describe("decision lists", () => {
		it("should return null for an empty list", () => {
			expect.assertions(1);

			const parsed = decisionParse("if (a) b();");

			expect(guardOf(parsed.find("b()"), [])).toBeNull();
		});

		it("should only consider the given decisions", () => {
			expect.assertions(1);

			const parsed = decisionParse("if (a) { c && inner(); }");
			const decisions = decisionPointsIn([parsed.program], NO_BOUNDARIES).filter(
				(decision) => decision.kind === "if"
			);

			expect(guardOf(parsed.find("inner()"), decisions)?.outcome.label).toBe("then");
		});

		it("should not guard code inside a boundary by decisions of the enclosing unit's own code", () => {
			expect.assertions(1);

			const parsed = decisionParse("if (a) { list.map((x) => x.y); }");
			const decisions = decisionPointsIn([parsed.program], new Set(parsed.all("ArrowFunctionExpression")));

			// Syntax only: the arrow lies in the `then` region, whatever runs it.
			expect(guardOf(parsed.find("x.y"), decisions)?.outcome.label).toBe("then");
		});
	});

	describe("a realistic Angular component method", () => {
		it.each([
			["const items = this.items();", null],
			['this.toast?.show("empty")', "if/then"],
			['"empty"', "optional-chain/continue"],
			["return;", "if/then"],
			["this.discounts.get(coupon) ?? noDiscount", "conditional/true"],
			["noDiscount", "nullish/right"],
			["item.price * item.quantity", "logical-assignment/assign"],
			["item.total ??= item.price * item.quantity;", "loop/body"],
			['["/express"]', "conditional/true"],
			['["/checkout"]', "conditional/false"],
			["{ state: { discount } }", null],
			["false", "default-value/default"]
		])("should guard %s by %s", (source, expected) => {
			expect.assertions(1);

			const parsed = decisionParse(COMPONENT);
			const method = parsed.all("MethodDefinition")[0];
			const code = method?.type === "MethodDefinition" ? [method.value] : [];
			const boundaries = new Set([...parsed.all("ClassDeclaration"), ...parsed.all("FunctionExpression")]);
			const guard = guardOf(parsed.find(source), decisionPointsIn(code, boundaries));

			expect(guard === null ? null : `${guard.decision.kind}/${guard.outcome.label}`).toBe(expected);
		});
	});
});
