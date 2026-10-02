import type { Ranged } from "@gabroberge/oxlint-estree";

/** True when `inner` lies within one of `roots`. */
export function isInside(inner: Ranged, roots: readonly Ranged[]): boolean {
	const [start, end] = inner.range;
	return roots.some(({ range }) => start >= range[0] && end <= range[1]);
}
