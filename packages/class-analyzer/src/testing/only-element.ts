import type { ESTree } from "@oxlint/plugins";

import { lines } from "./lines";
import { parseWithScope } from "./parse-with-scope";

/** The single element of a class with body `member`. */
export function onlyElement(member: string): ESTree.ClassElement {
	const { body } = parseWithScope(lines("class A {", `\t${member}`, "}"));
	const [node] = body.body;
	if (node === undefined) {
		throw new Error("Expected a member");
	}

	return node;
}
