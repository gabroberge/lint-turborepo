import type { ESTree } from "@oxlint/plugins";

import type { Timeline } from "./timeline";
import type { Visibility } from "./visibility";

/** A class element, with what the analysis needs to know about it. */
export interface AnalyzedMember {
	/** Position in the class body, in source order. */
	index: number;
	/** Runtime property key (`#name` for a private name), or `null` for a computed key that is not a string or number literal. */
	key: string | null;
	node: ESTree.ClassElement;
	/** A method signature without a body, which must stay next to its implementation. */
	overload: boolean;
	static: boolean;
	/** The timeline the member's initialization runs in, or `null` when it runs nothing while the class is set up. */
	timeline: Timeline | null;
	visibility: Visibility;
}
