import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { createBeforeEachOwnership } from "./before-each/create-ownership";
import { isViSpyOn } from "./spy-on/is-vi-spy-on";

export function lint(context: Context): VisitorWithHooks {
	const ownership = createBeforeEachOwnership();

	return {
		...ownership.visitors,
		CallExpression(node) {
			ownership.note(node);

			if (isViSpyOn(node) && !ownership.inDirectBeforeEach()) {
				context.report({ messageId: "spyOnOutsideBeforeEach", node });
			}
		}
	};
}
