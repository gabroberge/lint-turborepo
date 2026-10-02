import type { Rule } from "@oxlint/plugins";

import { interpolate } from "./interpolate";
import { projectedData } from "./projected-data";

export interface ExpectedMessage {
	data?: Readonly<Record<string, string>>;
	line?: number;
	message?: string;
	messageId?: string;
}

interface ReportedMessage {
	line: number;
	message: string;
	messageId?: string | undefined;
}

export function projectMessages(
	rule: Rule,
	messages: readonly ReportedMessage[],
	expected: readonly ExpectedMessage[]
): ExpectedMessage[] {
	return messages.map((message, index) => {
		const wanted = expected[index];
		if (wanted === undefined) {
			return { messageId: message.messageId ?? "" };
		}

		const projected: ExpectedMessage = {};
		if (Object.hasOwn(wanted, "message")) {
			projected.message = message.message;
		}

		if (Object.hasOwn(wanted, "messageId")) {
			projected.messageId = message.messageId ?? "";
		}

		if (Object.hasOwn(wanted, "data") && wanted.data !== undefined && wanted.messageId !== undefined) {
			const template = rule.meta?.messages?.[wanted.messageId];
			const hydrated = interpolate(template, wanted.data);
			projected.data = projectedData(hydrated, message.message, wanted.data);
		}

		if (Object.hasOwn(wanted, "line")) {
			projected.line = message.line;
		}

		return projected;
	});
}
