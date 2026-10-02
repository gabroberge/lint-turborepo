import { sameKey } from "../member/same-key";
import type { AccessTarget } from "../model/target";

/**
 * True when two targets are the same location tracked by the model: the
 * same key on the same side (static or instance) of the same module class,
 * the same module-level or imported declaration, or the same global name.
 * Closure bindings and properties of other objects are never the same
 * location here: their identity is not tracked.
 */
export function sameLocation(left: AccessTarget, right: AccessTarget): boolean {
	if (left.kind === "member" && right.kind === "member") {
		return left.class === right.class && left.static === right.static && sameKey(left.key, right.key);
	}

	if (left.kind === "binding" && right.kind === "binding") {
		if (left.declaration !== null || right.declaration !== null) {
			return left.declaration === right.declaration;
		}

		return left.scope === "global" && right.scope === "global" && left.name === right.name;
	}

	return false;
}
