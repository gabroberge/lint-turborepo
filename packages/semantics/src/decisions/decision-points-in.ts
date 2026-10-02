import { endOf, isNode, startOf } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { decisionAt } from "./decision-at";
import type { DecisionPoint } from "./decision-point";

/**
 * TypeScript nodes that contain runtime code. Every other `TS*` node is
 * type-only and skipped, and so are ambient (`declare`) namespaces and
 * enums and `const` enums, which are erased.
 */
const runtimeTypeScriptNodes: ReadonlySet<string> = new Set([
	"TSAsExpression",
	"TSEnumBody",
	"TSEnumDeclaration",
	"TSEnumMember",
	"TSExportAssignment",
	"TSInstantiationExpression",
	"TSModuleBlock",
	"TSModuleDeclaration",
	"TSNonNullExpression",
	"TSParameterProperty",
	"TSSatisfiesExpression",
	"TSTypeAssertion"
]);

/** Keys that hold metadata, tokens or comments rather than child nodes. */
const skippedKeys: ReadonlySet<string> = new Set(["comments", "end", "loc", "parent", "range", "start", "tokens"]);

/**
 * Every decision point written in `code`, ordered by start offset, an
 * enclosing decision before the decisions that start where it starts.
 *
 * The walk starts at each root of `code`, even a root that is itself in
 * `boundaries` (a function unit's root is its own function node), and does
 * not descend into any other node of `boundaries`: nested function literals,
 * classes, or other units' code are reported by their own units only when the
 * caller lists them in `boundaries`. Type-only TypeScript syntax is skipped,
 * as are ambient namespaces and enums and `const` enums; type assertions,
 * non-null assertions, `satisfies`, instantiation expressions, parameter
 * properties, `export =`, the bodies of other namespaces and the member
 * initializers of other enums are walked. Each optional link of a chain is a decision of its own.
 *
 * The result describes syntax only: a decision may be unreachable, and the
 * code around it may never run.
 */
export function decisionPointsIn(code: readonly ESTree.Node[], boundaries: ReadonlySet<ESTree.Node>): DecisionPoint[] {
	const found: DecisionPoint[] = [];
	const seen = new Set<ESTree.Node>();

	function visit(node: ESTree.Node, chain: ESTree.ChainExpression | null): void {
		if (seen.has(node) || isTypeOnly(node)) {
			return;
		}

		seen.add(node);
		const enclosingChain = node.type === "ChainExpression" ? node : chain;
		const decision = decisionAt(node, enclosingChain);
		if (decision !== null) {
			found.push(decision);
		}

		for (const child of childrenOf(node)) {
			if (!boundaries.has(child)) {
				visit(child, enclosingChain);
			}
		}
	}

	for (const root of code) {
		visit(root, null);
	}

	return found.sort(
		(first, second) => startOf(first.node) - startOf(second.node) || endOf(second.node) - endOf(first.node)
	);
}

function childrenOf(node: ESTree.Node): ESTree.Node[] {
	const children: ESTree.Node[] = [];
	for (const [key, value] of Object.entries(node)) {
		if (skippedKeys.has(key)) {
			continue;
		}

		const items: unknown[] = Array.isArray(value) ? value : [value];
		children.push(...items.filter(isNode));
	}

	return children;
}

function isTypeOnly(node: ESTree.Node): boolean {
	if (node.type === "TSModuleDeclaration") {
		return node.declare;
	}

	if (node.type === "TSEnumDeclaration") {
		return node.declare || node.const;
	}

	return node.type.startsWith("TS") && !runtimeTypeScriptNodes.has(node.type);
}
