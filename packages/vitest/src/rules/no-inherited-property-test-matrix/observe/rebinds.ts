import type { FunctionNode } from "@gabroberge/oxlint-estree";
import { bindsName, isFunctionNode, traverse } from "@gabroberge/oxlint-estree";

export function rebinds(fn: FunctionNode, name: string): boolean {
	if (fn.body === null) {
		return true;
	}

	let found = false;
	traverse(fn.body, (node) => {
		if (isFunctionNode(node)) {
			return "skip";
		}

		if (node.type === "VariableDeclarator" && bindsName(node.id, name)) {
			found = true;
		}

		if (node.type === "AssignmentExpression" && bindsName(node.left, name)) {
			found = true;
		}

		if (node.type === "UpdateExpression" && node.argument.type === "Identifier" && node.argument.name === name) {
			found = true;
		}

		return undefined;
	});

	return found;
}
