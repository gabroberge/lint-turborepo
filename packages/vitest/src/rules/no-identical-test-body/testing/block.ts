import type { ESTree } from "@oxlint/plugins";

export function block(): ESTree.BlockStatement {
	return { body: [], type: "BlockStatement" } as unknown as ESTree.BlockStatement;
}
