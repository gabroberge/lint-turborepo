import { describe, expect, it } from "vitest";

import type { Options } from "./options/options";
import { categoryFixture } from "./testing/category-fixture";
import { evaluateSubject } from "./testing/evaluate-subject";
import { fixableIds } from "./testing/fixable-ids";
import { lineMultiset } from "./testing/line-multiset";
import { lines } from "./testing/lines";
import { lint } from "./testing/lint";
import { messageIds } from "./testing/message-ids";
import { ruleOptions } from "./testing/rule-options";

interface FixCase {
	code: string;
	messages: string[];
	name: string;
	options?: Options;
	output: string;
}

interface ReportCase {
	code: string;
	messages: string[];
	name: string;
	options?: Options;
}

const fixCases: FixCase[] = [
	{
		code: lines(
			'import { Component, computed, inject, input, linkedSignal, model, OnInit, output, signal } from "@angular/core";',
			"",
			"class Store {}",
			"",
			'@Component({ selector: "app-root", template: "" })',
			"export class Root implements OnInit {",
			"\tstatic create(): Root {",
			"\t\treturn new Root();",
			"\t}",
			"\thelper(): void {}",
			"\tngOnInit(): void {}",
			"\tstatic count = 0;",
			"\tstatic {",
			"\t\tRoot.count = 1;",
			"\t}",
			"\tconstructor() {}",
			'\ttitle = "root";',
			"\tderived = linkedSignal(() => this.selected());",
			"\ttotal = computed(() => this.selected() + 1);",
			"\tselected = signal(0);",
			"\tchanged = output<number>();",
			"\tvalue = model(0);",
			"\tsize = input(1);",
			"\tprivate readonly store = inject(Store);",
			"\t[key: string]: unknown;",
			"}"
		),
		messages: Array.from({ length: 13 }, () => "unordered"),
		name: "every category in the default group order",
		output: lines(
			'import { Component, computed, inject, input, linkedSignal, model, OnInit, output, signal } from "@angular/core";',
			"",
			"class Store {}",
			"",
			'@Component({ selector: "app-root", template: "" })',
			"export class Root implements OnInit {",
			"\t[key: string]: unknown;",
			"",
			"\tprivate readonly store = inject(Store);",
			"",
			"\tsize = input(1);",
			"\tvalue = model(0);",
			"",
			"\tchanged = output<number>();",
			"",
			"\tselected = signal(0);",
			"",
			"\ttotal = computed(() => this.selected() + 1);",
			"",
			"\tderived = linkedSignal(() => this.selected());",
			"",
			'\ttitle = "root";',
			"",
			"\tconstructor() {}",
			"",
			"\tstatic count = 0;",
			"",
			"\tstatic {",
			"\t\tRoot.count = 1;",
			"\t}",
			"",
			"\tngOnInit(): void {}",
			"",
			"\thelper(): void {}",
			"",
			"\tstatic create(): Root {",
			"\t\treturn new Root();",
			"\t}",
			"}"
		)
	},
	{
		code: lines(
			"class Sorter {",
			"\t#delta = 1;",
			"\tprivate charlie = 2;",
			"\t#alpha = 3;",
			"\tprivate Bravo = 4;",
			"}"
		),
		messages: ["unordered", "unordered"],
		name: "names sorted case-insensitively, ignoring the # of private names",
		output: lines(
			"class Sorter {",
			"\t#alpha = 3;",
			"\tprivate Bravo = 4;",
			"\tprivate charlie = 2;",
			"\t#delta = 1;",
			"}"
		)
	},
	{
		code: lines("class Visible {", "\tprivate a = 1;", "\tprotected b = 2;", "\tc = 3;", "\tpublic d = 4;", "}"),
		messages: ["unordered", "unordered"],
		name: "public, then protected, then private, with implicit accessibility as public",
		output: lines("class Visible {", "\tc = 3;", "\tpublic d = 4;", "\tprotected b = 2;", "\tprivate a = 1;", "}")
	},
	{
		code: lines(
			'import { inject } from "@angular/core";',
			"",
			"class A {}",
			"class B {}",
			"class C {}",
			"",
			"class Injected {",
			"\tpublic a = inject(A);",
			"\tprivate b = inject(B);",
			"\tprotected c = inject(C);",
			"}"
		),
		messages: ["unordered", "unordered"],
		name: "inject() fields protected, then private, then public",
		output: lines(
			'import { inject } from "@angular/core";',
			"",
			"class A {}",
			"class B {}",
			"class C {}",
			"",
			"class Injected {",
			"\tprotected c = inject(C);",
			"\tprivate b = inject(B);",
			"\tpublic a = inject(A);",
			"}"
		)
	},
	{
		code: lines("class Visible {", "\tc = 3;", "\tpublic d = 4;", "\tprotected b = 2;", "\tprivate a = 1;", "}"),
		messages: ["unordered", "unordered"],
		name: "a custom visibility order",
		options: { visibility: ["private", "protected", "public"] },
		output: lines("class Visible {", "\tprivate a = 1;", "\tprotected b = 2;", "\tc = 3;", "\tpublic d = 4;", "}")
	},
	{
		code: lines(
			"class Visible {",
			"\tprotected b = 2;",
			"\tprivate a = 1;",
			"\tc = 3;",
			"",
			"\trun(): void {}",
			"\tstop(): void {}",
			"}"
		),
		messages: ["unordered"],
		name: "a visibility order overridden for one group",
		options: { groups: [{ categories: "property", visibility: ["private", "public", "protected"] }, "method"] },
		output: lines(
			"class Visible {",
			"\tprivate a = 1;",
			"\tc = 3;",
			"\tprotected b = 2;",
			"",
			"\trun(): void {}",
			"\tstop(): void {}",
			"}"
		)
	},
	{
		code: lines("class Custom {", "\tb = 1;", "\ta = 2;", "\trun(): void {}", "}"),
		messages: ["unordered", "unordered"],
		name: "a custom group order",
		options: { groups: ["method", "property"] },
		output: lines("class Custom {", "\trun(): void {}", "", "\ta = 2;", "\tb = 1;", "}")
	},
	{
		code: lines("class Custom {", "\trun(): void {}", "\tb = 1;", "\ta = 2;", "}"),
		messages: ["unordered"],
		name: "a group kept in source order",
		options: { groups: [{ categories: "property", order: "source" }] },
		output: lines("class Custom {", "\tb = 1;", "\ta = 2;", "", "\trun(): void {}", "}")
	},
	{
		code: lines("class Trailing {", "\tzed(): void {}", "\talpha = 1;", "\tconstructor() {}", "}"),
		messages: ["unordered", "unordered"],
		name: "categories listed in no group sorted together in a trailing group",
		options: { groups: ["constructor"] },
		output: lines("class Trailing {", "\tconstructor() {}", "", "\talpha = 1;", "\tzed(): void {}", "}")
	},
	{
		code: lines(
			'import { input, model } from "@angular/core";',
			"",
			"class Fields {",
			"\tb = model(0);",
			"\tc = input(0);",
			"\ta = input.required<number>();",
			"}"
		),
		messages: ["unordered"],
		name: "inputs and models sorted together",
		output: lines(
			'import { input, model } from "@angular/core";',
			"",
			"class Fields {",
			"\ta = input.required<number>();",
			"\tb = model(0);",
			"\tc = input(0);",
			"}"
		)
	},
	{
		code: lines(
			"class Hooks {",
			"\thelper(): void {}",
			"",
			"\tngOnInit(): void {}",
			"",
			"\tngOnChanges(): void {}",
			"",
			"\tngAfterViewInit(): void {}",
			"",
			"\tconstructor() {}",
			"}"
		),
		messages: ["unordered", "unordered"],
		name: "lifecycle hooks after the constructor, in their source order, before methods",
		output: lines(
			"class Hooks {",
			"\tconstructor() {}",
			"",
			"\tngOnInit(): void {}",
			"",
			"\tngOnChanges(): void {}",
			"",
			"\tngAfterViewInit(): void {}",
			"",
			"\thelper(): void {}",
			"}"
		)
	},
	{
		code: lines(
			"class Accessors {",
			"\tzed(): void {}",
			"",
			"\tset value(next: number) {}",
			"",
			"\tget value(): number {",
			"\t\treturn 1;",
			"\t}",
			"",
			"\tstatic get instance(): number {",
			"\t\treturn 0;",
			"\t}",
			"",
			"\tstatic build(): void {}",
			"}"
		),
		messages: ["unordered", "unordered"],
		name: "getters and setters as methods, keeping a pair in source order",
		output: lines(
			"class Accessors {",
			"\tset value(next: number) {}",
			"",
			"\tget value(): number {",
			"\t\treturn 1;",
			"\t}",
			"",
			"\tzed(): void {}",
			"",
			"\tstatic build(): void {}",
			"",
			"\tstatic get instance(): number {",
			"\t\treturn 0;",
			"\t}",
			"}"
		)
	},
	{
		code: lines(
			"class Overloads {",
			"\tfoo(value: string): void;",
			"\tfoo(value: number): void;",
			"\tfoo(value: unknown): void {}",
			"",
			"\tbar(): void;",
			"\tbar(): void {}",
			"}"
		),
		messages: ["unordered"],
		name: "overload signatures moved with their implementation",
		output: lines(
			"class Overloads {",
			"\tbar(): void;",
			"\tbar(): void {}",
			"",
			"\tfoo(value: string): void;",
			"\tfoo(value: number): void;",
			"\tfoo(value: unknown): void {}",
			"}"
		)
	},
	{
		code: lines(
			"class Commented {",
			"\t/** The second field. */",
			"\t@Input() b = 1; // trailing b",
			"\t// Leading line comment for a.",
			"\t@Input()",
			"\ta = 2; /* trailing a */",
			"}"
		),
		messages: ["unordered"],
		name: "comments and decorators moved with their member",
		output: lines(
			"class Commented {",
			"\t// Leading line comment for a.",
			"\t@Input()",
			"\ta = 2; /* trailing a */",
			"\t/** The second field. */",
			"\t@Input() b = 1; // trailing b",
			"}"
		)
	},
	{
		code: lines("class Keys {", '\t["b"] = 1;', "\ta = 2;", "}"),
		messages: ["unordered"],
		name: "a member with an inert computed key",
		output: lines("class Keys {", "\ta = 2;", '\t["b"] = 1;', "}")
	},
	{
		code: lines("class Pure {", "\tb = foo();", "\ta = 1;", "}"),
		messages: ["unordered"],
		name: "a side-effecting initializer past a constant one",
		output: lines("class Pure {", "\ta = 1;", "\tb = foo();", "}")
	}
];

