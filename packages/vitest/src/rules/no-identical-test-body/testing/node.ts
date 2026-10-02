import type { ESTree } from "@oxlint/plugins";

export function node(entries: [string, unknown][]): ESTree.Node {
	const result: Record<string, unknown> = {};

	for (const [key, value] of entries) {
		result[key] = value;
	}

	return result as unknown as ESTree.Node;
}
