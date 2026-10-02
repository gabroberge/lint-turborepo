import type { Fact } from "../model/fact";
import type { UnitId } from "../model/ids";
import type { CallEdge } from "./call-edge";

/**
 * A fact of a unit that may run while another unit runs, with the call
 * relations leading there. A fact of the starting unit itself has an empty path.
 */
export interface ReachedFact {
	fact: Fact;
	path: readonly CallEdge[];
	unit: UnitId;
}
