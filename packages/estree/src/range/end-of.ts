import type { Ranged } from "./ranged";

export function endOf(node: Ranged): number {
	return node.range[1];
}
