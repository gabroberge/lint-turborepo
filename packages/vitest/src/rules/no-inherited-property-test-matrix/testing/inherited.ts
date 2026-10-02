export function inherited(
	property: string,
	owner: string,
	line?: number
): {
	data: { owner: string; property: string };
	line?: number;
	messageId: "inheritedPropertyMatrix";
} {
	return {
		data: { owner, property },
		messageId: "inheritedPropertyMatrix" as const,
		...(line !== undefined && { line })
	};
}
