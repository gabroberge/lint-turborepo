import type { ESTree } from "@oxlint/plugins";

import type { ModelDraft } from "../build/model-draft";
import type { Fact } from "../model/fact";
import type { DeclarationId } from "../model/ids";
import type { Unit } from "../model/unit";
import type { Flow } from "./flow";

/** The state of one walk over a unit's own code. */
export interface Walker {
	draft: ModelDraft;
	emit: (fact: Fact) => void;
	/** The declaration whose value a stored function literal becomes part of, if any. */
	storeOwner: DeclarationId | null;
	unit: Unit;
	visit: (node: ESTree.Node, flow: Flow) => void;
}
