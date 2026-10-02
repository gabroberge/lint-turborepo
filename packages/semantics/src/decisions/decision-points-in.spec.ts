import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";

import { decisionParse } from "../testing/decision-parse";
import { decisionPointsIn } from "./decision-points-in";

const NO_BOUNDARIES: ReadonlySet<ESTree.Node> = new Set();

const SERVICE = `
@Injectable()
export class OrderService {
	constructor(private readonly repository: OrderRepository, private readonly logger?: Logger) {}

	async findOrders(filter: OrderFilter = {}, limit = 20): Promise<Order[]> {
		const status = filter.status ?? "open";
		if (!this.repository.isReady()) {
			this.logger?.warn("repository not ready");
			return [];
		}

		try {
			const orders = await this.repository.find({ limit, status });
			for (const order of orders) {
				switch (order.kind) {
					case "express":
						order.priority ||= 1;
						break;
					case "standard":
						order.priority = order.total > 100 ? 2 : 3;
						break;
					default:
						order.priority = 4;
				}
			}

			return orders.filter((order) => order.visible && !order.archived);
		} catch (error) {
			this.logger?.error(error instanceof Error ? error.message : String(error));
			throw error;
		} finally {
			this.repository.release();
		}
	}
}
`;

function summariesIn(code: string): string[] {
	const parsed = decisionParse(code);
	return decisionPointsIn([parsed.program], NO_BOUNDARIES).map((decision) => parsed.summary(decision));
}

