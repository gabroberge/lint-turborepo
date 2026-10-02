import { endOf, startOf } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { coverageKindOf } from "./coverage-kind-of";
import type { DecisionKind } from "./decision-kind";
import type { DecisionOutcome, DecisionPoint } from "./decision-point";

type Handler<Node> = (node: Node, chain: ESTree.ChainExpression | null) => DecisionPoint | null;

type Handlers = { [Type in ESTree.Node["type"]]?: Handler<Extract<ESTree.Node, Typed<Type>>> };

type LoopNode = ESTree.ForInStatement | ESTree.ForOfStatement | ESTree.ForStatement | ESTree.WhileStatement;

interface Typed<Type> {
	type: Type;
}

const logicalKinds: Record<ESTree.LogicalOperator, DecisionKind> = {
	"??": "nullish",
	"&&": "logical-and",
	"||": "logical-or"
};

const logicalAssignments: ReadonlySet<string> = new Set(["&&=", "??=", "||="]);

const handlers: Handlers = {
	AssignmentExpression: (node) =>
		logicalAssignments.has(node.operator)
			? decision("logical-assignment", node, [taken("assign", node.right), skipped("skip")])
			: null,
	AssignmentPattern: (node) => decision("default-value", node, [taken("default", node.right), skipped("provided")]),
	CallExpression: (node, chain) => (node.optional ? optionalLink(node, node.callee, chain) : null),
	ConditionalExpression: (node) =>
		decision("conditional", node, [taken("true", node.consequent), taken("false", node.alternate)]),
	DoWhileStatement: (node) =>
		decision("loop", node, [{ label: "body", node: node.body, region: null }, skipped("exit")]),
	ForInStatement: loop,
	ForOfStatement: loop,
	ForStatement: loop,
	IfStatement: (node) =>
		decision("if", node, [
			taken("then", node.consequent),
			node.alternate === null ? skipped("else") : taken("else", node.alternate)
		]),
	LogicalExpression: (node) =>
		decision(logicalKinds[node.operator], node, [taken("right", node.right), skipped("short-circuit")]),
	MemberExpression: (node, chain) => (node.optional ? optionalLink(node, node.object, chain) : null),
	SwitchStatement: (node) => {
		const outcomes = node.cases.map(caseOutcome);
		return decision(
			"switch",
			node,
			node.cases.some((switchCase) => switchCase.test === null) ? outcomes : [...outcomes, skipped("no-match")]
		);
	},
	TryStatement: (node) => (node.handler === null ? null : decision("catch", node, [taken("catch", node.handler)])),
	WhileStatement: loop
};

/**
 * The decision `node` itself makes, or `null` when it makes none. `chain` is
 * the nearest `ChainExpression` around `node`, which bounds the region of an
 * optional link.
 */
export function decisionAt(node: ESTree.Node, chain: ESTree.ChainExpression | null): DecisionPoint | null {
	const handler = handlers[node.type] as Handler<ESTree.Node> | undefined;
	return handler === undefined ? null : handler(node, chain);
}

function caseOutcome(switchCase: ESTree.SwitchCase, index: number): DecisionOutcome {
	const first = switchCase.consequent.at(0);
	const last = switchCase.consequent.at(-1);
	return {
		label: switchCase.test === null ? "default" : `case ${index}`,
		node: switchCase,
		region: first === undefined || last === undefined ? null : [startOf(first), endOf(last)]
	};
}

function decision(kind: DecisionKind, node: ESTree.Node, outcomes: DecisionOutcome[]): DecisionPoint {
	return { coverageKind: coverageKindOf(kind), kind, node, outcomes };
}

function loop(node: LoopNode): DecisionPoint {
	return decision("loop", node, [taken("body", node.body), skipped("exit")]);
}

function optionalLink(
	node: ESTree.CallExpression | ESTree.MemberExpression,
	target: ESTree.Node,
	chain: ESTree.ChainExpression | null
): DecisionPoint {
	return decision("optional-chain", node, [
		{ label: "continue", node, region: [endOf(target), endOf(chain ?? node)] },
		skipped("short-circuit")
	]);
}

function skipped(label: string): DecisionOutcome {
	return { label, node: null, region: null };
}

function taken(label: string, node: ESTree.Node): DecisionOutcome {
	return { label, node, region: [startOf(node), endOf(node)] };
}