const spacingCases: FixCase[] = [
	{
		code: lines(
			"class Spaced {",
			"\ta = 1;",
			"",
			"\tb = 2;",
			"\tconstructor() {}",
			"\tc(): void {}",
			"\td(): void {}",
			"}"
		),
		messages: ["extraBlankLine", "missingBlankLine", "missingBlankLine", "missingBlankLine"],
		name: "the default preset",
		output: lines(
			"class Spaced {",
			"\ta = 1;",
			"\tb = 2;",
			"",
			"\tconstructor() {}",
			"",
			"\tc(): void {}",
			"",
			"\td(): void {}",
			"}"
		)
	},
	{
		code: lines("class Spaced {", "\ta = 1;", "", "", "", "\tconstructor() {}", "}"),
		messages: ["extraBlankLine"],
		name: "several blank lines between groups",
		output: lines("class Spaced {", "\ta = 1;", "", "\tconstructor() {}", "}")
	},
	{
		code: lines(
			"class Spaced {",
			"\ta = 1;",
			"",
			"\tb = 2;",
			"",
			"\tconstructor() {}",
			"",
			"\tc(): void {}",
			"",
			"\td(): void {}",
			"}"
		),
		messages: ["extraBlankLine", "extraBlankLine", "extraBlankLine"],
		name: "newlinesBetween never",
		options: { newlinesBetween: "never" },
		output: lines(
			"class Spaced {",
			"\ta = 1;",
			"\tb = 2;",
			"\tconstructor() {}",
			"\tc(): void {}",
			"",
			"\td(): void {}",
			"}"
		)
	},
	{
		code: lines("class Spaced {", "\ta = 1;", "\tb = 2;", "\tconstructor() {}", "}"),
		messages: ["missingBlankLine", "missingBlankLine"],
		name: "newlinesWithin always",
		options: { newlinesWithin: "always" },
		output: lines("class Spaced {", "\ta = 1;", "", "\tb = 2;", "", "\tconstructor() {}", "}")
	},
	{
		code: lines("class Spaced {", "\ta(): void {}", "", "\tb(): void {}", "}"),
		messages: ["extraBlankLine"],
		name: "newlinesWithin never set on one group",
		options: { groups: [{ categories: "method", newlinesWithin: "never" }] },
		output: lines("class Spaced {", "\ta(): void {}", "\tb(): void {}", "}")
	},
	{
		code: lines("class Spaced {", "\tfoo(value: string): void;", "", "\tfoo(value: unknown): void {}", "}"),
		messages: ["extraBlankLine"],
		name: "a blank line after an overload signature",
		output: lines("class Spaced {", "\tfoo(value: string): void;", "\tfoo(value: unknown): void {}", "}")
	}
];

