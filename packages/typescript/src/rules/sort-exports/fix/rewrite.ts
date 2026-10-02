import type { Group } from "../statement/with-export-from";
import type { Source } from "./analyze";
import type { Replacement } from "./replace";
import { replace } from "./replace";

export function rewrite(source: Source | null, group: Group): Replacement | null {
	if (source === null) {
		return null;
	}

	return replace(source, group);
}
