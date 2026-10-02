import type { Variable } from "@oxlint/plugins";

/** True when a binding is assigned somewhere other than its declaration. */
export function isReassigned(variable: Variable): boolean {
	return variable.references.some((reference) => reference.isWrite() && !reference.init);
}
