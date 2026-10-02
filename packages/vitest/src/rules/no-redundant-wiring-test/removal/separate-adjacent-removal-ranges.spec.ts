import { describe, expect, it } from "vitest";

import { separateAdjacentRemovalRanges } from "./separate-adjacent-removal-ranges";

describe(separateAdjacentRemovalRanges, () => {
	it("should leave the newline between two adjacent ranges", () => {
		expect.assertions(1);

		const source = "aaaa\nbbbb\n";
		const ranges: [number, number][] = [
			[0, 5],
			[5, 10]
		];

		separateAdjacentRemovalRanges(source, ranges);

		expect(ranges).toStrictEqual([
			[0, 4],
			[5, 10]
		]);
	});

	it("should leave non-adjacent ranges unchanged", () => {
		expect.assertions(1);

		const source = "aaaa\n\nbbbb\n";
		const ranges: [number, number][] = [
			[0, 5],
			[6, 11]
		];

		separateAdjacentRemovalRanges(source, ranges);

		expect(ranges).toStrictEqual([
			[0, 5],
			[6, 11]
		]);
	});
});
