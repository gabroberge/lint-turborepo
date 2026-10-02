import { order } from "../compare/order";
import type { Group } from "../statement/with-export-from";
import type { Source } from "./analyze";
import { textOf } from "./text-of";
import { textsFromSource } from "./texts-from-source";

export interface Replacement {
	range: [number, number];
	text: string;
}

export function replace(source: Source, group: Group): Replacement {
	const texts = textsFromSource(source);
	const [lead, ...following] = order(group);
	let text = textOf(texts, lead);

	for (const [index, item] of source.rest.entries()) {
		const statement = following[index];
		if (statement === undefined) {
			throw new Error("replace: ordered group is shorter than analyzed source");
		}

		text += item.separator + textOf(texts, statement);
	}

	return { range: source.range, text };
}
