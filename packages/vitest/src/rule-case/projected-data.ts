export function projectedData(
	hydrated: string | undefined,
	reported: string,
	wanted: Readonly<Record<string, string>>
): Readonly<Record<string, string>> {
	if (hydrated === reported) {
		return wanted;
	}

	return { message: reported };
}