const dependencyCases: FixCase[] = [
	{
		code: lines(
			'import { signal } from "@angular/core";',
			"",
			"class Picker {",
			'\tdefaultSelection = "first";',
			"",
			"\tselected = signal(this.defaultSelection);",
			"}"
		),
		messages: [],
		name: "a signal initialized from a plain field declared before it",
		output: lines(
			'import { signal } from "@angular/core";',
			"",
			"class Picker {",
			'\tdefaultSelection = "first";',
			"",
			"\tselected = signal(this.defaultSelection);",
			"}"
		)
	},
	{
		code: lines(
			'import { signal } from "@angular/core";',
			"",
			"class Picker {",
			'\tlabel = "x";',
			'\tdefaultSelection = "first";',
			"\tzoom = 1;",
			"\tselected = signal(this.defaultSelection);",
			"}"
		),
		messages: ["unordered", "unordered"],
		name: "a dependent member moved only as far as its dependency allows",
		output: lines(
			'import { signal } from "@angular/core";',
			"",
			"class Picker {",
			'\tdefaultSelection = "first";',
			"",
			"\tselected = signal(this.defaultSelection);",
			"",
			'\tlabel = "x";',
			"\tzoom = 1;",
			"}"
		)
	},
	{
		code: lines(
			'import { computed, signal } from "@angular/core";',
			"",
			"class Counter {",
			'\tlabel = "x";',
			"\tdoubled = computed(() => this.count() * 2);",
			"\tzeta = 1;",
			"\tformat = (): number => this.zeta;",
			"\tcount = signal(0);",
			"}"
		),
		messages: ["unordered", "unordered", "unordered"],
		name: "deferred reads in computed() and arrow-function fields",
		output: lines(
			'import { computed, signal } from "@angular/core";',
			"",
			"class Counter {",
			"\tcount = signal(0);",
			"",
			"\tdoubled = computed(() => this.count() * 2);",
			"",
			"\tformat = (): number => this.zeta;",
			'\tlabel = "x";',
			"\tzeta = 1;",
			"}"
		)
	},
	{
		code: lines(
			"class Eager {",
			"\tzeta = 1;",
			"\tdoubled = (): number => this.zeta * 2;",
			"\ty = this.doubled();",
			"}"
		),
		messages: ["unordered"],
		name: "a deferred field invoked by an initializer",
		output: lines(
			"class Eager {",
			"\tdoubled = (): number => this.zeta * 2;",
			"\tzeta = 1;",
			"\ty = this.doubled();",
			"}"
		)
	},
	{
		code: lines(
			"class Calls {",
			"\tzeta = 1;",
			"\talpha = this.sum();",
			"\tbeta = this.constant();",
			"",
			"\tconstant(): number {",
			"\t\treturn 2;",
			"\t}",
			"",
			"\tsum(): number {",
			"\t\treturn this.zeta + 1;",
			"\t}",
			"}"
		),
		messages: ["unordered"],
		name: "method calls, pinning only a method that reads another field",
		output: lines(
			"class Calls {",
			"\tbeta = this.constant();",
			"\tzeta = 1;",
			"\talpha = this.sum();",
			"",
			"\tconstant(): number {",
			"\t\treturn 2;",
			"\t}",
			"",
			"\tsum(): number {",
			"\t\treturn this.zeta + 1;",
			"\t}",
			"}"
		)
	},
	{
		code: lines(
			"class Getters {",
			"\tzeta = 1;",
			"\talpha = this.total;",
			"",
			"\tget total(): number {",
			"\t\treturn this.zeta;",
			"\t}",
			"}"
		),
		messages: [],
		name: "a getter read by an initializer",
		output: lines(
			"class Getters {",
			"\tzeta = 1;",
			"\talpha = this.total;",
			"",
			"\tget total(): number {",
			"\t\treturn this.zeta;",
			"\t}",
			"}"
		)
	},
	{
		code: lines(
			'import { output } from "@angular/core";',
			"",
			"class CrossGroup {",
			'\tprefix = "p";',
			"\tchanged = output({ alias: this.prefix });",
			"\tclosed = output();",
			"}"
		),
		messages: ["unordered"],
		name: "a dependency across groups",
		output: lines(
			'import { output } from "@angular/core";',
			"",
			"class CrossGroup {",
			"\tclosed = output();",
			"",
			'\tprefix = "p";',
			"",
			"\tchanged = output({ alias: this.prefix });",
			"}"
		)
	},
	{
		code: lines("class Statics {", "\tstatic z = 1;", "\tstatic a = Statics.z + 1;", "\tstatic b = this.z;", "}"),
		messages: [],
		name: "static fields reading other static fields",
		output: lines("class Statics {", "\tstatic z = 1;", "\tstatic a = Statics.z + 1;", "\tstatic b = this.z;", "}")
	},
	{
		code: lines(
			"function log(value: string): string {",
			"\treturn value;",
			"}",
			"",
			"class Mixed {",
			'\tstatic b = log("b");',
			'\ty = log("y");',
			"}"
		),
		messages: ["unordered"],
		name: "side effects in the static and instance timelines",
		output: lines(
			"function log(value: string): string {",
			"\treturn value;",
			"}",
			"",
			"class Mixed {",
			'\ty = log("y");',
			"",
			'\tstatic b = log("b");',
			"}"
		)
	}
];

