import type { Comment } from "@oxlint/plugins";

/** The comments lying entirely within `[from, to)`. */
export function commentsBetween(comments: readonly Comment[], from: number, to: number): Comment[] {
	return comments.filter((comment) => comment.range[0] >= from && comment.range[1] <= to);
}
