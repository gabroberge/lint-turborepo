import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";
import { member } from "./member";

export function testCallee(name: "it" | "test", modifier?: string): ESTree.Expression {
	if (modifier === undefined) {
		return identifier(name);
	}

	return member(identifier(name), modifier);
}
