import { identifierName, unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

const MOCK_CONFIG_METHODS = new Set([
	"mockResolvedValue",
	"mockResolvedValueOnce",
	"mockRejectedValue",
	"mockRejectedValueOnce",
	"mockReturnValue",
	"mockReturnValueOnce",
	"mockImplementation",
	"mockImplementationOnce",
	"mockReset",
	"mockRestore",
	"mockClear"
]);

export function isMockConfigCall(node: ESTree.CallExpression): boolean {
	const callee = unwrapAwaitedExpression(node.callee);
	if (callee.type !== "MemberExpression" || callee.computed) {
		return false;
	}

	const name = identifierName(callee.property);
	return name !== null && MOCK_CONFIG_METHODS.has(name);
}
