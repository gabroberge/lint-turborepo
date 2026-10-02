import type { Binding } from "../binding/binding-from-exported-name";

export function bindings(): Map<string, Binding> {
	return new Map<string, Binding>([
		["Get", { method: "GET", type: "method" }],
		["nest", { type: "namespace" }]
	]);
}
