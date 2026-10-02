import { describe, expect, it } from "vitest";

import { importDeclaration } from "../testing/import-declaration";
import { namespaceImport } from "../testing/namespace-import";
import { specifier } from "../testing/specifier";
import type { Binding } from "./binding-from-exported-name";
import { collectImport } from "./collect-import";

describe(collectImport, () => {
	it("binds Nest HTTP and Controller specifiers, including aliases", () => {
		expect.assertions(1);

		const bindings = new Map<string, Binding>();

		collectImport(
			importDeclaration("@nestjs/common", [specifier("Controller", "HttpController"), specifier("Get", "Read")]),
			bindings
		);

		expect(Object.fromEntries(bindings)).toStrictEqual({
			HttpController: { type: "controller" },
			Read: { method: "GET", type: "method" }
		});
	});

	it("binds a namespace import", () => {
		expect.assertions(1);

		const bindings = new Map<string, Binding>();

		collectImport(namespaceImport("@nestjs/common", "nest"), bindings);

		expect(Object.fromEntries(bindings)).toStrictEqual({
			nest: { type: "namespace" }
		});
	});

	it("ignores a different module", () => {
		expect.assertions(1);

		const bindings = new Map<string, Binding>();

		collectImport(importDeclaration("@nestjs/core", [specifier("Get", "Get")]), bindings);

		expect(bindings.size).toBe(0);
	});

	it("ignores a type-only import", () => {
		expect.assertions(1);

		const bindings = new Map<string, Binding>();

		collectImport(importDeclaration("@nestjs/common", [specifier("Get", "Get")], "type"), bindings);

		expect(bindings.size).toBe(0);
	});
});
