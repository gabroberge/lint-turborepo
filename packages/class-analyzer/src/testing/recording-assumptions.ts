import type { ClassAssumptions } from "../index";

/** Assumes nothing, but records in `seen` the callee of every call it is asked about (its name, or its node type). */
export function recordingAssumptions(seen: string[]): ClassAssumptions {
	return {
		assumeCall(call) {
			seen.push(call.callee.type === "Identifier" ? call.callee.name : call.callee.type);
			return null;
		}
	};
}
