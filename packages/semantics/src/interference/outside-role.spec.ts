import { describe, expect, it } from "vitest";

import type { AnalyzeOptions } from "../index";
import { analyzeSource } from "../testing/analyze-source";
import { QUERY_ANGULAR_ASSUMPTIONS } from "../testing/query-fixtures";
import { outsideRole } from "./outside-role";

function rolesOf(code: string, label: string, options: AnalyzeOptions = {}): string[] {
	const { facts, model, unit } = analyzeSource(code, options);
	const described = facts(label);
	return unit(label).facts.map((fact, index) => `${described[index] ?? ""} => ${String(outsideRole(model, fact))}`);
}

describe(outsideRole, () => {
	it("should classify unknown facts as opaque or effect by reason", () => {
		expect.assertions(1);

		const code = [
			'import { log, name } from "./lib";',
			"class A {",
			"\tm(): void {",
			"\t\tlog(this);",
			"\t\tthis[name];",
			"\t\tnew Map();",
			"\t}",
			"}"
		].join("\n");

		expect(rolesOf(code, "A.m")).toStrictEqual([
			"call import log => null",
			"unknown call: log(this) => effect",
			"unknown receiver-escape: this => opaque",
			"read import name => null",
			"unknown dynamic-member: this[name] => opaque",
			"read global Map (mutable) => external",
			"unknown construct: new Map() => effect"
		]);
	});

	it("should classify binding accesses by scope and mutability", () => {
		expect.assertions(1);

		const code = [
			"let counter = 0;",
			"const LIMIT = 1;",
			"export function bump(): void { counter += LIMIT; }",
			"function outer(step: number) {",
			"\tlet total = 0;",
			"\treturn () => { total += step; };",
			"}"
		].join("\n");

		expect([...rolesOf(code, "bump"), ...rolesOf(code, "outer > arrow (line 6)")]).toStrictEqual([
			"read module counter (mutable) => external",
			"write module counter (mutable) => null",
			"read module LIMIT => null",
			"read closure total (mutable) => external",
			"write closure total (mutable) => effect",
			"read closure step (mutable) => external"
		]);
	});

	it("should classify property accesses as external reads or effects", () => {
		expect.assertions(1);

		const code = [
			"class A {",
			"\tconstructor(private readonly api: { n: number }) {}",
			"\tm(): void {",
			"\t\tthis.api.n = this.api.n;",
			"\t}",
			"}"
		].join("\n");

		expect(rolesOf(code, "A.m")).toStrictEqual([
			"read A.api => null",
			"write property n => effect",
			"read A.api => null",
			"read property n => external"
		]);
	});

	it("should leave member calls to the unknown facts extraction adds, except assumed callables", () => {
		expect.assertions(1);

		const code = [
			'import { make, signal } from "./lib";',
			"abstract class A {",
			"\tf = () => 1;",
			"\tvalue = make();",
			"\tcount = signal(0);",
			"\tget getter() { return () => 1; }",
			"\tconstructor(private readonly p: () => number) {}",
			"\tabstract shape(): number;",
			"\tm(): void {",
			"\t\tthis.f();",
			"\t\tthis.value();",
			"\t\tthis.count();",
			"\t\tthis.getter();",
			"\t\tthis.p();",
			"\t\tthis.shape();",
			"\t\tthis.m();",
			"\t\tthis.missing();",
			"\t}",
			"}"
		].join("\n");
		const options = { assumptions: QUERY_ANGULAR_ASSUMPTIONS };

		expect(rolesOf(code, "A.m", options)).toStrictEqual([
			"call A.f => null",
			"call A.value => null",
			"unknown call: this.value => effect",
			"call A.count => external",
			"call A.getter => null",
			"unknown call: this.getter => effect",
			"call A.p => null",
			"unknown call: this.p => effect",
			"call A.shape => null",
			"unknown call: this.shape => effect",
			"call A.m => null",
			"call A.missing (undeclared) => null",
			"unknown call: this.missing => effect"
		]);
	});

	it("should make any access to an undeclared member opaque once the class has a superclass", () => {
		expect.assertions(1);

		const code = [
			"class Base {}",
			"class A extends Base {",
			"\tm(): void {",
			"\t\tthis.fromBase = this.other;",
			"\t\tthis.inherited();",
			"\t}",
			"}"
		].join("\n");

		expect(rolesOf(code, "A.m")).toStrictEqual([
			"write A.fromBase (undeclared) => opaque",
			"read A.other (undeclared) => opaque",
			"call A.inherited (undeclared) => opaque",
			"unknown call: this.inherited => effect"
		]);
	});

	it("should classify a call of a module assumed callable as an external read", () => {
		expect.assertions(1);

		const code = [
			'import { signal } from "@angular/core";',
			"const count = signal(0);",
			"function f() { return count(); }"
		].join("\n");

		expect(rolesOf(code, "f", { assumptions: QUERY_ANGULAR_ASSUMPTIONS })).toStrictEqual([
			"call module count => external"
		]);
	});

	it("should leave calls of a function literal's unit and constructions of a module class out", () => {
		expect.assertions(1);

		const code = ["class B {}", "function f() {", "\tconst g = () => 1;", "\tg();", "\treturn new B();", "}"].join(
			"\n"
		);

		expect(rolesOf(code, "f")).toStrictEqual([
			"function bound-locally: f > arrow (line 3) => null",
			"call unit f > arrow (line 3) => null",
			"construct module B => null"
		]);
	});

	it("should leave declared member reads and writes and function facts out", () => {
		expect.assertions(1);

		const code = [
			"class A {",
			"\tx = 1;",
			"\tm(): void {",
			"\t\tthis.x = this.x;",
			"\t\tconst f = () => 1;",
			"\t}",
			"}"
		].join("\n");

		expect(rolesOf(code, "A.m")).toStrictEqual([
			"write A.x => null",
			"read A.x => null",
			"function bound-locally: A.m > arrow (line 5) => null"
		]);
	});
});
