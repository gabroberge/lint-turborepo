import type { AccessTarget } from "../model/target";

/**
 * A string naming the location a target denotes, such that two targets have
 * the same key exactly when `sameLocation` holds for them, or `null` for a
 * target that is no location tracked by the model (a closure binding, a
 * property of another object, a function literal's unit).
 */
export function locationKey(target: AccessTarget): string | null {
	if (target.kind === "member") {
		return JSON.stringify(["member", target.class, target.static, target.key.private, target.key.name]);
	}

	if (target.kind !== "binding") {
		return null;
	}

	if (target.declaration !== null) {
		return JSON.stringify(["declaration", target.declaration]);
	}

	return target.scope === "global" ? JSON.stringify(["global", target.name]) : null;
}
