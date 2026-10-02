import { describe, expect, it } from "vitest";

import type { AccessTarget } from "../index";
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
		{ left: member("a"), name: "a member and a global", right: binding("a", "global"), same: false }
	] satisfies { left: AccessTarget; name: string; right: AccessTarget; same: boolean }[])(
		"should decide $same for $name",
		({ left, right, same }) => {
			expect.assertions(2);

			expect(sameLocation(left, right)).toBe(same);
			expect(sameLocation(right, left)).toBe(same);
		}
	);
});
