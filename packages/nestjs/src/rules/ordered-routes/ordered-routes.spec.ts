import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { lines } from "./testing/lines";
import type { LintCase } from "./testing/lint-with-eslint";
import { lintWithEslint } from "./testing/lint-with-eslint";
import { lintWithOxlint } from "./testing/lint-with-oxlint";

type InvalidLintCase = LintCase & {
	output: string;
};

interface LintCases {
	invalid: InvalidLintCase[];
	valid: LintCase[];
}

const cases: LintCases = {
	invalid: [
		{
			code: lines(
				'import { Controller, Get } from "@nestjs/common";',
				"",
				'@Controller("users")',
				"export class UsersController {",
				"\tconstructor(private readonly users: { find(): string }) {}",
				"",
				"\t/** by id */",
				'\t@Get(":id")',
				"\tfindOne() {",
				"\t\treturn this.users.find();",
				"\t}",
				"",
				"\thelper() {",
				"\t\treturn true;",
				"\t}",
				"",
				"\t// static",
				'\t@Get("active")',
				"\tfindActive() {",
				'\t\treturn "active";',
				"\t}",
				"}"
			),
			name: "static route is declared after a parameter",
			output: lines(
				'import { Controller, Get } from "@nestjs/common";',
				"",
				'@Controller("users")',
				"export class UsersController {",
				"\tconstructor(private readonly users: { find(): string }) {}",
				"",
				"\t// static",
				'\t@Get("active")',
				"\tfindActive() {",
				'\t\treturn "active";',
				"\t}",
				"",
				"\thelper() {",
				"\t\treturn true;",
				"\t}",
				"",
				"\t/** by id */",
				'\t@Get(":id")',
				"\tfindOne() {",
				"\t\treturn this.users.find();",
				"\t}",
				"}"
			)
		},
		{
			code: lines(
				'import { Controller, Get, Post } from "@nestjs/common";',
				"",
				'@Controller("users")',
				"export class UsersController {",
				'\t@Get("active")',
				"\tfindActive() {}",
				"",
				'\t@Post("*path")',
				"\tcreate() {}",
				"}"
			),
			name: "methods are grouped before path specificity",
			output: lines(
				'import { Controller, Get, Post } from "@nestjs/common";',
				"",
				'@Controller("users")',
				"export class UsersController {",
				'\t@Post("*path")',
				"\tcreate() {}",
				"",
				'\t@Get("active")',
				"\tfindActive() {}",
				"}"
			)
		},
		{
			code: lines(
				'import { Controller, Get } from "@nestjs/common";',
				"",
				"function ApiOkResponse() {",
				"\treturn () => undefined;",
				"}",
				"",
				'@Controller("users")',
				"export class UsersController {",
				'\t@Get([":id", "active"])',
				"\tboth() {}",
				"",
				"\t@ApiOkResponse()",
				'\t@Get("*path")',
				"\tcatchAll() {}",
				"}"
			),
			name: "extra decorators and a sorted path array move with the method",
			output: lines(
				'import { Controller, Get } from "@nestjs/common";',
				"",
				"function ApiOkResponse() {",
				"\treturn () => undefined;",
				"}",
				"",
				'@Controller("users")',
				"export class UsersController {",
				'\t@Get(["active", ":id"])',
				"\tboth() {}",
				"",
				"\t@ApiOkResponse()",
				'\t@Get("*path")',
				"\tcatchAll() {}",
				"}"
			)
		},
		{
			code: lines(
				'import { Controller as HttpController, Get as Read } from "@nestjs/common";',
				'import * as nest from "@nestjs/common";',
				"",
				'@HttpController("users")',
				"export class UsersController {",
				'\t@Read(":id")',
				"\tfindOne() {}",
				"",
				'\t@nest.Get("active")',
				"\tfindActive() {}",
				"}"
			),
			name: "aliased and namespace imports are recognized",
			output: lines(
				'import { Controller as HttpController, Get as Read } from "@nestjs/common";',
				'import * as nest from "@nestjs/common";',
				"",
				'@HttpController("users")',
				"export class UsersController {",
				'\t@nest.Get("active")',
				"\tfindActive() {}",
				"",
				'\t@Read(":id")',
				"\tfindOne() {}",
				"}"
			)
		},
		{
			code: lines(
				'import { Controller, Get } from "@nestjs/common";',
				"",
				'const dynamicPath = "runtime";',
				"",
				'@Controller("users")',
				"export class UsersController {",
				'\t@Get(":id")',
				"\tfindOne() {}",
				"",
				'\t@Get("active")',
				"\tfindActive() {}",
				"",
				"\t@Get(dynamicPath)",
				"\tdynamic() {}",
				"",
				'\t@Get(":id")',
				"\tstillParam() {}",
				"",
				'\t@Get("other")',
				"\tother() {}",
				"}"
			),
			name: "a dynamic path stays in place and splits sortable regions",
			output: lines(
				'import { Controller, Get } from "@nestjs/common";',
				"",
				'const dynamicPath = "runtime";',
				"",
				'@Controller("users")',
				"export class UsersController {",
				'\t@Get("active")',
				"\tfindActive() {}",
				"",
				'\t@Get(":id")',
				"\tfindOne() {}",
				"",
				"\t@Get(dynamicPath)",
				"\tdynamic() {}",
				"",
				'\t@Get("other")',
				"\tother() {}",
				"",
				'\t@Get(":id")',
				"\tstillParam() {}",
				"}"
			)
		},
		{
			code: lines(
				'import { Controller, Get, Head } from "@nestjs/common";',
				"",
				'@Controller("users")',
				"export class UsersController {",
				'\t@Get("active")',
				"\tfindActive() {}",
				"",
				'\t@Head("active")',
				"\theadActive() {}",
				"}"
			),
			name: "HEAD is registered before GET for the same pattern",
			output: lines(
				'import { Controller, Get, Head } from "@nestjs/common";',
				"",
				'@Controller("users")',
				"export class UsersController {",
				'\t@Head("active")',
				"\theadActive() {}",
				"",
				'\t@Get("active")',
				"\tfindActive() {}",
				"}"
			)
		}
	],
	valid: [
		{
			code: lines(
				'import { Controller, Delete, Get, Patch, Post, Put } from "@nestjs/common";',
				"",
				'@Controller("users")',
				"export class UsersController {",
				"\tconstructor(private readonly users: { create(): string }) {}",
				"",
				"\t@Post()",
				"\tcreate() {",
				"\t\treturn this.users.create();",
				"\t}",
				"",
				"\t@Get()",
				"\tfindAll() {",
				'\t\treturn "root";',
				"\t}",
				"",
				'\t@Get("active")',
				"\tfindActive() {",
				'\t\treturn "active";',
				"\t}",
				"",
				"\thelper() {",
				"\t\treturn true;",
				"\t}",
				"",
				'\t@Get(":id")',
				"\tfindOne() {",
				'\t\treturn "param";',
				"\t}",
				"",
				'\t@Get(":id/details")',
				"\tfindDetails() {",
				'\t\treturn "details";',
				"\t}",
				"",
				'\t@Get("*path")',
				"\tcatchAll() {",
				'\t\treturn "wild";',
				"\t}",
				"",
				'\t@Patch(":id")',
				"\tupdate() {",
				'\t\treturn "patch";',
				"\t}",
				"",
				'\t@Put(":id")',
				"\treplace() {",
				'\t\treturn "put";',
				"\t}",
				"",
				'\t@Delete(":id")',
				"\tremove() {",
				'\t\treturn "delete";',
				"\t}",
				"}"
			),
			name: "already ordered controller"
		},
		{
			code: lines(
				'import { Controller, Get } from "@nestjs/common";',
				"",
				"@Controller()",
				"export class ReportsController {",
				'\t@Get("zeta")',
				"\tzeta() {}",
				"",
				'\t@Get("alpha")',
				"\talpha() {}",
				"}"
			),
			name: "distinct static routes keep source order"
		},
		{
			code: lines(
				'import { DispatchBookingDestinationChangedEvent } from "./dispatch-booking-destination-changed.event";',
				"",
				"export class BookingAutocabDestinationChangedEvent extends DispatchBookingDestinationChangedEvent {}"
			),
			name: "classes with no decorators are ignored"
		},
		{
			code: lines(
				'import { Get } from "@nestjs/common";',
				"",
				"class NotAController {",
				'\t@Get(":id")',
				"\tfindOne() {}",
				"",
				'\t@Get("active")',
				"\tfindActive() {}",
				"}"
			),
			name: "classes without @Controller are ignored"
		},
		{
			code: lines(
				'import { Controller, Get, Post } from "@nestjs/common";',
				"",
				'@Controller("users")',
				"export class UsersController {",
				"\t@Get()",
				"\tfindAll() {}",
				"",
				"\t@Post()",
				"\tcreate() {}",
				"}"
			),
			name: "custom method order",
			options: [{ methodOrder: ["GET", "POST"] }]
		},
		{
			code: lines(
				'import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";',
				"",
				'@Controller("payments")',
				"export class PaymentsController {",
				"\t@Post()",
				"\tcreate(@Body() body: object) {",
				"\t\treturn body;",
				"\t}",
				"",
				"\t@Get()",
				"\tfindAll() {",
				"\t\treturn [];",
				"\t}",
				"",
				'\t@Get(":id")',
				'\tfindOne(@Param("id") id: string) {',
				"\t\treturn id;",
				"\t}",
				"",
				'\t@Patch(":id")',
				'\tupdate(@Param("id") id: string) {',
				"\t\treturn id;",
				"\t}",
				"",
				'\t@Delete(":id")',
				'\tremove(@Param("id") id: string) {',
				"\t\treturn id;",
				"\t}",
				"}"
			),
			name: "Nest CRUD generator order"
		}
	]
};

