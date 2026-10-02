/**
 * Disallow assertions that only check for a NestJS HTTP exception type.
 *
 * Failure mode: several unrelated code paths may throw the same Nest HTTP
 * exception (`BadRequestException`, `NotFoundException`, `HttpException`, …).
 * A test that only asserts `toBeInstanceOf(BadRequestException)` or
 * `toThrow(BadRequestException)` can pass without distinguishing which failure
 * happened.
 *
 * Destination is chosen from the filename, not from test intent:
 * - `*.dto.spec.ts` → assert the specific validation failure.
 * - every other spec → assert the specific exception contract with
 *   `toThrow(new SpecificException("..."))`. A domain or custom error that
 *   already identifies the failure is also accepted.
 *
 * `toThrow(new NotFoundException("Trip not found"))` is allowed because the
 * message identifies the failure. `toThrow(new NotFoundException())` is not.
 *
 * Extra matcher names are configured with `matchers`. A name such as
 * `toThrowHttpException` is judged like `toThrow`: a class or a zero-arg `new`
 * is type-only, and a constructed instance that passes arguments is allowed.
 * The built-in matchers stay in effect.
 *
 * Boundary suites (exception filters, pipes) may intentionally treat the HTTP
 * exception or status as the contract. Exempt those files with
 * `exemptFilePatterns` rather than scattering eslint-disable comments.
 * Configure globs such as every `*.filter.spec.ts` file (recursive `**`
 * prefix) so boundary suites are exempt without hardcoding project paths.
 *
 * Deliberate limitations:
 * - Only Nest HTTP exceptions imported from `@nestjs/common` are considered.
 *   A class with the same name defined elsewhere is not one of them.
 * - A message or regex matcher (`toThrow("…")`, `toThrow(/…/)`) is allowed.
 * - `toThrow(new BadRequestException("specific message"))` is allowed because
 *   the message identifies the failure. A zero-arg `new BadRequestException()`
 *   does not.
 * - A later assertion of the message does not clear an earlier type-only
 *   assertion.
 * - Files outside `testFilePatterns` are skipped. The default matches spec and
 *   test files.
 * - Chai-style `instanceOf` chains are not checked.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";
import { DEFAULT_EXCEPTION_NAMES } from "./options/default-exception-names";
import { DEFAULT_TEST_FILE_PATTERNS } from "./options/default-test-file-patterns";

export const noGenericHttpExceptionAssertionRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "warn",
	meta: {
		defaultOptions: [
			{
				exceptionNames: [...DEFAULT_EXCEPTION_NAMES],
				exemptFilePatterns: [],
				matchers: [],
				testFilePatterns: [...DEFAULT_TEST_FILE_PATTERNS]
			}
		],
		docs: {
			description: "Disallow an assertion that only names a Nest HTTP exception type."
		},
		messages: {
			useSpecificException:
				'Assert the specific exception contract with `toThrow(new SpecificException("..."))`.',
			useValidationError: "DTO validation tests should assert the specific validation failure."
		},
		schema: [
			{
				additionalProperties: false,
				properties: {
					exceptionNames: {
						description:
							"Exported `@nestjs/common` HTTP exception class names that do not identify one failure when asserted by type alone.",
						items: { minLength: 1, type: "string" },
						type: "array",
						uniqueItems: true
					},
					exemptFilePatterns: {
						description:
							"Glob patterns exempted even when they match `testFilePatterns` (e.g. filter/pipe boundary suites).",
						items: { minLength: 1, type: "string" },
						type: "array",
						uniqueItems: true
					},
					matchers: {
						description:
							"Additional assertion method names judged like `toThrow`. A class or a zero-arg `new` of a Nest HTTP exception is type-only. Built-in matchers stay in effect.",
						items: { minLength: 1, type: "string" },
						type: "array",
						uniqueItems: true
					},
					testFilePatterns: {
						description:
							"Glob patterns for files where the rule applies. Defaults to `**/*.spec.ts` and `**/*.test.ts`.",
						items: { minLength: 1, type: "string" },
						type: "array",
						uniqueItems: true
					}
				},
				type: "object"
			}
		],
		type: "problem"
	},
	name: "no-generic-http-exception-assertion"
};
