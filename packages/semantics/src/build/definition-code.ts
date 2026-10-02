import type { ESTree } from "@oxlint/plugins";

/**
 * The code evaluated once when a class is defined, outside its members'
 * own units: the `extends` expression, every decorator (of the class, its
 * members and constructor parameters), and computed member keys.
 */
export function definitionCode(node: ESTree.Class): ESTree.Node[] {
	const code: ESTree.Node[] = [...node.decorators];
	if (node.superClass !== null) {
		code.push(node.superClass);
	}

	for (const member of node.body.body) {
		if (member.type === "StaticBlock" || member.type === "TSIndexSignature") {
			continue;
		}

		code.push(...member.decorators);
		if (member.computed) {
			code.push(member.key);
		}

		if (member.type === "MethodDefinition" && member.kind === "constructor") {
			for (const parameter of member.value.params) {
				if ("decorators" in parameter && Array.isArray(parameter.decorators)) {
					code.push(...(parameter.decorators as ESTree.Decorator[]));
				}
			}
		}
	}

	return code.toSorted((left, right) => left.range[0] - right.range[0]);
}
