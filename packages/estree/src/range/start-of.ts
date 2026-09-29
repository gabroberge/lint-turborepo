import type { Ranged } from "./ranged";

export function startOf(node: Ranged): number {
	return node.range[0];
}
