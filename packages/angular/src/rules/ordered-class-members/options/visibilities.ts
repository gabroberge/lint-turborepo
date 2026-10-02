import type { Visibility as AnalyzedVisibility } from "@gabroberge/typescript-class-analyzer";

/** A member's accessibility, as the analyzer reports it. */
export type Visibility = AnalyzedVisibility;

/** Accessibility levels, in the default sort order. Implicit accessibility counts as `public`. */
export const VISIBILITIES: readonly Visibility[] = ["public", "protected", "private"];
