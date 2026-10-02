import type { HttpMethod } from "../../../order-routes";
import { isHttpMethod } from "../../../order-routes";

const HTTP_DECORATOR_METHODS = {
	All: "ALL",
	Delete: "DELETE",
	Get: "GET",
	Head: "HEAD",
	Options: "OPTIONS",
	Patch: "PATCH",
	Post: "POST",
	Put: "PUT",
	QueryMethod: "QUERY",
	Search: "SEARCH"
} as const satisfies Record<string, HttpMethod>;

export function httpMethodFromDecoratorName(name: string): HttpMethod | null {
	const method = HTTP_DECORATOR_METHODS[name as keyof typeof HTTP_DECORATOR_METHODS];
	if (!isHttpMethod(method)) {
		return null;
	}

	return method;
}
