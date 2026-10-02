import type { ClassAssumptions, Conflict } from "../index";
import { analyzeMembers, initializationConstraints } from "../index";
import { parseWithScope } from "./parse-with-scope";

/** Every conflict between two members of the first class of `code`, keyed `earlier-later`. */
export function conflictsOf(code: string, assumptions: ClassAssumptions): Record<string, Conflict> {
	const { body, sourceCode } = parseWithScope(code);
	const members = analyzeMembers(body);
	const conflictAt = initializationConstraints(sourceCode, body, members, assumptions);
	const conflicts: Record<string, Conflict> = {};
	for (const [index, earlier] of members.entries()) {
		for (const later of members.slice(index + 1)) {
			conflicts[`${earlier.key ?? "?"}-${later.key ?? "?"}`] = conflictAt(earlier, later);
		}
	}

	return conflicts;
}
