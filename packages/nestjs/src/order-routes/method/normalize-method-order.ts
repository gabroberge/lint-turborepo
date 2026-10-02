export function normalizeMethodOrder(methods: readonly string[]): string[] {
	const order: string[] = [];
	const seen = new Set<string>();

	for (const method of methods) {
		const normalized = method.toUpperCase();
		if (seen.has(normalized)) {
			continue;
		}

		seen.add(normalized);
		order.push(normalized);
	}

	return order;
}
