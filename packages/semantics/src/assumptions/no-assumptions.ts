import type { Assumptions } from "./assumptions";

/** Assume nothing about outside code: every call into it is unknown code. */
export const NO_ASSUMPTIONS: Assumptions = {
	assumeCall: () => null
};
