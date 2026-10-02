import type { HttpMethod } from "./known-http-methods";
import { KNOWN_HTTP_METHODS } from "./known-http-methods";

const HTTP_METHOD_SET: ReadonlySet<string> = new Set(KNOWN_HTTP_METHODS);

export function isHttpMethod(method: string): method is HttpMethod {
	return HTTP_METHOD_SET.has(method);
}
