import type { ESTree } from "@oxlint/plugins";

import { staticName } from "../name/static-name";
import { sameSafeShape } from "./same-safe-shape";

export function sameMemberProperty(left: ESTree.MemberExpression, right: ESTree.MemberExpression): boolean {
	if (left.computed !== right.computed) {
		return false;
	}

	if (left.computed && right.computed) {
		return sameSafeShape(left.property, right.property);
	}

	if (left.property.type !== right.property.type) {
		return false;
	}

	const leftName = staticName(left.property);
	if (leftName === null) {
		return false;
	}

	const rightName = staticName(right.property);
	if (rightName === null) {
		return false;
	}

	return leftName === rightName;
}
