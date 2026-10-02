import type { ESTree } from "@oxlint/plugins";

import type { Binding } from "../binding/binding-from-exported-name";
import type { ControllerEntry } from "../handler/handler";

export interface ClassFrame extends ControllerFrame {
	isController: boolean;
}

export interface ControllerFrame {
	entries: ControllerEntry[];
	node: ESTree.Class;
}

export interface WalkState {
	bindings: Map<string, Binding>;
	classStack: ClassFrame[];
}

export function createWalkState(): WalkState {
	return {
		bindings: new Map(),
		classStack: []
	};
}
