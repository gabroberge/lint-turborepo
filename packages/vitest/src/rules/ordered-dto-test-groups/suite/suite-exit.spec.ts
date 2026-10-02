import { describe, expect, it } from "vitest";

import { arrowFunction } from "../testing/arrow-function";
import { describeCall } from "../testing/describe-call";
import { itCall } from "../testing/it-call";
import type { Exit } from "../testing/record-exits";
import { recordExits } from "../testing/record-exits";
import { createSuiteExit } from "./suite-exit";

describe(createSuiteExit, () => {
	describe("when the outermost describe callback exits", () => {
		it("notifies with the call and the callback", () => {
			expect.assertions(1);

			const body = arrowFunction();
			const call = describeCall(body);
			const exits = recordExits(call, body);

			expect(exits).toStrictEqual([{ call, callback: body }]);
		});
	});

	describe("when a nested describe exits", () => {
		it("does not notify", () => {
			expect.assertions(1);

			const outer = arrowFunction();
			const inner = arrowFunction();
			const exits: Exit[] = [];
			const walk = createSuiteExit((call, callback) => {
				exits.push({ call, callback });
			});

			walk.note(describeCall(outer));
			walk.enterFunction(outer);
			walk.note(describeCall(inner));
			walk.enterFunction(inner);
			walk.exitFunction(inner);

			expect(exits).toStrictEqual([]);
		});
	});

	describe("when the nested describe has exited and the suite then exits", () => {
		it("notifies only for the suite", () => {
			expect.assertions(1);

			const outer = arrowFunction();
			const inner = arrowFunction();
			const suiteCall = describeCall(outer);
			const exits: Exit[] = [];
			const walk = createSuiteExit((call, callback) => {
				exits.push({ call, callback });
			});

			walk.note(suiteCall);
			walk.enterFunction(outer);
			walk.note(describeCall(inner));
			walk.enterFunction(inner);
			walk.exitFunction(inner);
			walk.exitFunction(outer);

			expect(exits).toStrictEqual([{ call: suiteCall, callback: outer }]);
		});
	});

	describe("when a later top-level describe exits", () => {
		it("notifies for that suite", () => {
			expect.assertions(1);

			const first = arrowFunction();
			const second = arrowFunction();
			const firstCall = describeCall(first);
			const secondCall = describeCall(second);
			const exits: Exit[] = [];
			const walk = createSuiteExit((call, callback) => {
				exits.push({ call, callback });
			});

			walk.note(firstCall);
			walk.enterFunction(first);
			walk.exitFunction(first);
			walk.note(secondCall);
			walk.enterFunction(second);
			walk.exitFunction(second);

			expect(exits).toStrictEqual([
				{ call: firstCall, callback: first },
				{ call: secondCall, callback: second }
			]);
		});
	});

	describe("when a function is not a describe callback", () => {
		it("does not notify", () => {
			expect.assertions(1);

			const helper = arrowFunction();
			const exits = recordExits(itCall(helper), helper);

			expect(exits).toStrictEqual([]);
		});
	});
});
