import type { AnalyzedMember } from "../index";

const VISIBILITY_RANK = { private: 2, protected: 1, public: 0 };

/** A sample member preference: fields first, then by visibility, then by key. */
export function preferredOrder(left: AnalyzedMember, right: AnalyzedMember): number {
	const runs = (member: AnalyzedMember): number => (member.timeline === null ? 1 : 0);
	return (
		runs(left) - runs(right) ||
		VISIBILITY_RANK[left.visibility] - VISIBILITY_RANK[right.visibility] ||
		(left.key ?? "").localeCompare(right.key ?? "")
	);
}
