import type { ESTree } from "@oxlint/plugins";
import tseslint from "typescript-eslint";

/** The shape of a decision point, restated here so that the helper imports no package code. */
export interface DecisionShape {
	kind: string;
	node: ESTree.Node;
	outcomes: readonly OutcomeShape[];
}

export interface OutcomeShape {
	label: string;
	node: ESTree.Node | null;
}

export interface ParsedSnippet {
	/** Every node of `type`, outer nodes first, in source order. */
	all: (type: string) => ESTree.Node[];
	/** The outermost node whose source text is `source`, optionally of `type`. */
	find: (source: string, type?: string) => ESTree.Node;
	program: ESTree.Program;
	/** `kind: label=text label=-`, with `-` for an outcome without a node. */
	summary: (decision: DecisionShape) => string;
	text: (node: ESTree.Node) => string;
}

interface ParseResult {
	ast: ESTree.Program;
}

const parser = tseslint.parser as unknown as {
	parseForESLint: (text: string, options: Record<string, unknown>) => ParseResult;
};

const skippedKeys: ReadonlySet<string> = new Set(["comments", "end", "loc", "parent", "range", "start", "tokens"]);

/** Parses a TypeScript module with typescript-eslint and offers lookups by source text and node type. */
export function decisionParse(code: string): ParsedSnippet {
	const { ast } = parser.parseForESLint(code, {
		comment: true,
		ecmaVersion: "latest",
		loc: true,
		range: true,
		sourceType: "module",
		tokens: true
	});
	const nodes: ESTree.Node[] = [];
	collect(ast, nodes);

	function text(node: ESTree.Node): string {
		return code.slice(node.range[0], node.range[1]);
	}

	return {
		all: (type) => nodes.filter((node) => node.type === type),
		find(source, type) {
			const found = nodes.find((node) => text(node) === source && (type === undefined || node.type === type));
			if (found === undefined) {
				throw new Error(`No node with source ${source}`);
			}

			return found;
		},
		program: ast,
		summary: (decision) =>
			`${decision.kind}: ${decision.outcomes
				.map((outcome) => `${outcome.label}=${outcome.node === null ? "-" : text(outcome.node)}`)
				.join(" ")}`,
		text
	};
}

function collect(node: ESTree.Node, nodes: ESTree.Node[]): void {
	nodes.push(node);
	const children: ESTree.Node[] = [];
	for (const [key, value] of Object.entries(node)) {
		if (skippedKeys.has(key)) {
			continue;
		}

		const items: unknown[] = Array.isArray(value) ? value : [value];
		children.push(...items.filter(isNode));
	}

	children.sort((first, second) => first.range[0] - second.range[0]);
	for (const child of children) {
		collect(child, nodes);
	}
}

function isNode(value: unknown): value is ESTree.Node {
	return typeof value === "object" && value !== null && "type" in value && typeof value.type === "string";
}
