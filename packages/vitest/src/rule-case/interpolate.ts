export function interpolate(template: string | undefined, data: Readonly<Record<string, string>>): string | undefined {
	if (template === undefined) {
		return undefined;
	}

	return template.replace(/\{\{([^{}]+)\}\}/gu, (fullMatch, termWithWhitespace: string) => {
		const term = termWithWhitespace.trim();
		if (Object.hasOwn(data, term)) {
			return data[term] ?? fullMatch;
		}

		return fullMatch;
	});
}
