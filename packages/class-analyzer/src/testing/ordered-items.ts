import { constrainedOrder } from "../index";
import type { Item } from "./item";
import type { OrderScenario } from "./order-scenario";
import { rankIn } from "./rank-in";

/** The constrained order of a scenario, preferring items by rank. */
export function orderedItems(scenario: OrderScenario): Item[] {
	return constrainedOrder(scenario.items, rankIn(scenario.items), scenario.related);
}
