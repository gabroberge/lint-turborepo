import { describe, expect, it } from "vitest";

import type { Category } from "../options/categories";
import { categoryOf } from "../testing/category-of";
import { memberCategory } from "./member-category";

interface CategoryCase {
	expected: Category;
	member: string;
}

describe(memberCategory, () => {
	it.each<CategoryCase>([
		{ expected: "index-signature", member: "[key: string]: unknown;" },
		{ expected: "inject", member: "svc = inject(Token);" },
		{ expected: "input", member: "value = input(0);" },
		{ expected: "input", member: "value = input.required<number>();" },
		{ expected: "model", member: "value = model(0);" },
		{ expected: "model", member: "value = model.required<number>();" },
		{ expected: "output", member: "changed = output<number>();" },
		{ expected: "signal", member: "count = signal(0);" },
		{ expected: "signal", member: "count = signal(0) as unknown as number;" },
		{ expected: "signal", member: "accessor count = signal(0);" },
		{ expected: "computed", member: "total = computed(() => 1);" },
		{ expected: "linked-signal", member: "draft = linkedSignal(() => 1);" },
		{ expected: "property", member: "count = 0;" },
		{ expected: "property", member: "count?: number;" },
		{ expected: "property", member: "abstract count: number;" },
		{ expected: "property", member: "query = viewChild('ref');" },
		{ expected: "property", member: "handler = (() => signal(0))();" },
		{ expected: "property", member: "ngOnInit = (): void => {};" },
		{ expected: "constructor", member: "constructor() {}" },
		{ expected: "static-property", member: "static count = signal(0);" },
		{ expected: "static-block", member: "static {}" },
		{ expected: "lifecycle", member: "ngOnInit(): void {}" },
		{ expected: "lifecycle", member: "ngOnDestroy(): void {}" },
		{ expected: "lifecycle", member: "abstract ngOnChanges(): void;" },
		{ expected: "method", member: "ngOnInitLater(): void {}" },
		{ expected: "method", member: "run(): void {}" },
		{ expected: "method", member: "abstract run(): void;" },
		{ expected: "method", member: "get value(): number {\n\t\treturn 1;\n\t}" },
		{ expected: "method", member: "set value(next: number) {}" },
		{ expected: "method", member: "get ngOnInit(): number {\n\t\treturn 1;\n\t}" },
		{ expected: "static-method", member: "static run(): void {}" },
		{ expected: "static-method", member: "static ngOnInit(): void {}" },
		{ expected: "static-method", member: "static get value(): number {\n\t\treturn 1;\n\t}" }
	])("should categorize $member as $expected", ({ expected, member }) => {
		expect.assertions(1);

		expect(categoryOf(member)).toBe(expected);
	});
});
