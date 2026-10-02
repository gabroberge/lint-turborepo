import type { Options } from "../options/options";

/** Rule options as a test passes them: none for the default preset, or one options object. */
export type RuleOptions = [] | [Options];

/** The rule options for an optional options object. */
export function ruleOptions(options: Options | undefined): RuleOptions {
	return options === undefined ? [] : [options];
}
