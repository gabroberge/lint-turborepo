import { describe, expect, it } from "vitest";

import { effectsStub } from "../testing/effects-stub";
import { memberStub } from "../testing/member-stub";
import { conflictTable } from "./conflict-table";

describe(conflictTable, () => {
	it("should compare members of one timeline", () => {
		expect.assertions(1);

		const a = memberStub({ index: 0, key: "a" });
		const b = memberStub({ index: 1, key: "b" });
		const members = [a, b];
		const conflictAt = conflictTable(members, [effectsStub(), effectsStub({ reads: ["a"] })]);

		expect(conflictAt(a, b)).toBe("definite");
	});

	it("should find no conflict across timelines", () => {
		expect.assertions(1);

		const a = memberStub({ index: 0, key: "a", static: true, timeline: "static" });
		const b = memberStub({ index: 1, key: "b" });
		const members = [a, b];
		const conflictAt = conflictTable(members, [effectsStub({ opaque: true }), effectsStub({ opaque: true })]);

		expect(conflictAt(a, b)).toBe("none");
	});

	it("should find no conflict with a member that runs nothing", () => {
		expect.assertions(1);

		const a = memberStub({ index: 0, key: "a", timeline: null });
		const b = memberStub({ index: 1, key: "b" });
		const members = [a, b];
		const conflictAt = conflictTable(members, [null, effectsStub({ opaque: true })]);

		expect(conflictAt(a, b)).toBe("none");
	});

	it("should memoize each ordered pair", () => {
		expect.assertions(2);

		const a = memberStub({ index: 0, key: "a" });
		const b = memberStub({ index: 1, key: "b" });
		const members = [a, b];
		const later = effectsStub();
		const effects = [effectsStub(), later];
		const conflictAt = conflictTable(members, effects);

		expect(conflictAt(a, b)).toBe("none");

		later.reads.add("a");

		expect(conflictAt(a, b)).toBe("none");
	});
});
