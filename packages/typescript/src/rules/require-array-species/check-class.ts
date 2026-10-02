import type { Context, ESTree } from "@oxlint/plugins";

import { extendsArray } from "./heritage/extends-array";
import { hasStaticSpeciesMember } from "./species/has-static-member";

export function checkClass(context: Context, node: ESTree.Class): void {
	if (!extendsArray(node.superClass)) {
		return;
	}

	if (hasStaticSpeciesMember(node.body)) {
		return;
	}

	context.report({
		messageId: "missingSpecies",
		node
	});
}
