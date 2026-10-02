import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { Effects } from "../effects/effects";
import type { AnalysisScope } from "./analysis-scope";

/**
 * The state of one effect analysis. `visit` evaluates a node; with `flow`, a
 * function literal is a stored value and is deferred rather than run.
 */
export interface Walker {
	deferred: FunctionNode[];
	effects: Effects;
	scope: AnalysisScope;
	visit: (node: ESTree.Node, flow: boolean) => void;
}
