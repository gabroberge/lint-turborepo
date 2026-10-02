import type { ESTree } from "@oxlint/plugins";

import { hasControllerDecorator } from "../decorator/has-controller-decorator";
import type { WalkState } from "./walk-state";

export function enterClass(state: WalkState, node: ESTree.Class): void {
	state.classStack.push({
		entries: [],
		isController: hasControllerDecorator(node, state.bindings),
		node
	});
}
