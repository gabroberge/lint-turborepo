import type { FixFn } from "@oxlint/plugins";

/** The `fix` part of a report: the shared rewrite when one is safe, nothing otherwise. */
export interface FixProperty {
	fix?: FixFn;
}
