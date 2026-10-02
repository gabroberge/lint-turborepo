import path from "node:path";
import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { lines } from "../../testing/lines";
import { noInheritedPropertyTestMatrixRule } from "./no-inherited-property-test-matrix";
import { inherited } from "./testing/inherited";
import { oneSubclass } from "./testing/one-subclass";

const fixtureDir = path.join(import.meta.dirname, "fixtures");

describe("no-inherited-property-test-matrix", () => {
	const ruleCases = {
		invalid: [
			{
				code: lines(
					oneSubclass(),
					'it("transforms the inherited field", async () => {',
					'    const dto = await pipe.transform({ inheritedField: "1" });',
					"    expect(dto).toEqual({ inheritedField: 1 });",
					"});"
				),
				errors: [inherited("inheritedField", "BaseDto")],
				name: "one isolated inherited test"
			},
			{
				code: lines(
					oneSubclass(),
					'it("root field", async () => { await pipe.transform({ rootField: 0 }); });',
					'it("inherited field", async () => { await pipe.transform({ inheritedField: 10 }); });'
				),
				errors: [inherited("rootField", "BaseDto"), inherited("inheritedField", "BaseDto")],
				name: "each inherited property is reported on its own"
			},
			{
				code: lines(
					"function Min(): PropertyDecorator { return () => undefined; }",
					"",
					"class BaseDto {",
					"    inheritedField?: number;",
					"}",
					"",
					"class DerivedDto extends BaseDto {",
					"    @Min()",
					"    ownField?: number;",
					"}",
					"",
					'it("accepts 10", async () => { await pipe.transform({ inheritedField: 10 }); });',
					'it("rejects a fraction", async () => { await pipe.transform({ inheritedField: 1.5 }); });'
				),
				errors: [inherited("inheritedField", "BaseDto"), inherited("inheritedField", "BaseDto")],
				name: "a decorator on the subclass's own field does not hide an inherited test"
			},
			{
				code: lines(
					oneSubclass(),
					'it("accepts the inherited field", async () => {',
					"    const dto = await pipe.transform({ inheritedField: 10 });",
					"    expect(dto.inheritedField).toBe(10);",
					"});",
					"",
					'it("rejects a string inherited field", async () => {',
					'    const dto = await pipe.transform({ inheritedField: "10" });',
					"    expect(dto.inheritedField).toBe(10);",
					"});",
					"",
					'it("rejects a fractional inherited field", async () => {',
					"    const dto = await pipe.transform({ inheritedField: 1.5 });",
					"    expect(dto.inheritedField).toBe(1);",
					"});"
				),
				errors: [
					inherited("inheritedField", "BaseDto", 10),
					inherited("inheritedField", "BaseDto", 15),
					inherited("inheritedField", "BaseDto", 20)
				],
				name: "multiple isolated tests for one inherited property"
			},
			{
				code: lines(
					oneSubclass(),
					'it.each([1, 10, 100])("accepts %s", async (inheritedField) => {',
					"    const dto = await pipe.transform({ inheritedField });",
					"    expect(dto.inheritedField).toBe(inheritedField);",
					"});"
				),
				errors: [inherited("inheritedField", "BaseDto")],
				name: "multi-case it.each for one inherited property"
			},
			{
				code: lines(
					oneSubclass(),
					'test.each([0, 1])("root field %s", async (rootField) => {',
					"    await pipe.transform({ rootField });",
					"});"
				),
				errors: [inherited("rootField", "BaseDto")],
				name: "multi-case test.each for one inherited property"
			},
			{
				code: lines(
					oneSubclass(),
					'it.each([{ inheritedField: 1 }, { inheritedField: 2 }])("inherited field %j", async (input) => {',
					"    await pipe.transform(input);",
					"});"
				),
				errors: [inherited("inheritedField", "BaseDto")],
				name: "each rows that are a single inherited property"
			},
			{
				code: lines(
					oneSubclass(),
					'it.each([{ inheritedField: 1 }])("inherited field %j", async (input) => {',
					"    await pipe.transform(input);",
					"});"
				),
				errors: [inherited("inheritedField", "BaseDto")],
				name: "a single-case each of one inherited property is reported"
			},
			{
				code: lines(
					oneSubclass(),
					'it("transforms the inherited field", async () => { await pipe.transform({ inheritedField: 1 }); });',
					'it.each([2, 3])("inherited field %s", async (inheritedField) => { await pipe.transform({ inheritedField }); });'
				),
				errors: [inherited("inheritedField", "BaseDto"), inherited("inheritedField", "BaseDto")],
				name: "an isolated inherited test and a multi-case each are both reported"
			},
			{
				code: lines(
					oneSubclass(),
					'it("root field zero", async () => { await pipe.transform({ rootField: 0 }); });',
					'it("root field one", async () => { await pipe.transform({ rootField: 1 }); });',
					'it("inherited field ten", async () => { await pipe.transform({ inheritedField: 10 }); });',
					'it("inherited field twenty", async () => { await pipe.transform({ inheritedField: 20 }); });'
				),
				errors: [
					inherited("rootField", "BaseDto"),
					inherited("rootField", "BaseDto"),
					inherited("inheritedField", "BaseDto"),
					inherited("inheritedField", "BaseDto")
				],
				name: "sibling inherited properties are counted separately"
			},
			{
				code: lines(
					oneSubclass(),
					'describe("first scenario", () => {',
					'    it("transforms the inherited field", async () => { await pipe.transform({ inheritedField: 1 }); });',
					"});",
					'describe("second scenario", () => {',
					'    it("checks another inherited field", async () => { await pipe.transform({ inheritedField: 2 }); });',
					"});"
				),
				errors: [inherited("inheritedField", "BaseDto"), inherited("inheritedField", "BaseDto")],
				name: "isolated tests in sibling describes still share the spec"
			},
			{
				code: lines(
					oneSubclass(),
					'it("transforms the inherited field", async () => { await pipe.transform({ inheritedField: 1 }); });',
					'it.skip("rejects a string", async () => { await pipe.transform({ inheritedField: "10" }); });'
				),
				errors: [inherited("inheritedField", "BaseDto"), inherited("inheritedField", "BaseDto")],
				name: "it.skip of an inherited property is reported"
			},
			{
				code: lines(
					"class RootDto { rootField?: number; }",
					"class BaseDto extends RootDto { inheritedField?: number; }",
					"class DerivedDto extends BaseDto { ownField?: number; }",
					"",
					'it("root field zero", async () => {',
					'    await pipe.transform({ rootField: 0 }, { metatype: DerivedDto, type: "body" });',
					"});",
					'it("root field one", async () => {',
					'    await pipe.transform({ rootField: 1 }, { metatype: DerivedDto, type: "body" });',
					"});"
				),
				errors: [inherited("rootField", "RootDto"), inherited("rootField", "RootDto")],
				name: "deeper chain reports the class that declares the property"
			},
			{
				code: lines(
					"class RootDto { rootField?: number; }",
					"class DerivedDto extends RootDto { ownField?: number; }",
					"class SiblingDto extends RootDto { siblingField?: number; }",
					"",
					'it("first", () => { plainToInstance(DerivedDto, { rootField: 0 }); });',
					'it("second", () => { plainToInstance(DerivedDto, { rootField: 1 }); });'
				),
				errors: [inherited("rootField", "RootDto"), inherited("rootField", "RootDto")],
				name: "plainToInstance names the class when several subclasses are in scope"
			},
			{
				code: lines(
					"class RootDto { rootField?: number; }",
					"class BaseDto extends RootDto { inheritedField?: number; }",
					"class DerivedDto extends BaseDto { ownField?: number; }",
					"",
					'it("first", async () => {',
					"    const dto: DerivedDto = await pipe.transform({ inheritedField: 1 });",
					"    expect(dto.inheritedField).toBe(1);",
					"});",
					'it("second", async () => {',
					"    const dto: DerivedDto = await pipe.transform({ inheritedField: 2 });",
					"    expect(dto.inheritedField).toBe(2);",
					"});"
				),
				errors: [inherited("inheritedField", "BaseDto"), inherited("inheritedField", "BaseDto")],
				name: "type annotation names the class"
			},
			{
				code: lines(
					"class RootDto { rootField?: number; }",
					"class DerivedDto extends RootDto { ownField?: number; }",
					"class SiblingDto extends RootDto { siblingField?: number; }",
					"",
					'it("first", async () => {',
					"    const dto = await pipe.transform({ rootField: 0 });",
					"    expect(dto).toBeInstanceOf(DerivedDto);",
					"});",
					'it("second", async () => {',
					"    const dto = await pipe.transform({ rootField: 1 });",
					"    expect(dto).toBeInstanceOf(DerivedDto);",
					"});"
				),
				errors: [inherited("rootField", "RootDto"), inherited("rootField", "RootDto")],
				name: "toBeInstanceOf names the class"
			},
			{
				code: lines(
					'import { BadRequestException } from "@nestjs/common";',
					oneSubclass(),
					'it("rejects a string", async () => {',
					'    await expect(pipe.transform({ inheritedField: "10" })).rejects.toBeInstanceOf(BadRequestException);',
					"});"
				),
				errors: [inherited("inheritedField", "BaseDto")],
				name: "unresolved toBeInstanceOf does not hide an inherited-property test"
			},
			{
				code: lines(
					'import { BadRequestException } from "@nestjs/common";',
					oneSubclass(),
					'it("accepts the inherited field", async () => {',
					"    const dto = await pipe.transform({ inheritedField: 10 });",
					"    expect(dto.inheritedField).toBe(10);",
					"});",
					'it("rejects a string inherited field", async () => {',
					'    await expect(pipe.transform({ inheritedField: "10" })).rejects.toBeInstanceOf(BadRequestException);',
					"});"
				),
				errors: [inherited("inheritedField", "BaseDto"), inherited("inheritedField", "BaseDto")],
				name: "unresolved exception assertion does not block inherited-property tests"
			},
			{
				code: lines(
					"class BaseDto {",
					"    constructor(public inheritedField?: number) {}",
					"}",
					"",
					"class DerivedDto extends BaseDto {",
					"    ownField?: number;",
					"}",
					"",
					'it("first", async () => { await pipe.transform({ inheritedField: 1 }); });',
					'it("second", async () => { await pipe.transform({ inheritedField: 2 }); });'
				),
				errors: [inherited("inheritedField", "BaseDto"), inherited("inheritedField", "BaseDto")],
				name: "ancestor constructor parameter property is still owned by the ancestor"
			},
			{
				code: lines(
					"const BaseDto = class {",
					"    inheritedField?: number;",
					"};",
					"",
					"class DerivedDto extends BaseDto {",
					"    ownField?: number;",
					"}",
					"",
					'it("first", async () => { await pipe.transform({ inheritedField: 1 }); });',
					'it("second", async () => { await pipe.transform({ inheritedField: 2 }); });'
				),
				errors: [inherited("inheritedField", "BaseDto"), inherited("inheritedField", "BaseDto")],
				name: "const class expression is the declaring type"
			},
			{
				code: lines(
					'import { DerivedDto } from "./derived.dto";',
					"",
					'it("root field zero", async () => { await pipe.transform({ rootField: 0 }); });',
					'it("root field one", async () => { await pipe.transform({ rootField: 1 }); });'
				),
				errors: [inherited("rootField", "RootDto"), inherited("rootField", "RootDto")],
				filename: path.join(fixtureDir, "derived.dto.spec.ts"),
				name: "cross-file chain reports the declaring class"
			},
			{
				code: lines(
					'import { DerivedDto } from "./derived.dto";',
					"",
					'it("first", async () => { await pipe.transform({ inheritedField: 1 }); });',
					'it("second", async () => { await pipe.transform({ inheritedField: 2 }); });'
				),
				errors: [inherited("inheritedField", "BaseDto"), inherited("inheritedField", "BaseDto")],
				filename: path.join(fixtureDir, "derived-barrel.spec.ts"),
				name: "named re-export still resolves the declaring class"
			}
		],
		valid: [
			{
				code: lines(
					oneSubclass(),
					'it("is valid when containing all fields", async () => {',
					"    const dto = await pipe.transform({ rootField: 0, inheritedField: 10, ownField: 1 });",
					"    expect(dto.ownField).toBe(1);",
					"});"
				),
				name: "composition of inherited and own fields"
			},
			{
				code: lines(
					oneSubclass(),
					'it("combines inherited fields", async () => {',
					"    await pipe.transform({ rootField: 0, inheritedField: 10 });",
					"});"
				),
				name: "several inherited fields are not attributed to one property"
			},
			{
				code: lines(
					oneSubclass(),
					'it.each([1, 2, 3])("own field %s", async (ownField) => {',
					"    await pipe.transform({ ownField });",
					"});",
					"",
					'it("rejects a string own field", async () => {',
					'    await pipe.transform({ ownField: "1" });',
					"});"
				),
				name: "detailed tests for a property the subclass declares"
			},
			{
				code: lines(
					"function Min(): PropertyDecorator { return () => undefined; }",
					"",
					"class BaseDto {",
					"    inheritedField?: number;",
					"}",
					"",
					"class DerivedDto extends BaseDto {",
					"    @Min()",
					"    inheritedField?: number;",
					"}",
					"",
					'it("accepts 10", async () => { await pipe.transform({ inheritedField: 10 }); });',
					'it("rejects a fraction", async () => { await pipe.transform({ inheritedField: 1.5 }); });'
				),
				name: "property decorator on an overridden field keeps ownership on the subclass"
			},
			{
				code: lines(
					"class BaseDto {",
					"    inheritedField?: number;",
					"}",
					"",
					"class DerivedDto extends BaseDto {",
					"    inheritedField?: number;",
					"    ownField?: number;",
					"}",
					"",
					'it("accepts 10", async () => { await pipe.transform({ inheritedField: 10 }); });',
					'it("rejects a fraction", async () => { await pipe.transform({ inheritedField: 1.5 }); });'
				),
				name: "subclass redeclares the inherited property"
			},
			{
				code: lines(
					oneSubclass(),
					'it("first", async () => {',
					"    const input = { inheritedField: 1 };",
					"    await pipe.transform(input);",
					"});",
					'it("second", async () => {',
					"    const input = { inheritedField: 2 };",
					"    await pipe.transform(input);",
					"});"
				),
				name: "local variable hides the input object"
			},
			{
				code: lines(
					oneSubclass(),
					'it("first", async () => { await pipe.transform({ ...input, inheritedField: 1 }); });',
					'it("second", async () => { await pipe.transform({ ...input, inheritedField: 2 }); });'
				),
				name: "spread input is not a single property"
			},
			{
				code: lines(
					oneSubclass(),
					'it("first", () => { const run = () => pipe.transform({ inheritedField: 1 }); run(); });',
					'it("second", () => { const run = () => pipe.transform({ inheritedField: 2 }); run(); });'
				),
				name: "nested helper is not the test input"
			},
			{
				code: lines(
					oneSubclass(),
					"const cases = [1, 2, 3];",
					'it.each(cases)("inherited field %s", async (inheritedField) => { await pipe.transform({ inheritedField }); });'
				),
				name: "non-static each table is not counted"
			},
			{
				code: lines(
					oneSubclass(),
					'it.for([1, 2])("inherited field %s", async (inheritedField) => { await pipe.transform({ inheritedField }); });'
				),
				name: "it.for is not an each matrix"
			},
			{
				code: lines(
					oneSubclass(),
					'it.each([[1, 2], [3, 4]])("both %s %s", async (inheritedField, ownField) => {',
					"    await pipe.transform({ inheritedField, ownField });",
					"});"
				),
				name: "each rows that carry more than one field are composition"
			},
			{
				code: lines(
					"class BaseDto {",
					"    inheritedField?: number;",
					"}",
					"",
					"declare function Mixin<T>(base: T): T;",
					"",
					"class DerivedDto extends Mixin(BaseDto) {",
					"    ownField?: number;",
					"}",
					"",
					'it("first", async () => {',
					'    await pipe.transform({ inheritedField: 1 }, { metatype: DerivedDto, type: "body" });',
					"});",
					'it("second", async () => {',
					'    await pipe.transform({ inheritedField: 2 }, { metatype: DerivedDto, type: "body" });',
					"});"
				),
				name: "mixin heritage is not a resolved subclass"
			},
			{
				code: lines(
					'type Fields = { [K in "inheritedField"]: number };',
					"",
					"class DerivedDto extends Fields {",
					"    ownField?: number;",
					"}",
					"",
					'it("first", async () => { await pipe.transform({ inheritedField: 1 }, { metatype: DerivedDto, type: "body" }); });',
					'it("second", async () => { await pipe.transform({ inheritedField: 2 }, { metatype: DerivedDto, type: "body" }); });'
				),
				name: "mapped type heritage cannot be resolved"
			},
			{
				code: lines(
					"class BaseDto {",
					"    inheritedField?: number;",
					"}",
					"",
					"declare function getBase(): typeof BaseDto;",
					"",
					"class DerivedDto extends getBase() {",
					"    ownField?: number;",
					"}",
					"",
					'it("first", async () => { await pipe.transform({ inheritedField: 1 }, { metatype: DerivedDto, type: "body" }); });',
					'it("second", async () => { await pipe.transform({ inheritedField: 2 }, { metatype: DerivedDto, type: "body" }); });'
				),
				name: "dynamic heritage is not followed"
			},
			{
				code: lines(
					"class BaseDto {",
					"    inheritedField?: number;",
					"}",
					"",
					"class DerivedDto extends BaseDto {",
					"    ownField?: number;",
					"    constructor() { super(); }",
					"}",
					"",
					'it("first", async () => { await pipe.transform({ inheritedField: 1 }); });',
					'it("second", async () => { await pipe.transform({ inheritedField: 2 }); });'
				),
				name: "subclass constructor makes inherited behavior uncertain"
			},
			{
				code: lines(
					"class BaseDto {",
					"    inheritedField?: number;",
					"}",
					"",
					"class DerivedDto extends BaseDto {",
					"    ownField?: number;",
					'    label(): string { return "derived"; }',
					"}",
					"",
					'it("first", async () => { await pipe.transform({ inheritedField: 1 }); });',
					'it("second", async () => { await pipe.transform({ inheritedField: 2 }); });'
				),
				name: "subclass method makes inherited behavior uncertain"
			},
			{
				code: lines(
					"function Extra(): ClassDecorator { return () => undefined; }",
					"",
					"class BaseDto {",
					"    inheritedField?: number;",
					"}",
					"",
					"@Extra()",
					"class DerivedDto extends BaseDto {",
					"    ownField?: number;",
					"}",
					"",
					'it("first", async () => { await pipe.transform({ inheritedField: 1 }); });',
					'it("second", async () => { await pipe.transform({ inheritedField: 2 }); });'
				),
				name: "class decorator makes inherited behavior uncertain"
			},
			{
				code: lines(
					"class BaseDto {",
					"    inheritedField?: number;",
					"}",
					"",
					"class DerivedDto extends BaseDto {",
					"    ownField?: number;",
					"    [key: string]: unknown;",
					"}",
					"",
					'it("first", async () => { await pipe.transform({ inheritedField: 1 }); });',
					'it("second", async () => { await pipe.transform({ inheritedField: 2 }); });'
				),
				name: "index signature makes ownership uncertain"
			},
			{
				code: lines(
					"class RootDto { rootField?: number; }",
					"class DerivedDto extends RootDto { ownField?: number; }",
					"class SiblingDto extends RootDto { siblingField?: number; }",
					"",
					'it("first", async () => { await pipe.transform({ rootField: 0 }); });',
					'it("second", async () => { await pipe.transform({ rootField: 1 }); });'
				),
				name: "two subclasses are not guessed without an explicit class"
			},
			{
				code: lines(
					"class BaseDto { inheritedField?: number; }",
					"class DerivedDto extends BaseDto { ownField?: number; }",
					"",
					'it("first", async () => { await pipe.transform({ inheritedField: 1 }, { metatype: BaseDto, type: "body" }); });',
					'it("second", async () => { await pipe.transform({ inheritedField: 2 }, { metatype: BaseDto, type: "body" }); });'
				),
				name: "matrix on the declaring class is allowed"
			},
			{
				code: lines(
					oneSubclass(),
					'it("first", async () => { await pipe.transform({ unknownProp: 1 }); });',
					'it("second", async () => { await pipe.transform({ unknownProp: 2 }); });'
				),
				name: "unknown property is not claimed as inherited"
			},
			{
				code: lines(
					'import { DerivedDto } from "./derived.dto";',
					"",
					'it("own field 1", async () => { await pipe.transform({ ownField: 1 }); });',
					'it("own field 2", async () => { await pipe.transform({ ownField: 2 }); });'
				),
				filename: path.join(fixtureDir, "derived.dto.spec.ts"),
				name: "cross-file own property tests are allowed"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noInheritedPropertyTestMatrixRule, "no-inherited-property-test-matrix", testCase);

		expect(projectMessages(noInheritedPropertyTestMatrixRule, result.messages, testCase.errors)).toStrictEqual(
			testCase.errors
		);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noInheritedPropertyTestMatrixRule, "no-inherited-property-test-matrix", testCase);

		expect(projectMessages(noInheritedPropertyTestMatrixRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
