import type { ESTree } from "@oxlint/plugins";

import { groups } from "../statement/groups";
import type { Group } from "../statement/with-export-from";

export function groupOf(body: readonly ESTree.Statement[]): Group {
	const group = groups(body)[0];
	if (group === undefined) {
		throw new Error("expected a group");
	}

	return group;
}
