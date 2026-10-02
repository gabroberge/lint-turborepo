import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { lines } from "../../testing/lines";
import { noGenericHttpExceptionAssertionRule } from "./no-generic-http-exception-assertion";

const SPECIFIC = "useSpecificException";
const VALIDATION = "useValidationError";

describe("no-generic-http-exception-assertion", () => {
	const ruleCases = {
		invalid: [
			{
				code: lines(
					'import { BadRequestException } from "@nestjs/common";',
					"",
					"expect(error).toBeInstanceOf(BadRequestException);"
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "handler.spec.ts",
				name: "toBeInstanceOf Nest HTTP exception"
			},
			{
				code: lines(
					'import { BadRequestException } from "@nestjs/common";',
					"",
					"await expect(operation()).rejects.toThrow(BadRequestException);"
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "handler.spec.ts",
				name: "rejects.toThrow Nest HTTP exception class"
			},
			{
				code: lines(
					'import { NotFoundException } from "@nestjs/common";',
					"",
					"expect(() => underTest.catch(new Error())).toThrow(NotFoundException);"
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "not-found-exception.filter.spec.ts",
				name: "sync toThrow Nest HTTP exception (filter-style)"
			},
			{
				code: lines(
					'import { NotFoundException } from "@nestjs/common";',
					"",
					"await expect(underTest.execute(query)).rejects.toBeInstanceOf(NotFoundException);"
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "get-account.handler.spec.ts",
				name: "rejects.toBeInstanceOf Nest HTTP exception"
			},
			{
				code: lines(
					'import { ForbiddenException } from "@nestjs/common";',
					"",
					"expect(() => underTest()).toThrowError(ForbiddenException);"
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "handler.spec.ts",
				name: "toThrowError alias"
			},
			{
				code: lines(
					'import { BadRequestException } from "@nestjs/common";',
					"",
					"await expect(operation()).rejects.toThrow(new BadRequestException());"
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "handler.spec.ts",
				name: "zero-arg constructed Nest exception"
			},
			{
				code: lines(
					'import { BadRequestException as BadReq } from "@nestjs/common";',
					"",
					"expect(error).toBeInstanceOf(BadReq);"
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "handler.spec.ts",
				name: "aliased Nest import"
			},
			{
				code: lines(
					'import * as nest from "@nestjs/common";',
					"",
					"expect(error).toBeInstanceOf(nest.HttpException);"
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "handler.spec.ts",
				name: "namespace Nest import"
			},
			{
				code: lines(
					'import { BadRequestException } from "@nestjs/common";',
					"",
					"expect(error).toBeInstanceOf(BadRequestException);",
					'expect(error).toHaveProperty("message", "specific");'
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "handler.spec.ts",
				name: "type-only assertion is flagged even with a later message assert"
			},
			{
				code: lines(
					'import { UnprocessableEntityException } from "@nestjs/common";',
					"",
					"await expect(pipe.transform({})).rejects.toBeInstanceOf(UnprocessableEntityException);"
				),
				errors: [{ messageId: VALIDATION }],
				filename: "update-trip-customer.dto.spec.ts",
				name: "DTO spec type-only assertion uses the validation diagnostic"
			},
			{
				code: lines(
					'import { UnprocessableEntityException } from "@nestjs/common";',
					"",
					"await expect(pipe.transform({})).rejects.toThrow(UnprocessableEntityException);"
				),
				errors: [{ messageId: VALIDATION }],
				filename: "src/modules/trips/http/dto/update-trip-customer.dto.spec.ts",
				name: "nested DTO spec type-only assertion uses the validation diagnostic"
			},
			{
				code: lines(
					'import { NotFoundException } from "@nestjs/common";',
					"",
					"await expect(operation()).rejects.toThrowHttpException(new NotFoundException());"
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "handler.spec.ts",
				name: "a configured custom matcher flags a zero-arg constructed Nest exception",
				options: [{ matchers: ["toThrowHttpException"] }]
			},
			{
				code: lines(
					'import { NotFoundException } from "@nestjs/common";',
					"",
					"await expect(operation()).rejects.toThrowHttpException(NotFoundException);"
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "handler.spec.ts",
				name: "a configured custom matcher flags a Nest exception class",
				options: [{ matchers: ["toThrowHttpException"] }]
			},
			{
				code: lines(
					'import { UnprocessableEntityException } from "@nestjs/common";',
					"",
					"await expect(pipe.transform({})).rejects.toThrowHttpException(new UnprocessableEntityException());"
				),
				errors: [{ messageId: VALIDATION }],
				filename: "update-trip-customer.dto.spec.ts",
				name: "a configured custom matcher on a DTO spec uses the validation diagnostic",
				options: [{ matchers: ["toThrowHttpException"] }]
			},
			{
				code: lines(
					'import { NotFoundException } from "@nestjs/common";',
					"",
					"await expect(operation()).rejects.toThrow(new NotFoundException());"
				),
				errors: [{ messageId: SPECIFIC }],
				filename: "handler.spec.ts",
				name: "configuring a custom matcher keeps the built-in matchers",
				options: [{ matchers: ["toThrowHttpException"] }]
			},
			{
				code: lines(
					'import { UnprocessableEntityException } from "@nestjs/common";',
					"",
					"expect(error).toBeInstanceOf(UnprocessableEntityException);"
				),
				errors: [
					{
						message: "DTO validation tests should assert the specific validation failure."
					}
				],
				filename: "update-trip-customer.dto.spec.ts",
				name: "DTO diagnostic text is locked"
			},
			{
				code: lines(
					'import { UnauthorizedException } from "@nestjs/common";',
					"",
					"expect(error).toBeInstanceOf(UnauthorizedException);"
				),
				errors: [
					{
						message: 'Assert the specific exception contract with `toThrow(new SpecificException("..."))`.'
					}
				],
				filename: "handler.spec.ts",
				name: "specific-exception diagnostic text is locked"
			}
		],
		valid: [
			{
				code: lines(
					'import { AccountNotFoundError } from "./account-not-found.error";',
					"",
					"await expect(underTest.execute(command)).rejects.toBeInstanceOf(AccountNotFoundError);"
				),
				filename: "delete-account.handler.spec.ts",
				name: "domain error toBeInstanceOf"
			},
			{
				code: lines(
					'import { BadRequestException } from "@nestjs/common";',
					"",
					'expect(() => underTest()).toThrow("must be non-empty");'
				),
				filename: "handler.spec.ts",
				name: "specific message string matcher"
			},
			{
				code: lines(
					'import { BadRequestException } from "@nestjs/common";',
					"",
					"expect(() => underTest()).toThrow(/must be at least 1/);"
				),
				filename: "handler.spec.ts",
				name: "specific message regex matcher"
			},
			{
				code: lines(
					'import { BadRequestException } from "@nestjs/common";',
					"",
					'await expect(operation()).rejects.toThrow(new BadRequestException("email is required"));'
				),
				filename: "handler.spec.ts",
				name: "constructed exception with specific message"
			},
			{
				code: lines("await expect(pipe.transform({ tripId: 0 })).rejects.toMatchObject({ status: 422 });"),
				filename: "update-trip-customer.dto.spec.ts",
				name: "DTO spec non-type assertion is ignored"
			},
			{
				code: lines("await expect(pipe.transform({ tripId: 0 })).rejects.toMatchObject({ status: 422 });"),
				filename: "src/modules/trips/http/dto/update-trip-customer.dto.spec.ts",
				name: "nested DTO spec non-type assertion is ignored"
			},
			{
				code: lines(
					"class BadRequestException extends Error {}",
					"",
					"expect(error).toBeInstanceOf(BadRequestException);"
				),
				filename: "handler.spec.ts",
				name: "local class with the same name is ignored"
			},
			{
				code: lines(
					'import { BadRequestException } from "@nestjs/common";',
					"",
					"expect(error).not.toBeInstanceOf(BadRequestException);"
				),
				filename: "handler.spec.ts",
				name: "negated assertion is ignored"
			},
			{
				code: lines(
					'import { NotFoundException } from "@nestjs/common";',
					"",
					"expect(() => underTest.catch(new Error())).toThrow(NotFoundException);"
				),
				filename: "not-found-exception.filter.ts",
				name: "non-test file is ignored"
			},
			{
				code: lines(
					'import { NotFoundException } from "@nestjs/common";',
					"",
					"expect(() => underTest.catch(new Error())).toThrow(NotFoundException);"
				),
				filename: "filters/not-found-exception.filter.spec.ts",
				name: "exemptFilePatterns skips boundary suite",
				options: [{ exemptFilePatterns: ["**/*.filter.spec.ts"] }]
			},
			{
				code: lines(
					'import { BadRequestException } from "@nestjs/common";',
					"",
					"expect(error).toBeInstanceOf(BadRequestException);"
				),
				filename: "handler.spec.ts",
				name: "exceptionNames override shrinks the set",
				options: [{ exceptionNames: ["ConflictException"] }]
			},
			{
				code: lines(
					'import { NotFoundException } from "@nestjs/common";',
					"",
					"await expect(operation()).rejects.toThrowHttpException(new NotFoundException());"
				),
				filename: "handler.spec.ts",
				name: "an unconfigured custom matcher is ignored"
			},
			{
				code: lines(
					'import { NotFoundException } from "@nestjs/common";',
					"",
					'await expect(operation()).rejects.toThrowHttpException(new NotFoundException("Trip not found"));'
				),
				filename: "handler.spec.ts",
				name: "a configured custom matcher allows a constructed exception with a message",
				options: [{ matchers: ["toThrowHttpException"] }]
			},
			{
				code: lines(
					'import type { BadRequestException } from "@nestjs/common";',
					"",
					"declare const BadRequestException: new () => Error;",
					"expect(error).toBeInstanceOf(BadRequestException);"
				),
				filename: "handler.spec.ts",
				name: "type-only Nest import is ignored"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(
			noGenericHttpExceptionAssertionRule,
			"no-generic-http-exception-assertion",
			testCase
		);

		expect(projectMessages(noGenericHttpExceptionAssertionRule, result.messages, testCase.errors)).toStrictEqual(
			testCase.errors
		);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(
			noGenericHttpExceptionAssertionRule,
			"no-generic-http-exception-assertion",
			testCase
		);

		expect(projectMessages(noGenericHttpExceptionAssertionRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
