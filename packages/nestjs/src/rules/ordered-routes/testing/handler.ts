import type { Handler } from "../handler/handler";
import type { HandlerValues } from "./handler-values";
import { handlerValues } from "./handler-values";

export function handler(pathOrValues: HandlerValues | string): Handler {
	const values = handlerValues(pathOrValues);

	return {
		kind: "handler",
		method: values.method,
		originalText: values.originalText,
		path: values.path,
		range: values.range ?? [0, 1],
		reportNode: { name: values.originalText, type: "Identifier" } as Handler["reportNode"],
		text: values.originalText,
		unfixedArray: values.unfixedArray ?? false
	};
}
