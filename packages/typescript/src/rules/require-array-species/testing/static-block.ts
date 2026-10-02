import type { ESTree } from "@oxlint/plugins";

export function staticBlock(): ESTree.StaticBlock {
	return { body: [], type: "StaticBlock" } as unknown as ESTree.StaticBlock;
}
