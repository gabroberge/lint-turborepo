import type { FunctionNode } from "@gabroberge/oxlint-estree";

import type { ModelDraft } from "../build/model-draft";
import type { Unit } from "../model/unit";
import { visitBinding } from "./visit-binding";
import { createWalker } from "./walk-code";

/** Record the facts of a function unit's own code: its parameter defaults, then its body. */
export function walkFunctionUnit(draft: ModelDraft, unit: Unit, node: FunctionNode): void {
	const walker = createWalker(draft, unit, null);
	for (const parameter of node.params) {
		visitBinding(walker, parameter);
	}

	if (node.body !== null) {
		walker.visit(node.body, "run");
	}
}
