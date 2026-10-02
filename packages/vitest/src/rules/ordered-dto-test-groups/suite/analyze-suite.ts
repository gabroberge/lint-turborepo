import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { Context, ESTree, SourceCode } from "@oxlint/plugins";

import type { ClassifiedChild, UnclassifiedChild } from "../child/classify-child";
import { classifyChild } from "../child/classify-child";
import { compareChildren } from "../order/compare-children";
import { rewriteSuiteBody } from "../rewrite/rewrite-suite-body";

export type SuiteReport = Parameters<Context["report"]>[0];

/**
 * Classify the suite's direct children, compare them to setup / when /
 * property-alpha order, and build a rewrite only when every child is
 * classified and the body can be rebuilt. Returns the reports to emit;
 * an empty list means the suite is already ordered.
 */
export function analyzeSuite(
	sourceCode: SourceCode,
	call: ESTree.CallExpression,
	callback: FunctionNode
): SuiteReport[] {
	const block = callback.body;
	if (block?.type !== "BlockStatement" || block.body.length === 0) {
		return [];
	}

	const classified: ClassifiedChild[] = [];
	const unclassified: UnclassifiedChild[] = [];
	for (const statement of block.body) {
		const child = classifyChild(statement);
		if (child.kind === "unclassified") {
			unclassified.push(child);
		} else {
			classified.push(child);
		}
	}

	const sorted = classified.toSorted(compareChildren);
	const ordered = classified.every((child, index) => child === sorted[index]);
	if (unclassified.length === 0 && ordered) {
		return [];
	}

	let replacement: string | null = null;
	if (unclassified.length === 0) {
		replacement = rewriteSuiteBody(
			sourceCode.text,
			sourceCode,
			block,
			sorted.map((child) => child.statement)
		);
	}

	const reports: SuiteReport[] = [];
	if (!ordered) {
		reports.push({
			fix(fixer) {
				if (replacement === null) {
					return null;
				}
				return fixer.replaceTextRange([block.range[0] + 1, block.range[1] - 1], replacement);
			},
			messageId: "unordered",
			node: call
		});
	}

	for (const child of unclassified) {
		reports.push({
			messageId: "unclassified",
			node: child.node
		});
	}

	return reports;
}
