import type { Walker } from "./walker";

/** Code that may touch any member and change anything: `this` escaping, `super`, a nested class. */
export function markOpaque(walker: Walker): void {
	walker.effects.opaque = true;
	walker.effects.sideEffects = true;
}
