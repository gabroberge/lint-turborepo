import type { ClassAssumptions } from "./class-assumptions";

/**
 * Assume nothing about outside code: every call that does not reach the
 * class's own code (methods, accessors and function fields called through
 * `this`, immediately invoked function literals) is unknown code, a side
 * effect whose function arguments run right away.
 */
export const NO_ASSUMPTIONS: ClassAssumptions = {
	assumeCall: () => null
};
