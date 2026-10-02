import type { AnalyzedMember } from "@gabroberge/typescript-class-analyzer";

import type { Category } from "../options/categories";

/** An analyzed class member, with the Angular category it sorts under and the name diagnostics use. */
export interface ClassMember extends AnalyzedMember {
	category: Category;
	label: string;
}
