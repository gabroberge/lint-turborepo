import type { Comment } from "@oxlint/plugins";

import { commentsBetween } from "./comments-between";
import { sameLine } from "./same-line";

/** The comments before `boundary` that start on the line where a member ends at `memberEnd`. */
export function trailingComments(
	source: string,
	comments: readonly Comment[],
	memberEnd: number,
	boundary: number
): Comment[] {
	return commentsBetween(comments, memberEnd, boundary).filter((comment) =>
		sameLine(source, memberEnd, comment.range[0])
	);
}
