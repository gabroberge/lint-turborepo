import type { ModelDraft } from "../build/model-draft";
import { sameKey } from "../member/same-key";
import type { AccessMode } from "../model/fact";
import type { DeclarationId } from "../model/ids";
import type { MemberKey } from "../model/member-key";
import type { MemberTarget } from "../model/target";

/**
 * The target for a member of a module class, accessed in `mode`. For a key
 * declared by both a getter and a setter, a write targets the setter and a
 * read or call the getter. A member with a body is preferred over a
 * body-less signature with the same key; `member` is `null` when the class
 * declares no member with that key on that side.
 */
export function memberTarget(
	draft: ModelDraft,
	classId: DeclarationId,
	key: MemberKey,
	isStatic: boolean,
	mode: AccessMode
): MemberTarget {
	const candidates = (draft.membersByClass.get(classId) ?? []).filter(
		(member) => member.key !== null && sameKey(member.key, key) && member.static === isStatic
	);
	const avoided = mode === "write" ? "getter" : "setter";
	const member =
		candidates.find((candidate) => candidate.kind !== avoided && !candidate.signature) ??
		candidates.find((candidate) => !candidate.signature) ??
		candidates.find((candidate) => candidate.kind !== avoided) ??
		candidates[0];
	return { class: classId, key, kind: "member", member: member?.id ?? null, static: isStatic };
}
