import type { ESTree } from "@oxlint/plugins";

import { sameMemberProperty } from "./same-member-property";
import { sameSafeShape } from "./same-safe-shape";

export function sameMemberShape(left: ESTree.MemberExpression, right: ESTree.MemberExpression): boolean {
	if (left.computed !== right.computed) {
		return false;
	}

	if (left.optional !== right.optional) {
		return false;
	}

	if (!sameSafeShape(left.object, right.object)) {
		return false;
	}

	return sameMemberProperty(left, right);
}
