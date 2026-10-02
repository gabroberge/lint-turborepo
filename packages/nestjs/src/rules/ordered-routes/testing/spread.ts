import type { ESTree } from "@oxlint/plugins";

export function spread(argument: ESTree.Expression): ESTree.SpreadElement {
	return { argument, type: "SpreadElement" } as unknown as ESTree.SpreadElement;
}
