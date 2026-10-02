import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { resolveOptions } from "./options/resolve-options";
import { checkClassBody } from "./report/check-class-body";

export function lint(context: Context): VisitorWithHooks {
	const options = resolveOptions(context);

	return {
		ClassBody(node) {
			checkClassBody(context, options, node);
		}
	};
}
