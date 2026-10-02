import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";

export function spread(name: string): ESTree.SpreadElement {
	return { argument: identifier(name), type: "SpreadElement" } as unknown as ESTree.SpreadElement;
}