describe("ordered-routes", () => {
	it.each(cases.valid)("accepts $name", (testCase) => {
		expect.assertions(2);
		expect(lintWithEslint(testCase).messages).toStrictEqual([]);
		expect(lintWithOxlint(testCase)).toStrictEqual({ output: testCase.code, status: 0 });
	});

	it.each(cases.invalid)("fixes $name", (testCase) => {
		expect.assertions(4);

		const eslintResult = lintWithEslint(testCase);

		expect(eslintResult.messages).toStrictEqual([]);
		expect(eslintResult.output).toBe(testCase.output);

		const oxlintResult = lintWithOxlint(testCase);

		expect(oxlintResult.status).toBe(0);
		expect(oxlintResult.output).toBe(testCase.output);
	});

	it("does not rewrite an unsorted path array that contains a comment", () => {
		expect.assertions(5);

		const code = lines(
			'import { Controller, Get } from "@nestjs/common";',
			"",
			'@Controller("users")',
			"export class UsersController {",
			"\t@Get([",
			'\t\t":id",',
			"\t\t// static route",
			'\t\t"active"',
			"\t])",
			"\tboth() {}",
			"}"
		);
		const eslintResult = lintWithEslint({ code, name: "commented array" });

		expect(eslintResult.fixed).toBe(false);
		expect(eslintResult.messages).toHaveLength(1);
		expect(eslintResult.output).toBe(code);

		const oxlintResult = lintWithOxlint({ code, name: "commented array" });

		expect(oxlintResult.status).not.toBe(0);
		expect(oxlintResult.output).toBe(code);
	});

	it("accepts the users fixture", () => {
		expect.assertions(2);

		const code = readFileSync(new URL("./testing/users.controller.ts", import.meta.url), "utf8");

		expect(lintWithEslint({ code, name: "fixture" }).messages).toStrictEqual([]);
		expect(lintWithOxlint({ code, name: "fixture" }).status).toBe(0);
	});
});
