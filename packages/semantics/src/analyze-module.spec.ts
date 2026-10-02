import { describe, expect, it } from "vitest";

import { analyzeModule } from "./analyze-module";
import { NO_ASSUMPTIONS } from "./assumptions/no-assumptions";
import { analyzeSource } from "./testing/analyze-source";
import { ANGULAR_ASSUMPTIONS } from "./testing/extraction-angular-assumptions";
import { declarationOf, describeDeclaration } from "./testing/extraction-lookup";

const COMPONENT = `import { Component, computed, effect, inject, signal as makeSignal } from "@angular/core";
import { CartStore } from "./cart.store";

const ratio = makeSignal(2);

@Component({ selector: "app-cart", template: "" })
export class CartComponent {
	private readonly store = inject(CartStore);
	readonly count = makeSignal(0);
	readonly items = makeSignal<number[]>([]);
	readonly total = computed(() => this.items().length * ratio());
	readonly snapshot = this.store.load();

	constructor() {
		effect(() => console.log(this.count()));
	}

	add(): void {
		this.count.update((n) => n + 1);
		this.total();
	}
}
`;

const SERVICE = `import { Injectable } from "@nestjs/common";
import type { Repository } from "typeorm";

let cache: Map<string, Order> | null = null;

function keyOf(id: string): string {
	return "order:" + id;
}

@Injectable()
export class OrderService {
	constructor(
		private readonly orders: Repository<Order>,
		private readonly logger: Logger
	) {}

	async find(id: string): Promise<Order | undefined> {
		const key = keyOf(id);
		if (cache?.has(key)) {
			return cache.get(key);
		}

		const order = await this.orders.findOne({ where: { id } });
		cache ??= new Map();
		cache.set(key, order);
		return order;
	}

	async clear(): Promise<void> {
		cache = null;
		this.logger.log("cleared");
	}
}
`;

