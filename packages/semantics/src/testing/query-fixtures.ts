import type { Assumptions, CallAssumption } from "../index";

/** A NestJS service with injected dependencies, private helpers, a cache and a recursive walk. */
export const QUERY_NEST_SERVICE: string = [
	'import { Injectable, Logger } from "@nestjs/common";',
	'import { OrderRepository } from "./order.repository";',
	"",
	"const CACHE_LIMIT = 100;",
	"let instances = 0;",
	"",
	"@Injectable()",
	"export class OrderService {",
	"\tprivate readonly logger = new Logger(OrderService.name);",
	"\tprivate readonly cache = new Map<string, number>();",
	"\tprivate hits = 0;",
	"",
	"\tconstructor(private readonly repository: OrderRepository) {",
	"\t\tinstances += 1;",
	"\t}",
	"",
	"\tasync findTotal(id: string): Promise<number> {",
	"\t\tconst cached = this.lookup(id);",
	"\t\tif (cached !== undefined) {",
	"\t\t\treturn cached;",
	"\t\t}",
	"",
	"\t\tconst order = await this.repository.findOne(id);",
	"\t\tconst total = this.sum(order.lines);",
	"\t\tthis.remember(id, total);",
	"\t\treturn total;",
	"\t}",
	"",
	"\tget hitCount(): number {",
	"\t\treturn this.hits;",
	"\t}",
	"",
	"\tresetHits(): void {",
	"\t\tthis.hits = 0;",
	"\t}",
	"",
	"\tprivate lookup(id: string): number | undefined {",
	"\t\tconst value = this.cache.get(id);",
	"\t\tif (value !== undefined) {",
	"\t\t\tthis.hits += 1;",
	"\t\t}",
	"\t\treturn value;",
	"\t}",
	"",
	"\tprivate remember(id: string, total: number): void {",
	"\t\tif (this.cache.size >= CACHE_LIMIT) {",
	'\t\t\tthis.logger.warn("cache full");',
	"\t\t\treturn;",
	"\t\t}",
	"\t\tthis.cache.set(id, total);",
	"\t}",
	"",
	"\tprivate sum(lines: { children: unknown[]; price: number }[]): number {",
	"\t\treturn lines.reduce((total, line) => total + line.price + this.sum(line.children as never), 0);",
	"\t}",
	"}"
].join("\n");

/** An Angular component with signals, an injected service, a field arrow handler and lifecycle hooks. */
export const QUERY_ANGULAR_COMPONENT: string = [
	'import { Component, computed, inject, OnInit, signal } from "@angular/core";',
	'import { CartService } from "./cart.service";',
	"",
	'@Component({ selector: "app-cart", template: "" })',
	"export class CartComponent implements OnInit {",
	"\tprivate readonly cartService = inject(CartService);",
	"\treadonly items = signal<number[]>([]);",
	"\treadonly total = computed(() => this.items().reduce((sum, item) => sum + item, 0));",
	"\tlabel = this.describe();",
	"\tselected = 0;",
	"",
	"\tngOnInit(): void {",
	"\t\tthis.cartService.load().subscribe((items) => this.items.set(items));",
	"\t}",
	"",
	"\tonSelect = (index: number): void => {",
	"\t\tthis.selected = index;",
	"\t\tthis.refresh();",
	"\t};",
	"",
	"\tprivate describe(): string {",
	"\t\treturn `cart ${this.selected}`;",
	"\t}",
	"",
	"\tprivate refresh(): void {",
	"\t\tthis.label = this.describe();",
	"\t}",
	"}"
].join("\n");

const ANGULAR_CALLS: ReadonlyMap<string, CallAssumption> = new Map([
	["computed", "signal-factory"],
	["inject", "factory"],
	["signal", "signal-factory"]
]);

/** Treats calls of plain `signal`, `computed` and `inject` names (generic or not) as Angular describes them. */
export const QUERY_ANGULAR_ASSUMPTIONS: Assumptions = {
	assumeCall(call) {
		const callee = call.callee.type === "TSInstantiationExpression" ? call.callee.expression : call.callee;
		return callee.type === "Identifier" ? (ANGULAR_CALLS.get(callee.name) ?? null) : null;
	}
};
