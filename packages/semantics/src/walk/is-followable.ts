import type { Declaration } from "../model/declaration";

/**
 * True when calling a module-level binding runs code the model analyzes: a
 * function declaration, or a variable initialized with a function literal
 * or a signal-like callable, and never reassigned.
 */
export function isFollowable(declaration: Declaration | undefined): boolean {
	if (declaration?.kind === "function") {
		return !declaration.reassigned;
	}

	if (declaration?.kind !== "variable" || declaration.reassigned) {
		return false;
	}

	return declaration.value === "function" || declaration.value === "assumed-callable";
}
