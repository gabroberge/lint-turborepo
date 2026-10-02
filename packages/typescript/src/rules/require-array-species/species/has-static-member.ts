import type { ESTree } from "@oxlint/plugins";

import { isStaticSpeciesMember } from "./is-static-member";

export function hasStaticSpeciesMember(body: ESTree.ClassBody): boolean {
	return body.body.some(isStaticSpeciesMember);
}
