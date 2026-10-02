import type { Walker } from "./walker";

/** Record assigning a member of the analyzed object. A setter runs its body instead. */
export function writeMember(walker: Walker, key: string | null): void {
	const { effects } = walker;
	const kind = key === null ? undefined : walker.scope.kinds.get(key);
	if (key === null || kind === undefined) {
		effects.opaque = true;
		return;
	}

	if (kind === "accessor") {
		effects.calls.add(key);
		return;
	}

	effects.writes.add(key);
}
