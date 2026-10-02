import type { AnalyzedMember } from "../member/analyzed-member";

/** A member the preferred order would move above an earlier one, held back by an uncertain interaction. */
export interface BlockedMove<Member extends AnalyzedMember = AnalyzedMember> {
	earlier: Member;
	later: Member;
}
