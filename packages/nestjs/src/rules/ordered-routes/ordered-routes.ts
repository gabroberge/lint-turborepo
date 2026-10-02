import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { KNOWN_HTTP_METHODS } from "../../order-routes";
import { lint } from "./lint";

export const orderedRoutesRule: PluginRule = {
	createOnce(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [
			{
				methodOrder: ["POST", "GET", "PATCH", "PUT", "DELETE"]
			}
		],
		docs: {
			description:
				"Require NestJS controller handlers to be ordered by HTTP method and route specificity so static routes are not shadowed.",
			recommended: true
		},
		fixable: "code",
		messages: {
			unordered:
				"Reorder route handlers in `{{className}}` by HTTP method, then by path specificity: shorter paths, then static segments, then parameters, then wildcards."
		},
		schema: [
			{
				additionalProperties: false,
				properties: {
					methodOrder: {
						items: {
							enum: [...KNOWN_HTTP_METHODS],
							type: "string"
						},
						type: "array",
						uniqueItems: true
					}
				},
				type: "object"
			}
		],
		type: "problem"
	},
	name: "ordered-routes"
};
