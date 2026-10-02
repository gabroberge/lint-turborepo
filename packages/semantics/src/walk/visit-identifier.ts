import type { IdentifierNode } from "@gabroberge/oxlint-estree";

import { resolveIdentifier } from "../resolve/resolve-identifier";
import { emitAccess } from "./emit-access";
import { emitUnknown } from "./emit-unknown";
import type { Walker } from "./walker";

/**
 * An identifier read for its value. Locals of the unit are not reported.
 * The class's own name used as a value in its static code hands the
 * receiver to other code, like a bare `this`.
 */
export function visitIdentifier(walker: Walker, node: IdentifierNode): void {
	const resolution = resolveIdentifier(walker, node);
	if (resolution.kind === "local") {
		return;
	}

	const { receiver } = walker.unit;
	if (resolution.kind === "class" && receiver.kind === "class" && receiver.class === resolution.class) {
		emitUnknown(walker, "receiver-escape", node);
		return;
	}

	emitAccess(walker, "read", resolution.target, node);
}
