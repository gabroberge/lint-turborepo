import type { Context } from "@oxlint/plugins";

import type { Options } from "../options/options";
import { resolveOptions } from "../options/resolve-options";
import type { ResolvedOptions } from "../options/resolved-options";

/** Resolve rule options the way the rule does for a context configured with `options`. */
export function resolveTestOptions(options?: Options): ResolvedOptions {
	const context = { options: options === undefined ? [] : [options] } as unknown as Context;
	return resolveOptions(context);
}
