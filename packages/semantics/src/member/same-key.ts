import type { MemberKey } from "../model/member-key";

/** True when two member keys denote the same runtime key. */
export function sameKey(left: MemberKey, right: MemberKey): boolean {
	return left.name === right.name && left.private === right.private;
}