describe(analyzeModule, () => {
	it("should record the facts of a field initializer", () => {
		expect.assertions(1);

		const { facts } = analyzeSource(
			"let total = 0;\nclass Cart {\n\tcount = total + this.base();\n\tbase() { return 1; }\n}"
		);

		expect(facts("Cart.count (initializer)")).toStrictEqual([
			"read module total",
			"call Cart.base",
			"write Cart.count"
		]);
	});

	it("should give every declaration and unit a stable id for the same source", () => {
		expect.assertions(2);

		const first = analyzeSource(SERVICE).model;
		const second = analyzeSource(SERVICE).model;

		expect([...second.declarations.keys()]).toStrictEqual([...first.declarations.keys()]);
		expect([...second.units.values()].map((unit) => `${unit.id} ${unit.label}`)).toStrictEqual(
			[...first.units.values()].map((unit) => `${unit.id} ${unit.label}`)
		);
	});

	describe("assumptions", () => {
		it("should default to NO_ASSUMPTIONS, which describes no call", () => {
			expect.assertions(3);

			const { facts, model } = analyzeSource(COMPONENT);

			expect(NO_ASSUMPTIONS.assumeCall(model.units.get(model.moduleUnit)?.node as never)).toBeNull();
			expect(describeDeclaration(declarationOf(model, "CartComponent.count"))).toBe(
				'field CartComponent.count ["count"] public = other'
			);
			expect(facts("CartComponent.store (initializer)")).toStrictEqual([
				"call import inject",
				"unknown call: inject(CartStore)",
				"read import CartStore",
				"write CartComponent.store"
			]);
		});

		it("should classify field and variable values initialized by signal factories as assumed-callable", () => {
			expect.assertions(1);

			const { model } = analyzeSource(COMPONENT, { assumptions: ANGULAR_ASSUMPTIONS });

			expect(
				[
					"ratio",
					"CartComponent.store",
					"CartComponent.count",
					"CartComponent.items",
					"CartComponent.total",
					"CartComponent.snapshot"
				].map((name) => describeDeclaration(declarationOf(model, name)))
			).toStrictEqual([
				"variable const ratio = assumed-callable",
				'field CartComponent.store ["store"] private = other',
				'field CartComponent.count ["count"] public = assumed-callable',
				'field CartComponent.items ["items"] public = assumed-callable',
				'field CartComponent.total ["total"] public = assumed-callable',
				'field CartComponent.snapshot ["snapshot"] public = other'
			]);
		});

		it("should report no uncertainty for assumed calls, and still walk their arguments", () => {
			expect.assertions(3);

			const { facts } = analyzeSource(COMPONENT, { assumptions: ANGULAR_ASSUMPTIONS });

			expect(facts("module")).toStrictEqual([]);
			expect(facts("CartComponent.store (initializer)")).toStrictEqual([
				"read import CartStore",
				"write CartComponent.store"
			]);
			expect(facts("CartComponent.total (initializer)")).toStrictEqual([
				"function passed-to-assumed: CartComponent.total (initializer) > arrow (line 11)",
				"write CartComponent.total"
			]);
		});

		it("should still walk an assumed call's callee unless it is a plain name", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				'import { signal } from "@angular/core";\nclass Cart {\n\tcount = (this.pick() ? signal : signal)(0);\n}',
				{
					assumptions: {
						assumeCall: (call) => (call.arguments.length === 1 ? "signal-factory" : null)
					}
				}
			);

			expect(facts("Cart.count (initializer)")).toStrictEqual([
				"call Cart.pick (undeclared)",
				"unknown call: this.pick",
				"read import signal",
				"read import signal",
				"write Cart.count"
			]);
		});

		it("should not assume anything about a non-Angular call with the same name", () => {
			expect.assertions(1);

			const { model } = analyzeSource('import { signal } from "other";\nclass Cart {\n\tcount = signal(0);\n}', {
				assumptions: ANGULAR_ASSUMPTIONS
			});

			expect(describeDeclaration(declarationOf(model, "Cart.count"))).toBe(
				'field Cart.count ["count"] public = other'
			);
		});
	});

	describe("an Angular component", () => {
		it("should run a computed's function only later, reading signals without uncertainty", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(COMPONENT, { assumptions: ANGULAR_ASSUMPTIONS });

			expect(facts("CartComponent.total (initializer) > arrow (line 11)")).toStrictEqual([
				"call CartComponent.items",
				"read property length",
				"call module ratio"
			]);
		});

		it("should treat an effect it knows nothing about as unknown code that may run the arrow right away", () => {
			expect.assertions(2);

			const { facts } = analyzeSource(COMPONENT, { assumptions: ANGULAR_ASSUMPTIONS });

			expect(facts("CartComponent.constructor")).toStrictEqual([
				"call import effect",
				"unknown call: effect(() => console.log(this.count()))",
				"function passed-to-unknown: CartComponent.constructor > arrow (line 15)"
			]);
			expect(facts("CartComponent.constructor > arrow (line 15)")).toStrictEqual([
				"read global console (mutable)",
				"call property log",
				"unknown call: console.log",
				"call CartComponent.count"
			]);
		});

		it("should resolve the class decorator to its import in the definition unit", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(COMPONENT, { assumptions: ANGULAR_ASSUMPTIONS });

			expect(facts("CartComponent (definition)")).toStrictEqual([
				"call import Component",
				'unknown call: Component({ selector: "app-cart", template: "" })',
				'unknown call: @Component({ selector: "app-cart", template: "" })',
				'unknown receiver-escape: @Component({ selector: "app-cart", template: "" })'
			]);
		});

		it("should report calls on a signal's own methods as unknown, and a direct signal call as followable", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(COMPONENT, { assumptions: ANGULAR_ASSUMPTIONS });

			expect(facts("CartComponent.add")).toStrictEqual([
				"read CartComponent.count",
				"call property update",
				"unknown call: this.count.update",
				"function passed-to-unknown: CartComponent.add > arrow (line 19)",
				"call CartComponent.total"
			]);
		});
	});

	describe("a NestJS service", () => {
		it("should declare the constructor's parameter properties and write them on construction", () => {
			expect.assertions(2);

			const { facts, model } = analyzeSource(SERVICE);

			expect(
				[...model.declarations.values()]
					.filter((declaration) => "class" in declaration)
					.map((declaration) => describeDeclaration(declaration))
			).toStrictEqual([
				'constructor OrderService.constructor ["constructor"] public',
				'parameter-property OrderService.orders ["orders"] private = other',
				'parameter-property OrderService.logger ["logger"] private = other',
				'method OrderService.find ["find"] public',
				'method OrderService.clear ["clear"] public'
			]);
			expect(facts("OrderService.constructor")).toStrictEqual([
				"write OrderService.orders",
				"write OrderService.logger"
			]);
		});

		it("should declare the module cache as a mutable let and the helper as a followable function", () => {
			expect.assertions(3);

			const { model } = analyzeSource(SERVICE);

			expect(describeDeclaration(declarationOf(model, "cache"))).toBe("variable let cache = other (reassigned)");
			expect(describeDeclaration(declarationOf(model, "keyOf"))).toBe("function keyOf");
			expect(describeDeclaration(declarationOf(model, "Repository"))).toBe(
				'import Repository = Repository from "typeorm" (type)'
			);
		});

		it("should follow the helper, read and write the cache, and suspend on the repository call (in no specified order)", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(SERVICE);

			expect(facts("OrderService.find").toSorted((left, right) => left.localeCompare(right))).toStrictEqual([
				"call module keyOf",
				"call property findOne",
				"call property get",
				"call property has",
				"call property set",
				"read global Map (mutable)",
				"read module cache (mutable)",
				"read module cache (mutable)",
				"read module cache (mutable)",
				"read module cache (mutable)",
				"read OrderService.orders",
				"unknown call: cache?.has",
				"unknown call: cache.get",
				"unknown call: cache.set",
				"unknown call: this.orders.findOne",
				"unknown construct: new Map()",
				"unknown suspension: await this.orders.findOne({ where: { id } })",
				"write module cache (mutable)"
			]);
		});

		it("should write the cache and call the logger in clear", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(SERVICE);

			expect(facts("OrderService.clear")).toStrictEqual([
				"write module cache (mutable)",
				"read OrderService.logger",
				"call property log",
				"unknown call: this.logger.log"
			]);
		});
	});
});
