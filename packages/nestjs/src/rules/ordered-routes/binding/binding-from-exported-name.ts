import type { HttpMethod } from "../../../order-routes";
import { httpMethodFromDecoratorName } from "./http-method-from-decorator-name";

export type Binding = { type: "controller" } | { type: "method"; method: HttpMethod } | { type: "namespace" };

export function bindingFromExportedName(name: string | null): Binding | null {
	if (name === null) {
		return null;
	}

	if (name === "Controller") {
		return { type: "controller" };
	}

	const method = httpMethodFromDecoratorName(name);
	if (method === null) {
		return null;
	}

	return { method, type: "method" };
}
