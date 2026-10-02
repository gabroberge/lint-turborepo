import type { ControllerEntry, Handler } from "../handler/handler";

export function sortableRegions(entries: readonly ControllerEntry[]): Handler[][] {
	const regions: Handler[][] = [];
	let current: Handler[] = [];

	for (const entry of entries) {
		if (entry.kind === "handler") {
			current.push(entry);
			continue;
		}

		if (current.length > 0) {
			regions.push(current);
			current = [];
		}
	}

	if (current.length > 0) {
		regions.push(current);
	}

	return regions;
}
