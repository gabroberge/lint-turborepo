import type { ESTree, SourceCode } from "@oxlint/plugins";
import { SourceCode as ESLintSourceCode } from "eslint";
import tseslint from "typescript-eslint";

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
 * Parses `code` as a TypeScript module with typescript-eslint, scope
 * analysis and parent links, the way ESLint or oxlint hands it to a rule.
 */
export function parseModule(code: string): SourceCode {
	const { ast, scopeManager, services, visitorKeys } = parser.parseForESLint(code, {
		comment: true,
		ecmaVersion: "latest",
		filePath: "index.ts",
		loc: true,
		range: true,
		sourceType: "module",
		tokens: true
	});
	linkParents(ast, null, visitorKeys);
	return new ESLintSourceCode({
		ast: ast as never,
		parserServices: services as never,
		scopeManager: scopeManager as never,
		text: code,
		visitorKeys: visitorKeys as never
	}) as unknown as SourceCode;
}
