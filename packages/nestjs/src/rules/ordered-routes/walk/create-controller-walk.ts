import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { collectImport } from "../binding/collect-import";
import { enterClass } from "./enter-class";
import { exitClass } from "./exit-class";
import { recordMethod } from "./record-method";
import { resetWalk } from "./reset-walk";
import type { ControllerFrame } from "./walk-state";
import { createWalkState } from "./walk-state";

/**
 * File walk that finishes Nest controller frames. Owns import bindings
 * and class nesting. Reads `sourceCode` only while visiting, so it is
 * safe from `createOnce`. Each controller is delivered through
 * `onController` when its class exits.
 */
export function createControllerWalk(
	context: Context,
	onController: (frame: ControllerFrame) => void
): VisitorWithHooks {
	const state = createWalkState();

	return {
		before() {
			resetWalk(state);
		},
		ClassDeclaration(node) {
			enterClass(state, node);
		},
		"ClassDeclaration:exit"() {
			exitClass(state, onController);
		},
		ClassExpression(node) {
			enterClass(state, node);
		},
		"ClassExpression:exit"() {
			exitClass(state, onController);
		},
		ImportDeclaration(node) {
			collectImport(node, state.bindings);
		},
		MethodDefinition(node) {
			recordMethod(state, node, context.sourceCode);
		},
		Program() {
			resetWalk(state);
		},
		TSAbstractMethodDefinition(node) {
			recordMethod(state, node, context.sourceCode);
		}
	};
}
