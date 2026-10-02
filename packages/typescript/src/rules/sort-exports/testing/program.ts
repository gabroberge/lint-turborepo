import type { ESTree } from "@oxlint/plugins";
import tseslint from "typescript-eslint";

const parser = tseslint.parser as {
	parseForESLint: (text: string, options: Record<string, unknown>) => { ast: ESTree.Program };
};

export function program(code: string): ESTree.Program {
	return parser.parseForESLint(code, {
		comment: true,
		ecmaVersion: "latest",
		filePath: "index.ts",
		loc: true,
		range: true,
		sourceType: "module",
		tokens: true
	}).ast;
}
