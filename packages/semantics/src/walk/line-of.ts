import type { Ranged } from "@gabroberge/oxlint-estree";

/** The 1-based line a node starts on. */
export function lineOf(text: string, node: Ranged): number {
	let line = 1;
	for (let index = text.indexOf("\n"); index !== -1 && index < node.range[0]; index = text.indexOf("\n", index + 1)) {
		line += 1;
	}

	return line;
}