const blockedCases: ReportCase[] = [
	{
		code: lines("class Subject {", "\tb = foo();", "\ta = foo();", "}"),
		messages: ["initializationOrder"],
		name: "two unknown calls"
	},
	{
		code: lines(
			"let counter = 0;",
			"export function bump(): void {",
			"\tcounter += 1;",
			"}",
			"",
			"class Subject {",
			"\tb = foo();",
			"\ta = counter;",
			"}"
		),
		messages: ["initializationOrder"],
		name: "an unknown call and a mutable binding"
	},
	{
		code: lines("class Subject {", "\tb = other.value;", "\ta = foo();", "}"),
		messages: ["initializationOrder"],
		name: "a property of another object and an unknown call"
	},
	{
		code: lines("class Subject {", "\tb = new Thing();", "\ta = foo();", "}"),
		messages: ["initializationOrder"],
		name: "a constructor call and an unknown call"
	},
	{
		code: lines(
			'import { effect } from "@angular/core";',
			'import { toSignal } from "@angular/core/rxjs-interop";',
			"",
			"class Subject {",
			"\tb = effect(() => undefined);",
			"\ta = toSignal(source);",
			"}"
		),
		messages: ["initializationOrder"],
		name: "effect() and toSignal()"
	},
	{
		code: lines("class Subject {", "\tb = register(this);", "\ta = 1;", "}"),
		messages: ["initializationOrder"],
		name: "this escaping"
	},
	{
		code: lines("class Subject extends Base {", "\tb = super.value;", "\ta = 1;", "}"),
		messages: ["initializationOrder"],
		name: "super"
	},
	{
		code: lines("class Subject extends Base {", "\tb = this.inherited;", "\ta = 1;", "}"),
		messages: ["initializationOrder"],
		name: "an inherited member"
	},
	{
		code: lines(
			"class Subject {",
			"\tstatic b = 1;",
			"",
			"\tstatic {",
			"\t\tSubject.ready = true;",
			"\t}",
			"",
			"\tstatic a = 2;",
			"}"
		),
		messages: ["initializationOrder"],
		name: "a static field past a static block"
	}
];

