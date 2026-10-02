import type { FunctionDisposition } from "../model/fact";
import type { Flow } from "./flow";

const DISPOSITIONS: Record<Flow, FunctionDisposition> = {
	assumed: "passed-to-assumed",
	local: "bound-locally",
	run: "passed-to-unknown",
	store: "stored"
};

/** What a function literal written where the value flows this way becomes. */
export function dispositionOf(flow: Flow): FunctionDisposition {
	return DISPOSITIONS[flow];
}
