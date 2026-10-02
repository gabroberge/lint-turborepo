import type { Effects } from "./effects";

export function emptyEffects(): Effects {
	return {
		calls: new Set(),
		external: false,
		opaque: false,
		reads: new Set(),
		sideEffects: false,
		writes: new Set()
	};
}
