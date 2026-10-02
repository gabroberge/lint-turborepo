import type { ModelDraft } from "../build/model-draft";
import { sameKey } from "../member/same-key";
import type { DeclarationId } from "../model/ids";
import type { MemberKey } from "../model/member-key";
import type { MemberTarget } from "../model/target";

/**
 * The target for a member of a module class. A member with a body is
 * preferred over a body-less signature with the same key; `member` is `null`
 * when the class declares no member with that key on that side.
 */
export function memberTarget(
	draft: ModelDraft,
	classId: DeclarationId,
	key: MemberKey,
	isStatic: boolean
): MemberTarget {
	const candidates = (draft.membersByClass.get(classId) ?? []).filter(
		(member) => member.key !== null && sameKey(member.key, key) && member.static === isStatic
	);
	const member = candidates.find((candidate) => !candidate.signature) ?? candidates[0];
	return { class: classId, key, kind: "member", member: member?.id ?? null, static: isStatic };
}