const layoutCases: ReportCase[] = [
	{
		code: lines("class Subject {", "\tb = 1; a = 2;", "}"),
		messages: ["unordered"],
		name: "two members on one line"
	},
	{
		code: lines("class Subject {", "\tb = 1;;", "\ta = 2;", "}"),
		messages: ["unordered"],
		name: "a stray semicolon between members"
	},
	{
		code: lines("class Subject {", "\tb(): void {}", "", "\t[key()](): void {}", "", "\ta(): void {}", "}"),
		messages: ["unordered"],
		name: "a computed key that runs code"
	},
	{
		code: lines("class Subject {", '\t["c"] = 3;', "\tb = 1", "}"),
		messages: ["unordered"],
		name: "a field without a semicolon moved before a bracketed key"
	}
];

interface CategoryCase {
	category: string;
	label: string;
	member: string[];
	name: string;
}

const categoryCases: CategoryCase[] = [
	{
		category: "index-signature",
		label: "index signature",
		member: ["[key: string]: unknown;"],
		name: "an index signature"
	},
	{ category: "inject", label: "a", member: ["a = inject(Store);"], name: "inject()" },
	{ category: "input", label: "a", member: ["a = input(0);"], name: "input()" },
	{ category: "input", label: "a", member: ["a = input.required<number>();"], name: "input.required()" },
	{ category: "model", label: "a", member: ["a = model(0);"], name: "model()" },
	{
		category: "model",
		label: "a",
		member: ["a = ng.model.required<number>();"],
		name: "a namespaced model.required()"
	},
	{ category: "output", label: "a", member: ["a = output();"], name: "output()" },
	{ category: "signal", label: "a", member: ["a = signal(0);"], name: "signal()" },
	{ category: "signal", label: "a", member: ["a = writable(0);"], name: "an aliased signal()" },
	{ category: "signal", label: "a", member: ["a = ng.signal(0);"], name: "a namespaced signal()" },
	{ category: "computed", label: "a", member: ["a = computed(() => 1);"], name: "computed()" },
	{ category: "linked-signal", label: "a", member: ["a = linkedSignal(() => 1);"], name: "linkedSignal()" },
	{ category: "property", label: "a", member: ["a = 1;"], name: "a plain field" },
	{
		category: "property",
		label: "a",
		member: ["a = localSignal(0);"],
		name: "a field from a local signal() function"
	},
	{ category: "property", label: "#a", member: ["#a = 1;"], name: "a private name" },
	{ category: "property", label: "a", member: ["accessor a = 1;"], name: "an auto-accessor" },
	{ category: "constructor", label: "constructor", member: ["constructor() {}"], name: "a constructor" },
	{ category: "static-property", label: "a", member: ["static a = 1;"], name: "a static field" },
	{ category: "static-block", label: "static block", member: ["static {}"], name: "a static block" },
	{ category: "lifecycle", label: "ngOnInit", member: ["ngOnInit(): void {}"], name: "a lifecycle hook" },
	{ category: "method", label: "a", member: ["a(): void {}"], name: "a method" },
	{ category: "method", label: "a", member: ["get a(): number {", "\treturn 1;", "}"], name: "a getter" },
	{ category: "method", label: "a", member: ["set a(value: number) {}"], name: "a setter" },
	{ category: "static-method", label: "a", member: ["static a(): void {}"], name: "a static method" }
];

const ticketComponent = lines(
	'import { ChangeDetectionStrategy, Component, computed, inject, input, model, OnDestroy, OnInit, output, signal } from "@angular/core";',
	'import * as core from "@angular/core";',
	"",
	"class TicketStore {",
	"\treadonly tickets = signal<string[]>([]);",
	"}",
	"",
	"class Logger {",
	"\tlog(message: string): void {",
	"\t\tconsole.log(message);",
	"\t}",
	"}",
	"",
	"@Component({",
	'\tselector: "app-tickets",',
	"\tchangeDetection: ChangeDetectionStrategy.OnPush,",
	'\ttemplate: ""',
	"})",
	"export class TicketListComponent implements OnInit, OnDestroy {",
	"\t/** Emits the selected ticket. */",
	"\treadonly selected = output<string>();",
	"",
	"\tngOnDestroy(): void {",
	'\t\tthis.logger.log("destroyed");',
	"\t}",
	"",
	"\tprotected readonly visible = computed(() => this.tickets().filter((ticket) => ticket.includes(this.query())));",
	'\treadonly query = model("");',
	"\tprivate readonly logger = inject(Logger);",
	"\treadonly pageSize = input(20);",
	'\tprivate readonly defaultTitle = "Tickets";',
	"\tprotected readonly title = signal(this.defaultTitle);",
	"\tprotected readonly store = inject(TicketStore);",
	"\tprotected readonly tickets = this.store.tickets;",
	"",
	"\tconstructor() {",
	'\t\tthis.logger.log("created");',
	"\t}",
	"",
	"\tngOnInit(): void {",
	'\t\tthis.logger.log("init");',
	"\t}",
	"",
	"\t// Selection",
	"\tselect(ticket: string): void;",
	"\tselect(ticket: string | null): void {",
	"\t\tif (ticket !== null) {",
	"\t\t\tthis.selected.emit(ticket);",
	"\t\t}",
	"\t}",
	"\tstatic readonly maxPage = 10;",
	"\tprivate readonly collapsed = core.signal(false); // UI state",
	"\tprotected clear(): void {",
	'\t\tthis.query.set("");',
	"\t}",
	"}"
);

