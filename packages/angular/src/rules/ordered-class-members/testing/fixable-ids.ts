import type { LintResult } from "./lint";

/** The message ids of the reports that carry a fix. */
export function fixableIds(result: LintResult): string[] {
	return result.messages.filter((message) => message.fix !== undefined).map((message) => message.messageId ?? "");
}
