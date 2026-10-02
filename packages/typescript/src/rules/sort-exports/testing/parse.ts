import type { ESTree, SourceCode } from "@oxlint/plugins";
import { SourceCode as ESLintSourceCode } from "eslint";

import { program } from "./program";

export interface Parsed {
	body: ESTree.Statement[];
	sourceCode: SourceCode;
}

export function parse(code: string): Parsed {
	const ast = program(code);

	return {
		body: ast.body,
		sourceCode: new ESLintSourceCode({ ast: ast as never, text: code }) as unknown as SourceCode
	};
}
