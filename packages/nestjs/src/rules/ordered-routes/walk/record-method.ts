import type { ESTree, SourceCode } from "@oxlint/plugins";

import { handlerFromMethod } from "../handler/handler-from-method";
import type { WalkState } from "./walk-state";

export function recordMethod(state: WalkState, node: ESTree.MethodDefinition, source: SourceCode): void {
	const frame = state.classStack.at(-1);
	if (frame?.isController !== true) {
		return;
	}

	const entry = handlerFromMethod(node, state.bindings, source);
	if (entry === null) {
		return;
	}

	frame.entries.push(entry);
}
