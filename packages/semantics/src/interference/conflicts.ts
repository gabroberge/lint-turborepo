import type { AccessFact } from "../model/fact";
import { sameLocation } from "./same-location";

/**
 * True when the order of two accesses to the same location matters: one
 * writes it, or one calls what the other assigns (the call runs the
 * function stored before it, so assigning first changes what runs).
 */
export function conflicts(left: AccessFact, right: AccessFact): boolean {
	if (left.mode === "read" && right.mode === "read") {
		return false;
	}

	if (left.mode === "call" && right.mode === "call") {
		return false;
	}

	return sameLocation(left.target, right.target);
}
