import type { ESTree } from "@oxlint/plugins";

/**
 * The code evaluated once when a class is defined, outside its members'
 * own units: the `extends` expression, every decorator (of the class, its
 * members, and the parameters of its constructor, methods and accessors),
 * and computed member keys. Decorators are walked only here: a walk over
 * any other code skips them.
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

		if (member.type === "MethodDefinition" || member.type === "TSAbstractMethodDefinition") {
			for (const parameter of member.value.params) {
				code.push(...parameterDecorators(parameter));
			}
		}
	}

	return code.toSorted((left, right) => left.range[0] - right.range[0]);
}

function parameterDecorators(parameter: ESTree.Node): ESTree.Decorator[] {
	return "decorators" in parameter && Array.isArray(parameter.decorators)
		? (parameter.decorators as ESTree.Decorator[])
		: [];
}
