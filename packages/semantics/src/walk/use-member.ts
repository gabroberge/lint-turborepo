import type { Walker } from "./walker";

/**
 * Record reading a member of the analyzed object, or calling it when
 * `invoked`. A field's value may be a function that whoever receives it
 * calls later, so reading a field also counts its stored code as run.
 */
export function useMember(walker: Walker, key: string | null, invoked: boolean): void {
	const { effects } = walker;
	const kind = key === null ? undefined : walker.scope.kinds.get(key);
	if (key === null || kind === undefined) {
		effects.opaque = true;
		effects.sideEffects ||= invoked;
		return;
	}

	switch (kind) {
		case "accessor": {
			effects.calls.add(key);
			effects.sideEffects ||= invoked;
			return;
		}
		case "field":
		case "function-field": {
			effects.reads.add(key);
			effects.calls.add(key);
			if (invoked) {
				effects.external = true;
				effects.sideEffects ||= kind === "field";
			}

			return;
		}
		case "method": {
			effects.calls.add(key);
			return;
		}
		case "parameter": {
			effects.reads.add(key);
			effects.sideEffects ||= invoked;
		}
	}
}
