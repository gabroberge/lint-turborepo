import type { ESTree } from "@oxlint/plugins";

import { instantiationKind } from "./instantiation-kind";

export function isInstantiation(call: ESTree.CallExpression): boolean {
	return instantiationKind(call) !== null;
}
