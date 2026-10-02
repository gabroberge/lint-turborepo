import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { lines } from "../../testing/lines";
import { noArrangeInTestRule } from "./no-arrange-in-test";

describe("no-arrange-in-test", () => {
	const ruleCases = {
		invalid: [
			{
				code: lines(
					'import { describe, expect, it } from "vitest";',
					"",
					"describe(DeleteAccountHandler, () => {",
					'\tit("throws AccountNotFoundError when no account is deleted", async () => {',
					"\t\texpect.assertions(1);",
					"\t\trepository.delete.mockResolvedValue(null);",
					"\t\tawait expect(underTest.execute(new DeleteAccountCommand(AccountId.from(999)))).rejects.toBeInstanceOf(",
					"\t\t\tAccountNotFoundError",
					"\t\t);",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "mockResolvedValue inside it (delete-handler shape)"
			},
			{
				code: lines(
					'import { describe, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("rejects", async () => {',
					'\t\trepository.create.mockRejectedValue(new Error("boom"));',
					"\t\tawait underTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "mockRejectedValue inside it"
			},
			{
				code: lines(
					'import { describe, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("returns", () => {',
					"\t\trepository.exists.mockReturnValue(true);",
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "mockReturnValue inside it"
			},
			{
				code: lines(
					'import { describe, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("implements", () => {',
					"\t\trepository.search.mockImplementation(() => []);",
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "mockImplementation inside it"
			},
			{
				code: lines(
					'import { describe, it, vi } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("spies with return", () => {',
					'\t\tvi.spyOn(service, "run").mockReturnValue(42);',
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "vi.spyOn chained with mockReturnValue inside it"
			},
			{
				code: lines(
					"describe(Handler, () => {",
					'\tit("spies with return", () => {',
					'\t\tjest.spyOn(service, "run").mockReturnValue(42);',
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "jest.spyOn chained with mockReturnValue inside it"
			},
			{
				code: lines(
					'import { describe, it, vi } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("replaces a method", () => {',
					"\t\tservice.run = vi.fn().mockReturnValue(1);",
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "assignment installing a mock before the act"
			},
			{
				code: lines(
					'import { describe, expect, it, vi } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("uses a mock arg", () => {',
					"\t\tconst onDone = vi.fn();",
					"\t\tunderTest.execute(onDone);",
					"\t\texpect(onDone).toHaveBeenCalled();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "vi.fn variable initializer inside it"
			},
			{
				code: lines(
					'import { describe, test } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\ttest("overrides mock", () => {',
					"\t\trepository.findById.mockResolvedValue(null);",
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "same pattern inside test()"
			},
			{
				code: lines(
					'import { describe, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit.only("focused failure", () => {',
					"\t\trepository.update.mockResolvedValue(null);",
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "same pattern inside it.only"
			},
			{
				code: lines(
					'import { describe, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit.each([null, undefined])("missing %s", (value) => {',
					"\t\trepository.findById.mockResolvedValue(value);",
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "same pattern inside it.each callback"
			},
			{
				code: lines(
					'import { describe, it, vi } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("sets up a spy", () => {',
					'\t\tvi.spyOn(service, "run");',
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "bare spyOn expression statement is arrange"
			},
			{
				code: lines(
					'import { describe, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("overrides the mock", async () => {',
					"\t\tawait repository.delete.mockResolvedValue(null);",
					"\t\tawait underTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "awaited mockResolvedValue inside it"
			},
			{
				code: lines(
					'import { describe, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit.fails("expected failure", () => {',
					"\t\trepository.delete.mockResolvedValue(null);",
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "mock setup inside it.fails"
			},
			{
				code: lines(
					'import { describe, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("clears then acts", () => {',
					"\t\trepository.create.mockClear();",
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "mockClear inside it is arrange"
			},
			{
				code: lines(
					'import { describe, expect, it, vi } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("configures the spy", () => {',
					'\t\tconst run = vi.spyOn(service, "run").mockReturnValue(42);',
					"\t\tunderTest.execute();",
					"\t\texpect(run).toHaveBeenCalled();",
					"\t});",
					"});"
				),
				errors: [{ messageId: "arrangeInTest" }],
				name: "spyOn chained with mockReturnValue as a variable initializer"
			}
		],
		valid: [
			{
				code: lines(
					'import { beforeEach, describe, expect, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					"\tbeforeEach(() => {",
					"\t\trepository.delete.mockResolvedValue(createAccount());",
					"\t});",
					"",
					'\tit("calls the repository", async () => {',
					"\t\texpect.assertions(1);",
					"\t\tawait underTest.execute(new DeleteAccountCommand(AccountId.from(1)));",
					"\t\texpect(repository.delete).toHaveBeenCalledExactlyOnceWith(AccountId.from(1));",
					"\t});",
					"});"
				),
				name: "mockResolvedValue inside beforeEach"
			},
			{
				code: lines(
					'import { describe, expect, it } from "vitest";',
					"",
					"describe(Optional, () => {",
					'\tit("reports presence", () => {',
					"\t\texpect.assertions(2);",
					"\t\texpect(Optional.ofNullable(null).isEmpty()).toBe(true);",
					'\t\texpect(Optional.ofNullable("Lyon").isPresent()).toBe(true);',
					"\t});",
					"});"
				),
				name: "act plus multiple expects"
			},
			{
				code: lines(
					'import { describe, expect, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("asserts count", () => {',
					"\t\texpect.assertions(1);",
					"\t\texpect(true).toBe(true);",
					"\t});",
					"});"
				),
				name: "expect.assertions is not arrange"
			},
			{
				code: lines(
					'import { describe, expect, it } from "vitest";',
					"",
					"describe(CreateAccountHandler, () => {",
					'\tit("calls the repository", async () => {',
					"\t\texpect.assertions(1);",
					"\t\tawait underTest.execute(new CreateAccountCommand(createAccountAttributes()));",
					"\t\texpect(repository.create).toHaveBeenCalledExactlyOnceWith(createAccountAttributes());",
					"\t});",
					"});"
				),
				name: "command construction as act argument"
			},
			{
				code: lines(
					'import { describe, expect, it } from "vitest";',
					"",
					"describe(DeleteAccountHandler, () => {",
					'\tit("throws AccountNotFoundError", async () => {',
					"\t\texpect.assertions(1);",
					"\t\tawait expect(underTest.execute(new DeleteAccountCommand(AccountId.from(999)))).rejects.toBeInstanceOf(",
					"\t\t\tAccountNotFoundError",
					"\t\t);",
					"\t});",
					"});"
				),
				name: "rejects.toBeInstanceOf with no mock setup in the test"
			},
			{
				code: lines(
					'import { beforeEach, describe, expect, it } from "vitest";',
					"",
					"function arrangeHappyPath() {",
					"\trepository.delete.mockResolvedValue(createAccount());",
					"}",
					"",
					"describe(Handler, () => {",
					"\tbeforeEach(() => {",
					"\t\tarrangeHappyPath();",
					"\t});",
					"",
					'\tit("acts", async () => {',
					"\t\tawait underTest.execute(new DeleteAccountCommand(AccountId.from(1)));",
					"\t\texpect(repository.delete).toHaveBeenCalled();",
					"\t});",
					"});"
				),
				name: "setup helper called from beforeEach"
			},
			{
				code: lines(
					'import { describe, expect, it, vi } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("observes a call", () => {',
					'\t\tconst spy = vi.spyOn(service, "run");',
					"\t\tunderTest.execute();",
					"\t\texpect(spy).toHaveBeenCalled();",
					"\t});",
					"});"
				),
				name: "bare spyOn assigned for later expect is act instrumentation"
			},
			{
				code: lines(
					'import { describe, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit.skip("pending");',
					"});"
				),
				name: "it.skip with no body"
			},
			{
				code: lines(
					'import { describe, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("empty", () => {});',
					"});"
				),
				name: "empty it callback"
			},
			{
				code: lines(
					'import { describe, expect, it } from "vitest";',
					"",
					"describe(AccountId, () => {",
					'\tit("accepts a positive integer", () => {',
					"\t\texpect.assertions(1);",
					"\t\tconst id = AccountId.from(1);",
					"\t\texpect(id.valueOf()).toBe(1);",
					"\t});",
					"});"
				),
				name: "const result from act is not arrange"
			},
			{
				code: lines(
					'import { describe, expect, test } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\ttest("works", async () => {',
					"\t\tconst result = await underTest.execute();",
					"\t\texpect(result).toEqual({});",
					"\t});",
					"});"
				),
				name: "test() act and assert"
			},
			{
				code: lines(
					'import { describe, it } from "vitest";',
					"",
					"describe(Handler, () => {",
					'\tit("uses a nested helper", () => {',
					"\t\tfunction arrangeMissing() {",
					"\t\t\trepository.findById.mockResolvedValue(null);",
					"\t\t}",
					"\t\tarrangeMissing();",
					"\t\tunderTest.execute();",
					"\t});",
					"});"
				),
				name: "mock setup inside a nested function is left alone"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noArrangeInTestRule, "no-arrange-in-test", testCase);

		expect(projectMessages(noArrangeInTestRule, result.messages, testCase.errors)).toStrictEqual(testCase.errors);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noArrangeInTestRule, "no-arrange-in-test", testCase);

		expect(projectMessages(noArrangeInTestRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
