import type { ESTree } from "@oxlint/plugins";

export function block(...statements: object[]): ESTree.BlockStatement {
	return { body: statements, type: "BlockStatement" } as unknown as ESTree.BlockStatement;
}
