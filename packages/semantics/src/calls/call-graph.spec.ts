import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import { queryDescribeEdge } from "../testing/query-describe-edge";
import { QUERY_ANGULAR_ASSUMPTIONS, QUERY_ANGULAR_COMPONENT, QUERY_NEST_SERVICE } from "../testing/query-fixtures";
import { callGraph } from "./call-graph";
import { recursiveUnitGroups } from "./recursive-unit-groups";

describe(callGraph, () => {
	it("should list every unit's edges, unit by unit", () => {
		expect.assertions(1);

		const code = ["function a() { return b(); }", "function b() { return 1; }", "a();"].join("\n");
		const { model } = analyzeSource(code);

		expect(callGraph(model).map((edge) => queryDescribeEdge(model, edge))).toStrictEqual([
			"module -defines-> a",
			"module -defines-> b",
			"module -calls-> a",
			"a -calls-> b"
		]);
	});

	describe("when analyzing a NestJS service", () => {
		it("should connect the public method to its private helpers and the recursive walk", () => {
			expect.assertions(2);

			const { model } = analyzeSource(QUERY_NEST_SERVICE);

			expect(callGraph(model).map((edge) => queryDescribeEdge(model, edge))).toStrictEqual([
				"module -evaluates-> OrderService (definition)",
				"OrderService.findTotal -calls-> OrderService.lookup",
				"OrderService.findTotal -calls-> OrderService.sum",
				"OrderService.findTotal -calls-> OrderService.remember",
				"OrderService.sum -may-run-> OrderService.sum > arrow (line 54)",
				"OrderService.sum > arrow (line 54) -calls-> OrderService.sum"
			]);
			expect(
				recursiveUnitGroups(model).map((group) => group.map((unit) => model.units.get(unit)?.label))
			).toStrictEqual([["OrderService.sum", "OrderService.sum > arrow (line 54)"]]);
		});
	});

	describe("when analyzing an Angular component", () => {
		it("should run the computed callback eagerly without assumptions", () => {
			expect.assertions(1);

			const { model } = analyzeSource(QUERY_ANGULAR_COMPONENT);

			expect(callGraph(model).map((edge) => queryDescribeEdge(model, edge))).toStrictEqual([
				"module -evaluates-> CartComponent (definition)",
				"CartComponent.total (initializer) -may-run-> CartComponent.total (initializer) > arrow (line 8)",
				"CartComponent.total (initializer) > arrow (line 8) -may-run-> CartComponent.total (initializer) > arrow (line 8) > arrow (line 8)",
				"CartComponent.label (initializer) -calls-> CartComponent.describe",
				"CartComponent.ngOnInit -may-run-> CartComponent.ngOnInit > arrow (line 13)",
				"CartComponent.onSelect (initializer) -defines-> CartComponent.onSelect (initializer) > arrow (line 16)",
				"CartComponent.onSelect (initializer) > arrow (line 16) -calls-> CartComponent.refresh",
				"CartComponent.refresh -calls-> CartComponent.describe"
			]);
		});

		it("should only define the computed callback under Angular assumptions", () => {
			expect.assertions(1);

			const { model } = analyzeSource(QUERY_ANGULAR_COMPONENT, { assumptions: QUERY_ANGULAR_ASSUMPTIONS });

			expect(
				callGraph(model)
					.map((edge) => queryDescribeEdge(model, edge))
					.filter((edge) => edge.startsWith("CartComponent.total"))
			).toStrictEqual([
				"CartComponent.total (initializer) -defines-> CartComponent.total (initializer) > arrow (line 8)",
				"CartComponent.total (initializer) > arrow (line 8) -may-run-> CartComponent.total (initializer) > arrow (line 8) > arrow (line 8)"
			]);
		});
	});
});
