import type { AnalyzedMember, Conflict } from "../index";
import { blockedMoves } from "../index";
import { memberStub } from "./member-stub";

/**
 * The blocked moves, as `[earlier, later]` key pairs, among members named by
 * `keys` in source order, preferred in the order of `preferred`, with
 * `conflicts` keyed `earlier-later` (any other pair does not conflict).
 */
export function blockedKeyPairs(
	keys: string[],
	preferred: string[],
	conflicts: Record<string, Conflict>
): [string, string][] {
	const members = keys.map((key, index) => memberStub({ index, key }));
	const rank = (member: AnalyzedMember): number => preferred.indexOf(member.key ?? "");
	const conflictAt = (earlier: AnalyzedMember, later: AnalyzedMember): Conflict =>
		conflicts[`${earlier.key}-${later.key}`] ?? "none";

	return blockedMoves(members, (left, right) => rank(left) - rank(right), conflictAt).map(({ earlier, later }) => [
		earlier.key ?? "",
		later.key ?? ""
	]);
}
