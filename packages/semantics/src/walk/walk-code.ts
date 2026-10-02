import { isFunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { ModelDraft } from "../build/model-draft";
import type { DeclarationId } from "../model/ids";
import type { Unit } from "../model/unit";
import { dispositionOf } from "./disposition-of";
import type { Flow } from "./flow";
import type { NodeHandler } from "./node-handler";
import { NODE_HANDLERS } from "./node-handlers";
import { visitChildren } from "./visit-children";
import { visitFunctionLiteral } from "./visit-function-literal";
import type { Walker } from "./walker";

/** A walker that records the facts of `unit`'s own code. */
export function createWalker(draft: ModelDraft, unit: Unit, storeOwner: DeclarationId | null): Walker {
	const walker: Walker = {
		draft,
		emit(fact) {
			unit.facts.push(fact);
		},
		storeOwner,
		unit,
		visit(node, flow: Flow) {
			if (isFunctionNode(node)) {
				visitFunctionLiteral(
					walker,
					node,
					node.type === "FunctionDeclaration" ? "bound-locally" : dispositionOf(flow)
				);
				return;
			}

			const handler = NODE_HANDLERS[node.type] as NodeHandler<typeof node.type> | undefined;
			if (handler !== undefined) {
				handler(walker, node, flow);
			} else if (!node.type.startsWith("TS")) {
				visitChildren(walker, node);
			}
		},
		withStoreOwner(owner) {
			return createWalker(draft, unit, owner);
		}
	};

	return walker;
}

/** Record the facts of evaluating `node` as part of `unit`'s code. */
export function walkCode(
	draft: ModelDraft,
	unit: Unit,
	node: ESTree.Node,
	flow: Flow,
	storeOwner: DeclarationId | null = null
): void {
	createWalker(draft, unit, storeOwner).visit(node, flow);
}
