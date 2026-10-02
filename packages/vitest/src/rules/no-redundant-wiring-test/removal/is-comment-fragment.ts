/**
 * A line that looks like part of a block comment. A partial block is
 * ambiguous for attachment.
 */
export function isCommentFragment(line: string): boolean {
	const trimmed = line.trim();
	return trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("*/");
}
