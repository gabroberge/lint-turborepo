import type { WalkState } from "./walk-state";

export function resetWalk(state: WalkState): void {
	state.bindings.clear();
	state.classStack.length = 0;
}
