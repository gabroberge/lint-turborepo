import type { Conflict } from "../index";
import type { ClassConstraints } from "./class-constraints";

/** The conflict between two members named by key, in source order. */
export function conflictByKey(
	{ conflictAt, members }: ClassConstraints,
	earlierKey: string,
	laterKey: string
): Conflict {
	const earlier = members.find(({ key }) => key === earlierKey);
	const later = members.find(({ key }) => key === laterKey);
	if (earlier === undefined || later === undefined) {
		throw new Error("Expected both members");
	}

	return conflictAt(earlier, later);
}
