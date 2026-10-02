import type { Effects } from "./effects";
import { emptyEffects } from "./empty-effects";
import { mergeEffects } from "./merge-effects";

/** Expand `direct` with everything the members it calls may do, transitively. Cycles are followed once. */
export function resolveEffects(direct: Effects, summaries: ReadonlyMap<string, Effects>): Effects {
	const resolved = emptyEffects();
	mergeEffects(resolved, direct);

	const pending = [...direct.calls];
	const seen = new Set(pending);
	for (let key = pending.pop(); key !== undefined; key = pending.pop()) {
		const summary = summaries.get(key);
		if (summary === undefined) {
			continue;
		}

		mergeEffects(resolved, summary);
		for (const next of summary.calls) {
			if (!seen.has(next)) {
				seen.add(next);
				pending.push(next);
			}
		}
	}

	return resolved;
}
