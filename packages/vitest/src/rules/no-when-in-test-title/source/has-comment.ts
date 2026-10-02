/**
 * Whether this source slice contains a line or block comment opener.
 * Used to refuse a rewrite that would drop or relocate a comment.
 */
export function hasComment(text: string): boolean {
	return text.includes("//") || text.includes("/*");
}
