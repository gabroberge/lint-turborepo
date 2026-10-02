import type { FunctionNode } from "@gabroberge/oxlint-estree";
import { isFunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { Effects } from "../effects/effects";
import { emptyEffects } from "../effects/empty-effects";
import type { AnalysisScope } from "./analysis-scope";
import type { NodeHandler } from "./node-handler";
import { NODE_HANDLERS } from "./node-handlers";
import { visitChildren } from "./visit-children";
import { visitFunction } from "./visit-function";
import type { Walker } from "./walker";

export interface CollectedEffects {
	/** Function literals that are stored, not called, while the analyzed code runs. */
	deferred: FunctionNode[];
	effects: Effects;
}

/**
 * Collect what evaluating `root` may do. With `valueFlow`, a function
 * literal whose value is only stored (the initializer itself, an object or
 * array element, an argument of a call assumed to be a factory) is
 * deferred rather than analyzed. Everything else, including functions
 * passed to unknown calls, is treated as running immediately.
 */
export function collectEffects(root: ESTree.Node, scope: AnalysisScope, valueFlow: boolean): CollectedEffects {
	const walker: Walker = {
		deferred: [],
		effects: emptyEffects(),
		scope,
		visit(node, flow) {
			if (isFunctionNode(node)) {
				if (flow) {
					walker.deferred.push(node);
				} else {
					visitFunction(walker, node);
				}

				return;
			}

			const handler = NODE_HANDLERS[node.type] as NodeHandler<typeof node.type> | undefined;
			if (handler !== undefined) {
				handler(walker, node, flow);
			} else if (!node.type.startsWith("TS")) {
				visitChildren(walker, node);
			}
		}
	};

	walker.visit(root, valueFlow);
	return { deferred: walker.deferred, effects: walker.effects };
}
