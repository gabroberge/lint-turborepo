import type { ESTree } from "@oxlint/plugins";

export function block(...statements: ESTree.Statement[]): ESTree.BlockStatement {
	return { body: statements, type: "BlockStatement" } as ESTree.BlockStatement;
}
