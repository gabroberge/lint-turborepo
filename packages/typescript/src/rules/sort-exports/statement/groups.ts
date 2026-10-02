import type { ESTree } from "@oxlint/plugins";

import { isExportFrom } from "./is-export-from";
import type { Group } from "./with-export-from";
import { withExportFrom } from "./with-export-from";

export function groups(body: readonly ESTree.Statement[]): Group[] {
	const result: Group[] = [];
	let group: Group | null = null;

	for (const statement of body) {
		if (isExportFrom(statement)) {
			group = withExportFrom(group, statement);
			continue;
		}

		if (group !== null) {
			result.push(group);
			group = null;
		}
	}

	if (group !== null) {
		result.push(group);
	}

	return result;
}
