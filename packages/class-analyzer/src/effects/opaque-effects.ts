import type { Effects } from "./effects";
import { emptyEffects } from "./empty-effects";

/** Effects of code the analysis cannot follow: it may touch any member and change anything. */
export function opaqueEffects(): Effects {
	return { ...emptyEffects(), opaque: true, sideEffects: true };
}
