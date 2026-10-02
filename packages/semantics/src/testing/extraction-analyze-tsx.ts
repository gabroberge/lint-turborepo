import type { ESTree, SourceCode } from "@oxlint/plugins";
import { SourceCode as ESLintSourceCode } from "eslint";
import tseslint from "typescript-eslint";

import { analyzeModule } from "../index";
import { describeFact } from "./describe-fact";
import { linkParents } from "./link-parents";

interface ParseResult {
	ast: ESTree.Program;
	scopeManager: unknown;
	services: unknown;
	visitorKeys: Record<string, readonly string[] | undefined>;
}

const parser = tseslint.parser as unknown as {
	parseForESLint: (text: string, options: Record<string, unknown>) => ParseResult;
};

/**
 * Parses `code` as a TSX module (so JSX is allowed), builds its model, and
 * describes the facts of the only unit labelled `label`.
 */
export function analyzeTsxFacts(code: string, label: string): string[] {
	const { ast, scopeManager, services, visitorKeys } = parser.parseForESLint(code, {
		comment: true,
		ecmaVersion: "latest",
		filePath: "index.tsx",
		loc: true,
		range: true,
		sourceType: "module",
		tokens: true
	});
	linkParents(ast, null, visitorKeys);
	const sourceCode = new ESLintSourceCode({
		ast: ast as never,
		parserServices: services as never,
		scopeManager: scopeManager as never,
		text: code,
		visitorKeys: visitorKeys as never
	}) as unknown as SourceCode;
	const model = analyzeModule(sourceCode);
	const units = [...model.units.values()].filter((unit) => unit.label === label);
	const [only] = units;
	if (only === undefined || units.length > 1) {
		throw new Error(`Expected one unit labelled ${label}, found ${String(units.length)}`);
	}

	return only.facts.map((fact) => describeFact(model, sourceCode.getText(fact.node), fact));
}
