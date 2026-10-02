export function methodRank(method: string, methodOrder: readonly string[]): number {
	const index = methodOrder.indexOf(method);
	if (index === -1) {
		return methodOrder.length;
	}

	return index;
}
