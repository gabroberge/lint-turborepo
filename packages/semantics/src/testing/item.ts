/** A named item with a preference rank: lower goes first. */
export interface Item {
	name: string;
	rank: number;
}

export function item(name: string, rank: number): Item {
	return { name, rank };
}
