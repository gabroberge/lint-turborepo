import type { AccessFact } from "../model/fact";
import { sameLocation } from "./same-location";

/**
 * True when the order of two accesses matters: they touch the same location
 * and at least one writes it. A read, call or construction against a write
 * observes the value before or after it (a call runs the function stored
 * before it, so assigning first changes what runs).
 */
export function conflicts(left: AccessFact, right: AccessFact): boolean {
	if (left.mode !== "write" && right.mode !== "write") {
		return false;
	}

	return sameLocation(left.target, right.target);
}
