/**
 * Rewrite the modifier prefix of a class field so the accessibility keyword
 * is `protected`. `public` and `private` are replaced. A missing keyword
 * is inserted before the remaining modifiers.
 */
export function rewriteAccessibility(prefix: string): string {
	const leading = /^\s*/u.exec(prefix)?.[0] ?? "";
	const rest = prefix.slice(leading.length);

	if (/\bpublic\b/u.test(rest)) {
		return `${leading}${rest.replace(/\bpublic\b/u, "protected")}`;
	}

	if (/\bprivate\b/u.test(rest)) {
		return `${leading}${rest.replace(/\bprivate\b/u, "protected")}`;
	}

	return `${leading}protected ${rest}`;
}
