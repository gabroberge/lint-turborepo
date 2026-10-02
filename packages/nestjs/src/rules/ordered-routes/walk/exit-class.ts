import type { ControllerFrame, WalkState } from "./walk-state";

export function exitClass(state: WalkState, onController: (frame: ControllerFrame) => void): void {
	const frame = state.classStack.pop();
	if (frame?.isController !== true) {
		return;
	}

	onController(frame);
}
