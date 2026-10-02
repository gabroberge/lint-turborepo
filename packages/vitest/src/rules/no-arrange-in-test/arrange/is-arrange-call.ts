import type { ESTree } from "@oxlint/plugins";

import { isFnFactoryCall } from "../call/is-fn-factory-call";
import { isMockConfigCall } from "../call/is-mock-config-call";

export function isArrangeCall(node: ESTree.CallExpression): boolean {
	return isMockConfigCall(node) || isFnFactoryCall(node);
}
