import type { LintResult } from "./lint";

/** The message id of every report, or its message when it has no id (such as a parse error). */
export function messageIds(result: LintResult): string[] {
	return result.messages.map((message) => message.messageId ?? message.message);
}
