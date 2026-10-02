import { describe, expect, it } from "vitest";

import type { AccessTarget } from "../index";
import { locationKey } from "./location-key";
import { sameLocation } from "./same-location";

interface MemberOptions {
	class?: string;
	private?: boolean;
	static?: boolean;
}

function binding(
	name: string,
	scope: "closure" | "global" | "import" | "module",
	declaration: string | null = null
): AccessTarget {
	return { declaration, kind: "binding", mutable: true, name, scope };
}

function member(name: string, options: MemberOptions = {}): AccessTarget {
	return {
		class: options.class ?? "c1",
		key: { name, private: options.private ?? false },
		kind: "member",
		member: null,
		static: options.static ?? false
	};
}

describe(sameLocation, () => {
	it.each([
		{ left: member("x"), name: "one key of one class", right: member("x"), same: true },
		{ left: member("x"), name: "two keys", right: member("y"), same: false },
		{ left: member("x"), name: "two classes", right: member("x", { class: "c2" }), same: false },
		{ left: member("x"), name: "the static and instance sides", right: member("x", { static: true }), same: false },
		{ left: member("x", { private: true }), name: "#x and a string key x", right: member("x"), same: false },
		{ left: member("#x"), name: "#x and a string key #x", right: member("x", { private: true }), same: false },
		{
			left: binding("a", "module", "d1"),
			name: "one module declaration",
			right: binding("a", "module", "d1"),
			same: true
		},
		{
			left: binding("a", "module", "d1"),
			name: "two module declarations",
			right: binding("a", "module", "d2"),
			same: false
		},
		{
			left: binding("a", "import", "d1"),
			name: "a declaration and a global",
			right: binding("a", "global"),
			same: false
		},
		{ left: binding("a", "global"), name: "one global name", right: binding("a", "global"), same: true },
		{ left: binding("a", "global"), name: "two global names", right: binding("b", "global"), same: false },
		{ left: binding("a", "closure"), name: "one closure name", right: binding("a", "closure"), same: false },
		{
			left: { kind: "property", name: "a" },
			name: "one property name",
			right: { kind: "property", name: "a" },
			same: false
		},
		{ left: member("a"), name: "a member and a global", right: binding("a", "global"), same: false },
		{
			left: { kind: "unit", unit: "u1" },
			name: "one function literal's unit",
			right: { kind: "unit", unit: "u1" },
			same: false
		}
	] satisfies { left: AccessTarget; name: string; right: AccessTarget; same: boolean }[])(
		"should decide $same for $name",
		({ left, right, same }) => {
			expect.assertions(2);

			expect(sameLocation(left, right)).toBe(same);
			expect(sameLocation(right, left)).toBe(same);
		}
	);
});

describe(locationKey, () => {
	it.each([
		{ left: member("x"), right: member("x") },
		{ left: member("x"), right: member("x", { private: true }) },
		{ left: member("x"), right: member("x", { static: true }) },
		{ left: member("x"), right: member("x", { class: "c2" }) },
		{ left: binding("a", "module", "d1"), right: binding("a", "module", "d1") },
		{ left: binding("a", "module", "d1"), right: binding("a", "global") },
		{ left: binding("a", "global"), right: binding("a", "global") },
		{ left: binding("a", "closure"), right: binding("a", "closure") },
		{ left: binding("a", "global"), right: member("a") }
	] satisfies { left: AccessTarget; right: AccessTarget }[])(
		"should give equal keys exactly to the same location ($left.kind $left.name, $right.kind $right.name)",
		({ left, right }) => {
			expect.assertions(1);

			const leftKey = locationKey(left);

			expect(leftKey !== null && leftKey === locationKey(right)).toBe(sameLocation(left, right));
		}
	);

	it("should give no key to closure bindings, properties and units", () => {
		expect.assertions(1);

		expect([
			locationKey(binding("a", "closure")),
			locationKey({ kind: "property", name: "a" }),
			locationKey({ kind: "unit", unit: "u1" })
		]).toStrictEqual([null, null, null]);
	});
});
