import { KNOWN_HTTP_METHODS } from "./known-http-methods";

export function withOmittedKnownMethods(order: readonly string[]): string[] {
	const seen = new Set(order);
	const complete = [...order];

	for (const method of KNOWN_HTTP_METHODS) {
		if (!seen.has(method)) {
			complete.push(method);
		}
	}

	return complete;
}
