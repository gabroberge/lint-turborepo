import type { ESTree, SourceCode } from "@oxlint/plugins";
import { SourceCode as ESLintSourceCode } from "eslint";
import tseslint from "typescript-eslint";

import type { ClassMember } from "../member/class-member";
import { collectMembers } from "../member/collect-members";
import { firstClassBody } from "./first-class-body";
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

export interface ParsedClass {
	body: ESTree.ClassBody;
	members: ClassMember[];
	sourceCode: SourceCode;
}

/**
 * Parses `code` with typescript-eslint, scope analysis and parent links, and
 * returns the first top-level class (declared or exported) with its members.
 */
export function parseClass(code: string): ParsedClass {
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

	const body = firstClassBody(ast);
	const sourceCode = new ESLintSourceCode({
		ast: ast as never,
		parserServices: services as never,
		scopeManager: scopeManager as never,
		text: code,
		visitorKeys: visitorKeys as never
	}) as unknown as SourceCode;

	return { body, members: collectMembers(sourceCode, body), sourceCode };
}
