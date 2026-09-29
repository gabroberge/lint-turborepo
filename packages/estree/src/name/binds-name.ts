import type { ESTree } from "@oxlint/plugins";

export function bindsName(node: ESTree.Node, name: string): boolean {
	if (node.type === "Identifier") {
		return node.name === name;
	}

	if (node.type === "AssignmentPattern") {
		return bindsName(node.left, name);
	}

	if (node.type === "RestElement") {
		return bindsName(node.argument, name);
	}

	if (node.type === "ObjectPattern") {
		return node.properties.some((property) => bindsName(property, name));
	}

	if (node.type === "ArrayPattern") {
		return node.elements.some((element) => element !== null && bindsName(element, name));
	}

	if (node.type === "Property") {
		return bindsName(node.value, name);
	}

	return false;
}