const settingsComponent = lines(
	'import { Component, computed, effect, inject, input, linkedSignal, signal } from "@angular/core";',
	"",
	"class Settings {",
	'\treadonly theme = signal("light");',
	"}",
	"",
	"let instances = 0;",
	"",
	'@Component({ selector: "app-settings", template: "" })',
	"export class SettingsComponent {",
	"\tstatic registry = new Map<string, SettingsComponent>();",
	"\tstatic {",
	'\t\tSettingsComponent.registry.set("default", new SettingsComponent());',
	"\t}",
	'\tstatic defaults = { theme: "light" };',
	"\tid = ++instances;",
	"\tlogging = effect(() => console.log(this.theme()));",
	"\tprivate settings = inject(Settings);",
	"\ttheme = linkedSignal(() => this.settings.theme());",
	'\tdark = computed(() => this.theme() === "dark");',
	'\tlabel = input("Settings");',
	"\tsnapshot = this.describe();",
	"\tprotected describe(): string {",
	"\t\treturn `${this.label()} #${this.id}`;",
	"\t}",
	"\tngOnInit(): void {}",
	"}"
);

describe("ordered-class-members", () => {
	it.each(fixCases)("reorders $name", ({ code, messages, options, output }) => {
		expect.assertions(3);

		const result = lint(code, ruleOptions(options));

		expect(messageIds(result)).toStrictEqual(messages);
		expect(fixableIds(result)).toStrictEqual(messages);
		expect(result.output).toBe(output);
	});

	it("accepts members already in the default order", () => {
		expect.assertions(2);

		const output = fixCases[0]?.output ?? "";
		const result = lint(output);

		expect(result.messages).toStrictEqual([]);
		expect(result.output).toBe(output);
	});

	describe("categories", () => {
		it.each(categoryCases)("sorts $name as $category", ({ category, label, member }) => {
			expect.assertions(1);

			const result = lint(categoryFixture(member), [{ groups: [] }]);

			expect(result.messages.map((message) => message.message)).toStrictEqual([
				`Expected \`${label}\` (${category}) before \`#zz\` (property).`
			]);
		});
	});

	describe("blank lines", () => {
		it.each(spacingCases)("enforces $name", ({ code, messages, options, output }) => {
			expect.assertions(3);

			const result = lint(code, ruleOptions(options));

			expect(messageIds(result)).toStrictEqual(messages);
			expect(fixableIds(result)).toStrictEqual(messages);
			expect(result.output).toBe(output);
		});

		it("leaves spacing alone under the ignore policy", () => {
			expect.assertions(1);

			const code = lines(
				"class Spaced {",
				"\ta = 1;",
				"",
				"",
				"\tb = 2;",
				"\tc(): void {}",
				"",
				"\td(): void {}",
				"}"
			);

			expect(
				lint(code, [{ groups: ["property", "method"], newlinesBetween: "ignore", newlinesWithin: "ignore" }])
					.messages
			).toStrictEqual([]);
		});

		it("reports blank lines only once the order is correct", () => {
			expect.assertions(1);

			const code = lines("class Spaced {", "\tb = 1;", "", "\ta = 2;", "\tc(): void {}", "}");

			expect(messageIds(lint(code))).toStrictEqual(["unordered"]);
		});
	});

	describe("initialization dependencies", () => {
		it.each(dependencyCases)("orders $name", ({ code, messages, options, output }) => {
			expect.assertions(3);

			const result = lint(code, ruleOptions(options));

			expect(messageIds(result)).toStrictEqual(messages);
			expect(fixableIds(result)).toStrictEqual(messages);
			expect(result.output).toBe(output);
		});

		it("keeps a static block between the static fields around it", () => {
			expect.assertions(2);

			const code = lines(
				"class Subject {",
				"\tstatic {",
				"\t\tSubject.ready = true;",
				"\t}",
				"",
				"\tstatic b = 1;",
				"\tstatic a = 2;",
				"}"
			);
			const result = lint(code);

			expect(result.messages.map(({ fix, messageId }) => [messageId, fix !== undefined])).toStrictEqual([
				["initializationOrder", false],
				["unordered", true],
				["initializationOrder", false]
			]);
			expect(result.output).toBe(
				lines(
					"class Subject {",
					"\tstatic {",
					"\t\tSubject.ready = true;",
					"\t}",
					"",
					"\tstatic a = 2;",
					"\tstatic b = 1;",
					"}"
				)
			);
		});
	});

	describe("when initializers may interact", () => {
		it.each(blockedCases)("reports $name without a fix", ({ code, messages, options }) => {
			expect.assertions(3);

			const result = lint(code, ruleOptions(options));

			expect(messageIds(result)).toStrictEqual(messages);
			expect(fixableIds(result)).toStrictEqual([]);
			expect(result.output).toBe(code);
		});

		it("names both members in the message", () => {
			expect.assertions(1);

			const code = lines("class Subject {", "\tb = foo();", "\ta = foo();", "}");

			expect(lint(code).messages.map((message) => message.message)).toStrictEqual([
				"Expected `a` (property) before `b` (property), but it is not reordered automatically: their initializers may depend on running in source order."
			]);
		});
	});

	describe("when moving whole lines is unsafe", () => {
		it.each(layoutCases)("reports $name without a fix", ({ code, messages, options }) => {
			expect.assertions(3);

			const result = lint(code, ruleOptions(options));

			expect(messageIds(result)).toStrictEqual(messages);
			expect(fixableIds(result)).toStrictEqual([]);
			expect(result.output).toBe(code);
		});
	});

	describe("fixed output", () => {
		const battery = [
			...[...fixCases, ...spacingCases, ...dependencyCases].map(({ code, name, options }) => ({
				code,
				name,
				options
			})),
			{ code: ticketComponent, name: "a ticket list component", options: undefined },
			{ code: settingsComponent, name: "a settings component", options: undefined },
			{
				code: ticketComponent,
				name: "a ticket list component with custom options",
				options: { newlinesBetween: "never", visibility: ["private", "protected", "public"] } satisfies Options
			}
		];

		it.each(battery)("is stable for $name", ({ code, options }) => {
			expect.assertions(2);

			const { output } = lint(code, ruleOptions(options));
			const again = lint(output, ruleOptions(options));

			expect(fixableIds(again)).toStrictEqual([]);
			expect(again.output).toBe(output);
		});

		it.each(battery)("only permutes the members of $name", ({ code, options }) => {
			expect.assertions(1);

			expect(lineMultiset(lint(code, ruleOptions(options)).output)).toStrictEqual(lineMultiset(code));
		});

		it("reorders the ticket list component", () => {
			expect.assertions(1);

			expect(lint(ticketComponent).output).toBe(
				lines(
					'import { ChangeDetectionStrategy, Component, computed, inject, input, model, OnDestroy, OnInit, output, signal } from "@angular/core";',
					'import * as core from "@angular/core";',
					"",
					"class TicketStore {",
					"\treadonly tickets = signal<string[]>([]);",
					"}",
					"",
					"class Logger {",
					"\tlog(message: string): void {",
					"\t\tconsole.log(message);",
					"\t}",
					"}",
					"",
					"@Component({",
					'\tselector: "app-tickets",',
					"\tchangeDetection: ChangeDetectionStrategy.OnPush,",
					'\ttemplate: ""',
					"})",
					"export class TicketListComponent implements OnInit, OnDestroy {",
					"\tprotected readonly store = inject(TicketStore);",
					"\tprivate readonly logger = inject(Logger);",
					"",
					"\treadonly pageSize = input(20);",
					'\treadonly query = model("");',
					"",
					"\t/** Emits the selected ticket. */",
					"\treadonly selected = output<string>();",
					"",
					"\tprivate readonly collapsed = core.signal(false); // UI state",
					"",
					"\tprotected readonly visible = computed(() => this.tickets().filter((ticket) => ticket.includes(this.query())));",
					"",
					"\tprotected readonly tickets = this.store.tickets;",
					'\tprivate readonly defaultTitle = "Tickets";',
					"",
					"\tprotected readonly title = signal(this.defaultTitle);",
					"",
					"\tconstructor() {",
					'\t\tthis.logger.log("created");',
					"\t}",
					"",
					"\tstatic readonly maxPage = 10;",
					"",
					"\tngOnDestroy(): void {",
					'\t\tthis.logger.log("destroyed");',
					"\t}",
					"",
					"\tngOnInit(): void {",
					'\t\tthis.logger.log("init");',
					"\t}",
					"",
					"\t// Selection",
					"\tselect(ticket: string): void;",
					"\tselect(ticket: string | null): void {",
					"\t\tif (ticket !== null) {",
					"\t\t\tthis.selected.emit(ticket);",
					"\t\t}",
					"\t}",
					"",
					"\tprotected clear(): void {",
					'\t\tthis.query.set("");',
					"\t}",
					"}"
				)
			);
		});
	});

	describe("fixed initialization", () => {
		const programs = [
			{
				code: lines(
					"const log: string[] = [];",
					"",
					"class Subject {",
					'\tzeta = (log.push("zeta"), 1);',
					'\tlabel = "x";',
					"\tselected = [this.zeta];",
					"\tdoubled = (): number => this.zeta * 2;",
					"\ty = this.doubled();",
					"\talpha = this.sum();",
					"\tsum(): number {",
					"\t\treturn this.zeta + this.y;",
					"\t}",
					"\tstatic total = 3;",
					"\tstatic half = Subject.total / 2;",
					'\tstatic first = (log.push("first"), 0);',
					"}"
				),
				name: "plain dependencies"
			},
			{
				code: lines(
					"const log: string[] = [];",
					"let counter = 0;",
					"",
					"class Subject {",
					'\tb = (log.push("b"), ++counter);',
					"\ta = counter;",
					"\tc = 2;",
					"\tconstant = 5;",
					'\tz = (log.push("z"), counter);',
					"\tget value(): number {",
					"\t\treturn this.c;",
					"\t}",
					"\tread = this.value;",
					"}"
				),
				name: "side effects and accessors"
			}
		];

		const heldBack = [
			{
				code: lines(
					"const log: string[] = [];",
					"",
					"class Subject {",
					"\tz = 1;",
					'\tb = eval("this.z");',
					"}"
				),
				name: "a direct eval reading a field"
			},
			{
				code: lines(
					"const log: string[] = [];",
					"",
					"class Subject {",
					"\tz = 5;",
					"\tcb = (): number => this.z;",
					"\ta = [0].map(this.cb);",
					"}"
				),
				name: "a stored arrow handed to unknown code"
			},
			{
				code: lines(
					"const log: string[] = [];",
					"",
					"class Subject {",
					"\tcb = (): number => this.b;",
					"\tc = this.cb.call(null);",
					"\tb = 1;",
					"}"
				),
				name: "a stored arrow called through call()"
			},
			{
				code: lines(
					"const log: string[] = [];",
					"",
					"class Subject {",
					"\ta = this.read;",
					"\tc = this.a();",
					"\tb = 1;",
					"\tread(): number {",
					"\t\treturn this.b;",
					"\t}",
					"}"
				),
				name: "a method stored in a field and called later"
			},
			{
				code: lines(
					"const log: string[] = [];",
					"let counter = 0;",
					"const makeFn = (): (() => number) => () => counter++;",
					"",
					"class Subject {",
					"\tfn = makeFn();",
					"\tc = this.fn();",
					"\tb = counter;",
					"}"
				),
				name: "a field holding an unknown function"
			},
			{
				code: lines(
					"const log: string[] = [];",
					"function read(target: { a?: number }): number | undefined {",
					"\treturn target.a;",
					"}",
					"",
					"class Subject {",
					"\tstatic b = read(Subject);",
					"\tstatic a = 1;",
					"}"
				),
				name: "the class object escaping from a static initializer"
			},
			{
				code: lines(
					"const log: string[] = [];",
					"",
					"class Subject {",
					"\tconstructor(private p?: number) {}",
					"\tb = (this.p = 2);",
					"\ta = this.p;",
					"}"
				),
				name: "a parameter property written then read"
			}
		];

		it.each(heldBack)("keeps the observable result of $name", ({ code }) => {
			expect.assertions(1);

			expect(evaluateSubject(lint(code).output)).toBe(evaluateSubject(code));
		});

		it.each(programs)("is unobservable for $name", ({ code }) => {
			expect.assertions(2);

			const { output } = lint(code);

			expect(output).not.toBe(code);
			expect(evaluateSubject(output)).toBe(evaluateSubject(code));
		});
	});

	describe("review regressions", () => {
		it("names the member that must actually come later", () => {
			expect.assertions(1);

			const result = lint(lines("class Subject {", "\tzeta = 1;", "\talpha = this.zeta;", "\tbeta = 2;", "}"));

			expect(result.messages.map((message) => message.message)).toStrictEqual([
				"Expected `beta` (property) before `zeta` (property)."
			]);
		});

		it("does not fix a field named like a modifier without a semicolon", () => {
			expect.assertions(2);

			const code = lines("class Subject {", "\ta() {}", "", "\tget", "}");
			const result = lint(code);

			expect(messageIds(result)).toStrictEqual(["unordered"]);
			expect(result.output).toBe(code);
		});

		it("reports a missing blank line between members sharing a line", () => {
			expect.assertions(2);

			const code = lines(
				'import { inject, Injector } from "@angular/core";',
				"",
				"class Subject {",
				"\tinjector = inject(Injector); x = 1;",
				"}"
			);
			const result = lint(code);

			expect(messageIds(result)).toStrictEqual(["missingBlankLine"]);
			expect(result.output).toBe(code);
		});

		it("treats an immediately invoked function literal as analyzed code", () => {
			expect.assertions(1);

			const code = lines(
				"class Subject {",
				"\tb = ((): number => {",
				"\t\tlet k = 1;",
				"\t\tk++;",
				"\t\treturn k;",
				"\t})();",
				"\ta = foo();",
				"}"
			);

			expect(lint(code).output).toBe(
				lines(
					"class Subject {",
					"\ta = foo();",
					"\tb = ((): number => {",
					"\t\tlet k = 1;",
					"\t\tk++;",
					"\t\treturn k;",
					"\t})();",
					"}"
				)
			);
		});

		it("applies a top-level newlinesWithin to the default groups", () => {
			expect.assertions(1);

			const code = lines("class Subject {", "\tb(): void {}", "", "\ta(): void {}", "}");

			expect(lint(code, [{ newlinesWithin: "never" }]).output).toBe(
				lines("class Subject {", "\ta(): void {}", "\tb(): void {}", "}")
			);
		});

		it("applies a top-level visibility to the default inject group", () => {
			expect.assertions(1);

			const code = lines(
				'import { inject } from "@angular/core";',
				"",
				"class Subject {",
				"\tprotected readonly a = inject(A);",
				"\tprivate readonly b = inject(B);",
				"}"
			);

			expect(lint(code, [{ visibility: ["private", "protected", "public"] }]).output).toBe(
				lines(
					'import { inject } from "@angular/core";',
					"",
					"class Subject {",
					"\tprivate readonly b = inject(B);",
					"\tprotected readonly a = inject(A);",
					"}"
				)
			);
		});
	});
});
