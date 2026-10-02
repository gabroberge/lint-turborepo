import type { MemberKey } from "../model/member-key";

/** How a member key is written in labels: `name`, or `#name` for a private name. */
export function keyLabel(key: MemberKey): string {
	return key.private ? `#${key.name}` : key.name;
}
