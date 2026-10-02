import { item } from "./item";
import type { OrderScenario } from "./order-scenario";
import { seededRandom } from "./seeded-random";

/** A reproducible scenario of 1 to 9 ranked items, randomly related to each other. */
export function randomOrderScenario(seed: number): OrderScenario {
	const random = seededRandom(seed);
	const size = 1 + Math.floor(random() * 9);
	const items = Array.from({ length: size }, (_, index) => item(`m${index}`, Math.floor(random() * 4)));
	const density = random() * 0.5;
	const links = new Set<string>();
	for (const [index, left] of items.entries()) {
		for (const right of items.slice(index + 1)) {
			if (random() < density) {
				links.add(`${left.name}|${right.name}`);
			}
		}
	}

	return {
		items,
		related: (left, right) => links.has(`${left.name}|${right.name}`) || links.has(`${right.name}|${left.name}`)
	};
}
