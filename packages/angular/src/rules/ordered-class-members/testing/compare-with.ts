import type { ClassMember } from "../member/class-member";
import type { Options } from "../options/options";
import { preferredCompare } from "../order/preferred-compare";
import { resolveTestOptions } from "./resolve-test-options";

/** The preferred member order under `options`. */
export function compareWith(options?: Options): (left: ClassMember, right: ClassMember) => number {
	return preferredCompare(resolveTestOptions(options));
}
