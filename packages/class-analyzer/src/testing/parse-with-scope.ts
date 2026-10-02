import type { ESTree, SourceCode } from "@oxlint/plugins";
import { SourceCode as ESLintSourceCode } from "eslint";
import tseslint from "typescript-eslint";

import type { AnalyzedMember } from "../index";
import { analyzeMembers } from "../index";
import { linkParents } from "./link-parents";
import { memberLabel } from "./member-label";

interface ParseResult {
	ast: ESTree.Program;
	scopeManager: unknown;
	services: unknown;
	visitorKeys: Record<string, readonly string[] | undefined>;
}

const parser = tseslint.parser as unknown as {
	parseForESLint: (text: string, options: Record<string, unknown>) => ParseResult;
};

export interface ScopedClass {
	body: ESTree.ClassBody;
	/** A readable name per member, indexed like `members`: its key, `static block`, `index signature`, or `[source]` for a computed key. */
	labels: string[];
	members: AnalyzedMember[];
	sourceCode: SourceCode;
}

/**
 * Parses `code` with typescript-eslint, scope analysis and parent links, and
 * returns the first top-level class (declared or exported) with its
 * analyzed members.
 */
export function parseWithScope(code: string): ScopedClass {
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

	const members = analyzeMembers(body);
	return { body, labels: members.map((member) => memberLabel(sourceCode, member)), members, sourceCode };
}

function firstClassBody(ast: ESTree.Program): ESTree.ClassBody {
	for (const statement of ast.body) {
		const declaration =
			statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration"
				? statement.declaration
				: statement;
		if (declaration?.type === "ClassDeclaration") {
			return declaration.body;
		}
	}

	throw new Error("Expected a class declaration");
}
