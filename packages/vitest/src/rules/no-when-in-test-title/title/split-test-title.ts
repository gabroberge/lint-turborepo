import type { ESTree } from "@oxlint/plugins";

import type { SplitTitle } from "./split-when";
import { splitWhen } from "./split-when";
import { staticTitle } from "./static-title";

/**
 * A static title that splits at exactly one `when` word, with the literal
 * that must be rewritten.
 */
export function splitTestTitle(title: ESTree.Expression): SplitTitle | null {
	const read = staticTitle(title);
	if (read === null) {
		return null;
	}

	const split = splitWhen(read.value);
	if (split === null) {
		return null;
	}

	return { ...split, literal: read.literal };
}
