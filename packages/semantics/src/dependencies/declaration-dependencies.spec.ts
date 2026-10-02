import { describe, expect, it } from "vitest";

import type { DeclarationDependency, ModuleModel } from "../index";
import { cyclicComponents, stronglyConnectedComponents } from "../index";
import { analyzeSource } from "../testing/analyze-source";
import { queryLabel } from "../testing/query-describe-edge";
import { declarationDependencies } from "./declaration-dependencies";

function dependenciesOf(code: string): string[] {
	const { model } = analyzeSource(code);
	return declarationDependencies(model).map((dependency) => describeDependency(model, dependency));
}

function describeDependency(model: ModuleModel, dependency: DeclarationDependency): string {
	return `${nameOf(model, dependency.from)} -${dependency.mode}-> ${nameOf(model, dependency.to)} [${queryLabel(model, dependency.unit)}]`;
}

function nameOf(model: ModuleModel, declaration: string | null): string {
	return declaration === null ? "(module)" : (model.declarations.get(declaration)?.qualifiedName ?? declaration);
}

describe(declarationDependencies, () => {
	it("should attribute module code to no declaration", () => {
		expect.assertions(1);

		expect(dependenciesOf("function run() { return 1; }\nrun();")).toStrictEqual(["(module) -call-> run [module]"]);
	});

	it("should attribute a nested arrow to the declaration owning it", () => {
		expect.assertions(1);

		const code = ["class Cart {", "\tx = 1;", "\tload() {", "\t\treturn [1].map(() => this.x);", "\t}", "}"].join(
			"\n"
		);

		expect(dependenciesOf(code)).toStrictEqual(["Cart.load -read-> Cart.x [Cart.load > arrow (line 4)]"]);
	});

	it("should leave out a field initializer defining its own field but keep other self references", () => {
		expect.assertions(1);

		const code = [
			"class Cart {",
			"\tx = 1;",
			"\ty = this.y ?? 2;",
			"\tbump(): void { this.bump = () => undefined; }",
			"}"
		].join("\n");

		expect(dependenciesOf(code)).toStrictEqual([
			"Cart.y -read-> Cart.y [Cart.y (initializer)]",
			"Cart.bump -write-> Cart.bump [Cart.bump]"
		]);
	});

	it("should keep definition writes of other declarations", () => {
		expect.assertions(1);

		const code = [
			"class Cart {",
			"\tconstructor(private readonly api: number) {}",
			"\ty = (this.x = 2);",
			"\tx = 0;",
			"}"
		].join("\n");

		expect(dependenciesOf(code)).toStrictEqual([
			"Cart.constructor -write-> Cart.api [Cart.constructor]",
			"Cart.y -write-> Cart.x [Cart.y (initializer)]"
		]);
	});

	it("should target imports but not globals, closures, properties or undeclared members", () => {
		expect.assertions(1);

		const code = [
			'import { api } from "./lib";',
			"class Cart {",
			"\tload(step: number) {",
			'\t\treturn api.get(step) + parseInt("1") + this.missing + (() => step)();',
			"\t}",
			"}"
		].join("\n");

		expect(dependenciesOf(code)).toStrictEqual(["Cart.load -read-> api [Cart.load]"]);
	});

	it("should report a type-only import as no dependency", () => {
		expect.assertions(1);

		expect(
			dependenciesOf(
				'import type { Item } from "./item";\nexport function first(items: Item[]) { return items[0]; }'
			)
		).toStrictEqual([]);
	});

	it("should carry the fact and the unit of each dependency", () => {
		expect.assertions(2);

		const { model, unit } = analyzeSource("function run() { return 1; }\nrun();");
		const [dependency] = declarationDependencies(model);

		expect(dependency?.fact).toBe(unit("module").facts.find((fact) => fact.kind === "access"));
		expect(dependency?.unit).toBe(model.moduleUnit);
	});

	describe("when module functions call each other", () => {
		it("should expose a declaration cycle to the graph algorithms", () => {
			expect.assertions(2);

			const code = [
				"export function even(n: number): boolean { return n === 0 || odd(n - 1); }",
				"function odd(n: number): boolean { return n !== 0 && even(n - 1); }",
				"function main() { return even(2); }"
			].join("\n");
			const { model } = analyzeSource(code);
			const dependencies = declarationDependencies(model);
			const nodes = [...model.declarations.keys()];
			const successors = (declaration: string): string[] =>
				dependencies.filter((dependency) => dependency.from === declaration).map((dependency) => dependency.to);
			const names = (groups: string[][]): string[][] =>
				groups.map((group) => group.map((id) => nameOf(model, id)));

			expect(names(cyclicComponents(nodes, successors))).toStrictEqual([["even", "odd"]]);
			expect(names(stronglyConnectedComponents(nodes, successors))).toStrictEqual([["even", "odd"], ["main"]]);
		});
	});
});