describe(decisionPointsIn, () => {
	describe("decision kinds", () => {
		it.each([
			["an if with an else", "if (a) { b(); } else { c(); }", ["if: then={ b(); } else={ c(); }"]],
			["an if with an implicit else", "if (a) b();", ["if: then=b(); else=-"]],
			[
				"an else-if chain",
				"if (a) b(); else if (c) d();",
				["if: then=b(); else=if (c) d();", "if: then=d(); else=-"]
			],
			["a conditional expression", "x = a ? b : c;", ["conditional: true=b false=c"]],
			["a logical and", "a && b;", ["logical-and: right=b short-circuit=-"]],
			["a logical or", "a || b;", ["logical-or: right=b short-circuit=-"]],
			["a nullish coalescing", "a ?? b;", ["nullish: right=b short-circuit=-"]],
			[
				"mixed logical operators",
				"a && b || c;",
				["logical-or: right=c short-circuit=-", "logical-and: right=b short-circuit=-"]
			],
			[
				"a switch with a default",
				"switch (x) { case 1: a(); break; default: b(); }",
				["switch: case 0=case 1: a(); break; default=default: b();"]
			],
			[
				"a switch without a default",
				"switch (x) { case 1: case 2: a(); }",
				["switch: case 0=case 1: case 1=case 2: a(); no-match=-"]
			],
			[
				"a default in the middle of a switch",
				"switch (x) { default: a(); case 1: b(); }",
				["switch: default=default: a(); case 1=case 1: b();"]
			],
			["a for loop", "for (let i = 0; i < n; i++) { a(); }", ["loop: body={ a(); } exit=-"]],
			["an endless for loop", "for (;;) a();", ["loop: body=a(); exit=-"]],
			["a for-in loop", "for (const key in object) a(key);", ["loop: body=a(key); exit=-"]],
			["a for-of loop", "for (const item of items) a(item);", ["loop: body=a(item); exit=-"]],
			["a for-await loop", "for await (const item of items) a(item);", ["loop: body=a(item); exit=-"]],
			["a while loop", "while (a) b();", ["loop: body=b(); exit=-"]],
			["a do-while loop", "do { a(); } while (b);", ["loop: body={ a(); } exit=-"]],
			["a try with a catch", "try { a(); } catch (e) { b(); }", ["catch: catch=catch (e) { b(); }"]],
			["a catch without a binding", "try { a(); } catch { b(); }", ["catch: catch=catch { b(); }"]],
			[
				"a try with a catch and a finally",
				"try { a(); } catch (e) { b(); } finally { c(); }",
				["catch: catch=catch (e) { b(); }"]
			],
			["an optional member", "a?.b;", ["optional-chain: continue=a?.b short-circuit=-"]],
			["an optional computed member", "a?.[key];", ["optional-chain: continue=a?.[key] short-circuit=-"]],
			["an optional call", "a?.();", ["optional-chain: continue=a?.() short-circuit=-"]],
			[
				"a chain with several optional links",
				"a?.b.c?.(d);",
				[
					"optional-chain: continue=a?.b.c?.(d) short-circuit=-",
					"optional-chain: continue=a?.b short-circuit=-"
				]
			],
			["a parameter default", "function f(x = 1) {}", ["default-value: default=1 provided=-"]],
			["an arrow parameter default", "const f = (x = 1) => x;", ["default-value: default=1 provided=-"]],
			[
				"destructuring defaults",
				"const { a = 1, b: [c = 2] } = o;",
				["default-value: default=1 provided=-", "default-value: default=2 provided=-"]
			],
			["a destructuring assignment default", "[a = 1] = list;", ["default-value: default=1 provided=-"]],
			["an or-assignment", "a ||= b;", ["logical-assignment: assign=b skip=-"]],
			["an and-assignment", "a &&= b;", ["logical-assignment: assign=b skip=-"]],
			["a nullish assignment", "a ??= b;", ["logical-assignment: assign=b skip=-"]]
		])("should describe %s", (_title, code, expected) => {
			expect.assertions(1);

			expect(summariesIn(code)).toStrictEqual(expected);
		});
	});

	describe("code without decisions", () => {
		it.each([
			["a plain assignment", "a = b;"],
			["a compound assignment", "a += b;"],
			["a try with only a finally", "try { a(); } finally { b(); }"],
			["a non-optional member chain", "a.b.c();"],
			["a binary expression", "a + b > c;"],
			["a labelled block", "label: { a(); break label; }"]
		])("should find nothing in %s", (_title, code) => {
			expect.assertions(1);

			expect(summariesIn(code)).toStrictEqual([]);
		});
	});

	describe("typescript syntax", () => {
		it.each([
			["a conditional type", "type T = A extends B ? C : D;", []],
			["a conditional type in an annotation", "let x: A extends B ? C : D;", []],
			["an interface", "interface I { m(a?: string): void; }", []],
			["an overload signature", "declare function f(a: string): void;", []],
			["an enum initializer", "enum E { A = a ? 1 : 2 }", ["conditional: true=1 false=2"]],
			["an ambient enum initializer", "declare enum E { A = a ? 1 : 2 }", []],
			["a const enum initializer", "const enum E { A = 1 << 2, B = A || 1 }", []],
			["a namespace body", "namespace N { export const x = a ?? b; }", ["nullish: right=b short-circuit=-"]],
			["a nested namespace body", "namespace N.M { if (a) { b(); } }", ["if: then={ b(); } else=-"]],
			["an ambient namespace", "declare namespace N { const x: A extends B ? C : D; }", []],
			["a namespace's types", "namespace N { type T = A extends B ? C : D; }", []],
			["an as expression", "x = (a ?? b) as T;", ["nullish: right=b short-circuit=-"]],
			["a satisfies expression", "x = (a || b) satisfies T;", ["logical-or: right=b short-circuit=-"]],
			["a type assertion", "x = <T>(a && b);", ["logical-and: right=b short-circuit=-"]],
			["a non-null assertion in a chain", "a?.b!.c;", ["optional-chain: continue=a?.b short-circuit=-"]],
			["an instantiation expression", "x = (a ? f : g)<T>;", ["conditional: true=f false=g"]],
			[
				"a parameter property default",
				"class C { constructor(private x = 1) {} }",
				["default-value: default=1 provided=-"]
			],
			["an export assignment", "export = a ?? b;", ["nullish: right=b short-circuit=-"]]
		])("should handle %s", (_title, code, expected) => {
			expect.assertions(1);

			expect(summariesIn(code)).toStrictEqual(expected);
		});
	});

	describe("decision nodes", () => {
		it.each([
			["if (a) b();", "IfStatement"],
			["x = a ? b : c;", "ConditionalExpression"],
			["a && b;", "LogicalExpression"],
			["switch (a) {}", "SwitchStatement"],
			["while (a) b();", "WhileStatement"],
			["do b(); while (a);", "DoWhileStatement"],
			["try {} catch {}", "TryStatement"],
			["a?.b;", "MemberExpression"],
			["a?.();", "CallExpression"],
			["function f(x = 1) {}", "AssignmentPattern"],
			["a ??= b;", "AssignmentExpression"]
		])("should report %s at a node of type %s", (code, type) => {
			expect.assertions(1);

			const parsed = decisionParse(code);
			const [decision] = decisionPointsIn([parsed.program], NO_BOUNDARIES);

			expect(decision?.node.type).toBe(type);
		});
	});

	describe("coverage kinds", () => {
		it.each([
			["if (a) b();", "if"],
			["x = a ? b : c;", "cond-expr"],
			["a && b;", "binary-expr"],
			["a || b;", "binary-expr"],
			["a ?? b;", "binary-expr"],
			["switch (a) {}", "switch"],
			["function f(x = 1) {}", "default-arg"],
			["while (a) b();", null],
			["try {} catch {}", null],
			["a?.b;", null],
			["a ||= b;", null]
		])("should give %s the coverage kind %s", (code, coverageKind) => {
			expect.assertions(1);

			const parsed = decisionParse(code);
			const [decision] = decisionPointsIn([parsed.program], NO_BOUNDARIES);

			expect(decision?.coverageKind).toBe(coverageKind);
		});
	});

	describe("outcome regions", () => {
		it("should cover the consequent statements of a case without its test", () => {
			expect.assertions(1);

			const parsed = decisionParse("switch (x) { case key: a(); b(); case other: }");
			const [decision] = decisionPointsIn([parsed.program], NO_BOUNDARIES);

			expect(decision?.outcomes.map((outcome) => outcome.region)).toStrictEqual([
				[parsed.find("a();").range[0], parsed.find("b();").range[1]],
				null,
				null
			]);
		});

		it("should cover the rest of the chain after an optional link", () => {
			expect.assertions(1);

			const parsed = decisionParse("x = a?.b.c(d);");
			const [decision] = decisionPointsIn([parsed.program], NO_BOUNDARIES);

			expect(decision?.outcomes[0]?.region).toStrictEqual([
				parsed.find("a").range[1],
				parsed.find("a?.b.c(d)", "ChainExpression").range[1]
			]);
		});

		it("should not give a do-while body a region", () => {
			expect.assertions(1);

			const parsed = decisionParse("do { a(); } while (b);");
			const [decision] = decisionPointsIn([parsed.program], NO_BOUNDARIES);

			expect(decision?.outcomes.map((outcome) => outcome.region)).toStrictEqual([null, null]);
		});

		it("should cover the node of an if branch", () => {
			expect.assertions(1);

			const parsed = decisionParse("if (a) { b(); }");
			const [decision] = decisionPointsIn([parsed.program], NO_BOUNDARIES);

			expect(decision?.outcomes[0]?.region).toStrictEqual(parsed.find("{ b(); }").range);
		});
	});

	describe("nesting and order", () => {
		it("should list nested decisions in source order, enclosing decisions first", () => {
			expect.assertions(1);

			expect(summariesIn("if (a) { while (b && c) { x = d ? e : f; } } else { g ?? h; }")).toStrictEqual([
				"if: then={ while (b && c) { x = d ? e : f; } } else={ g ?? h; }",
				"loop: body={ x = d ? e : f; } exit=-",
				"logical-and: right=c short-circuit=-",
				"conditional: true=e false=f",
				"nullish: right=h short-circuit=-"
			]);
		});

		it("should find decisions in the test of another decision", () => {
			expect.assertions(1);

			expect(summariesIn("if (a?.b) c();")).toStrictEqual([
				"if: then=c(); else=-",
				"optional-chain: continue=a?.b short-circuit=-"
			]);
		});

		it("should sort decisions from roots given out of order", () => {
			expect.assertions(1);

			const parsed = decisionParse("a && b;\nc || d;");
			const [first, second] = parsed.program.body;
			const decisions = decisionPointsIn(
				[second, first].filter((node) => node !== undefined),
				NO_BOUNDARIES
			);

			expect(decisions.map((decision) => decision.kind)).toStrictEqual(["logical-and", "logical-or"]);
		});

		it("should report a decision once for overlapping roots", () => {
			expect.assertions(1);

			const parsed = decisionParse("if (a) b();");

			expect(decisionPointsIn([parsed.program, parsed.find("if (a) b();")], NO_BOUNDARIES)).toHaveLength(1);
		});
	});

	describe("boundaries", () => {
		it("should skip a nested arrow listed as a boundary", () => {
			expect.assertions(1);

			const parsed = decisionParse("if (a) { list.map((x) => x ?? 0); }");
			const decisions = decisionPointsIn([parsed.program], new Set(parsed.all("ArrowFunctionExpression")));

			expect(decisions.map((decision) => decision.kind)).toStrictEqual(["if"]);
		});

		it("should walk a nested arrow that is not a boundary", () => {
			expect.assertions(1);

			expect(
				summariesIn("if (a) { list.map((x) => x ?? 0); }").map((summary) => summary.split(":")[0])
			).toStrictEqual(["if", "nullish"]);
		});

		it("should skip a class listed as a boundary", () => {
			expect.assertions(1);

			const parsed = decisionParse("const C = class { x = a ? 1 : 2; m(y = 1) {} }; b && c;");
			const decisions = decisionPointsIn([parsed.program], new Set(parsed.all("ClassExpression")));

			expect(decisions.map((decision) => decision.kind)).toStrictEqual(["logical-and"]);
		});

		it("should skip a nested function declaration and its parameter defaults", () => {
			expect.assertions(1);

			const parsed = decisionParse("function outer(a = 1) { function inner(b = 2) { c ?? d; } }");
			const functions = parsed.all("FunctionDeclaration");
			const decisions = decisionPointsIn(functions.slice(0, 1), new Set(functions));

			expect(decisions.map((decision) => parsed.summary(decision))).toStrictEqual([
				"default-value: default=1 provided=-"
			]);
		});

		it("should skip any node listed as a boundary", () => {
			expect.assertions(1);

			const parsed = decisionParse("if (a) { b && c; } else { d ?? e; }");
			const decisions = decisionPointsIn([parsed.program], new Set([parsed.find("{ b && c; }")]));

			expect(decisions.map((decision) => decision.kind)).toStrictEqual(["if", "nullish"]);
		});

		it("should walk a root that is also a boundary", () => {
			expect.assertions(1);

			const parsed = decisionParse("const f = (x = 1) => { if (x) { return () => y ?? z; } };");
			const arrows = parsed.all("ArrowFunctionExpression");
			const decisions = decisionPointsIn(arrows.slice(0, 1), new Set(arrows));

			expect(decisions.map((decision) => decision.kind)).toStrictEqual(["default-value", "if"]);
		});

		it("should find nothing in a root that is a type", () => {
			expect.assertions(1);

			const parsed = decisionParse("type T = A extends B ? C : D;");

			expect(decisionPointsIn(parsed.all("TSConditionalType"), NO_BOUNDARIES)).toStrictEqual([]);
		});
	});

	describe("a realistic NestJS service method", () => {
		it("should list the decisions of the method body and parameters, without the nested arrow", () => {
			expect.assertions(1);

			const parsed = decisionParse(SERVICE);
			const method = parsed
				.all("MethodDefinition")
				.find((node) => parsed.text(node).startsWith("async findOrders"));
			const code = method?.type === "MethodDefinition" ? [method.value] : [];
			const ifBody = parsed.all("BlockStatement").findLast((node) => parsed.text(node).includes("not ready"));
			const [handler] = parsed.all("CatchClause");
			const loopBody = parsed
				.all("BlockStatement")
				.findLast((node) => parsed.text(node).includes("switch (order.kind)"));
			const [express, standard, fallback] = parsed.all("SwitchCase");
			const textOf = (node: ESTree.Node | undefined): string => (node === undefined ? "?" : parsed.text(node));
			const boundaries = new Set([
				...parsed.all("ClassDeclaration"),
				...parsed.all("FunctionExpression"),
				...parsed.all("ArrowFunctionExpression")
			]);

			expect(decisionPointsIn(code, boundaries).map((decision) => parsed.summary(decision))).toStrictEqual([
				"default-value: default={} provided=-",
				"default-value: default=20 provided=-",
				'nullish: right="open" short-circuit=-',
				`if: then=${textOf(ifBody)} else=-`,
				"optional-chain: continue=this.logger?.warn short-circuit=-",
				`catch: catch=${textOf(handler)}`,
				`loop: body=${textOf(loopBody)} exit=-`,
				`switch: case 0=${textOf(express)} case 1=${textOf(standard)} default=${textOf(fallback)}`,
				"logical-assignment: assign=1 skip=-",
				"conditional: true=2 false=3",
				"optional-chain: continue=this.logger?.error short-circuit=-",
				"conditional: true=error.message false=String(error)"
			]);
		});

		it("should list the decisions of the module code, without the class", () => {
			expect.assertions(1);

			const parsed = decisionParse(SERVICE);

			expect(decisionPointsIn([parsed.program], new Set(parsed.all("ClassDeclaration")))).toStrictEqual([]);
		});
	});
});
