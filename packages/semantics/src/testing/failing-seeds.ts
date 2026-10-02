import type { Item } from "./item";
import type { OrderScenario } from "./order-scenario";
import { orderedItems } from "./ordered-items";
import { randomOrderScenario } from "./random-order-scenario";

const RUNS = 300;

/** Seeds whose random scenario breaks `holds`, given the scenario and its constrained order. */
export function failingSeeds(holds: (scenario: OrderScenario, result: Item[]) => boolean): number[] {
	return Array.from({ length: RUNS }, (_, index) => index + 1).filter((seed) => {
		const scenario = randomOrderScenario(seed);
		return !holds(scenario, orderedItems(scenario));
	});
}
