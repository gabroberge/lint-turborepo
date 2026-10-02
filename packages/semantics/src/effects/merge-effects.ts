import type { Effects } from "./effects";

/** Add everything `source` may do to `target`. */
export function mergeEffects(target: Effects, source: Effects): void {
	for (const key of source.calls) {
		target.calls.add(key);
	}

	for (const key of source.reads) {
		target.reads.add(key);
	}

	for (const key of source.writes) {
		target.writes.add(key);
	}

	target.external ||= source.external;
	target.opaque ||= source.opaque;
	target.sideEffects ||= source.sideEffects;
}
