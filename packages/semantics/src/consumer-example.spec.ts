import { describe, expect, it } from "vitest";

import { parseModule } from "./testing/parse-module";

import type { ModuleModel, UnitId } from "./index";
import { analyzeModule, cyclicComponents, declarationDependencies, decisionPoints, reachedFacts } from "./index";

/**
 * A standalone consumer: a small structural report on one module. It shows
 * how to combine the model and its queries. Interpreting the results (which
 * numbers matter, what to flag) is the consumer's job, not the engine's.
 */
interface MethodReport {
	/** Branching constructs written in the method itself. */
	decisions: number;
	/** Calls into code the model cannot see, in the method or anything it calls. */
	uncertainCalls: number;
	/** Module-level mutable bindings the method or its callees may write. */
	writesSharedState: string[];
}

interface ModuleReport {
	cycles: string[][];
	methods: Record<string, MethodReport>;
}

function methodReport(model: ModuleModel, unit: UnitId): MethodReport {
	const reached = reachedFacts(model, unit);
	const writes = new Set<string>();
	let uncertainCalls = 0;
	for (const { fact } of reached) {
		if (fact.kind === "unknown" && fact.reason === "call") {
			uncertainCalls += 1;
		} else if (
			fact.kind === "access" &&
			fact.mode === "write" &&
			fact.target.kind === "binding" &&
			fact.target.scope === "module"
		) {
			writes.add(fact.target.name);
		}
	}

	return { decisions: decisionPoints(model, unit).length, uncertainCalls, writesSharedState: [...writes] };
}

function moduleReport(model: ModuleModel): ModuleReport {
	const dependencies = declarationDependencies(model);
	const cycles = cyclicComponents([...model.declarations.keys()], (id) =>
		dependencies.filter((dependency) => dependency.from === id).map((dependency) => dependency.to)
	).map((component) => component.map((id) => nameOf(model, id)));
	const methods: Record<string, MethodReport> = {};
	for (const unit of model.units.values()) {
		if (unit.kind === "method") {
			methods[unit.label] = methodReport(model, unit.id);
		}
	}

	return { cycles, methods };
}

function nameOf(model: ModuleModel, id: string | null): string {
	return id === null ? "(module)" : (model.declarations.get(id)?.qualifiedName ?? id);
}

const ordersService = `
import { Injectable } from "@nestjs/common";

let lastSync = 0;

function isStale(now: number): boolean {
	return now - lastSync > 1000 || needsSync();
}

function needsSync(): boolean {
	return isStale(Date.now()) && lastSync === 0;
}

@Injectable()
export class OrdersService {
	constructor(private readonly repository: OrderRepository) {}

	async sync(now: number) {
		if (!isStale(now)) {
			return;
		}

		await this.repository.refresh();
		lastSync = now;
	}

	total(orders: Order[]) {
		return orders.reduce((sum, order) => sum + (order.discount ?? 0), 0);
	}
}
`;

describe("a consumer report", () => {
	it("finds mutually dependent module functions", () => {
		expect.assertions(1);

		const report = moduleReport(analyzeModule(parseModule(ordersService)));

		expect(report.cycles).toStrictEqual([["isStale", "needsSync"]]);
	});

	it("summarizes each method", () => {
		expect.assertions(1);

		const report = moduleReport(analyzeModule(parseModule(ordersService)));

		expect(report.methods).toStrictEqual({
			"OrdersService.sync": { decisions: 1, uncertainCalls: 2, writesSharedState: ["lastSync"] },
			"OrdersService.total": { decisions: 0, uncertainCalls: 1, writesSharedState: [] }
		});
	});
});
