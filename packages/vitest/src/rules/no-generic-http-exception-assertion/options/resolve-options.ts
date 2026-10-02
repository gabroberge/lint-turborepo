import type { Context } from "@oxlint/plugins";

import { DEFAULT_EXCEPTION_NAMES } from "./default-exception-names";
import { DEFAULT_TEST_FILE_PATTERNS } from "./default-test-file-patterns";
import { resolveMatchers } from "./resolve-matchers";

const DEFAULT_EXEMPT_FILE_PATTERNS: string[] = [];

interface Options {
	exceptionNames?: string[];
	exemptFilePatterns?: string[];
	matchers?: string[];
	testFilePatterns?: string[];
}

interface ResolvedOptions {
	exceptionNames: ReadonlySet<string>;
	exemptFilePatterns: string[];
	matchers: ReadonlySet<string>;
	testFilePatterns: string[];
}

export function resolveOptions(context: Context): ResolvedOptions {
	const raw = context.options[0] as Options | undefined;
	return {
		exceptionNames: new Set(raw?.exceptionNames ?? DEFAULT_EXCEPTION_NAMES),
		exemptFilePatterns: raw?.exemptFilePatterns ?? DEFAULT_EXEMPT_FILE_PATTERNS,
		matchers: resolveMatchers(raw?.matchers),
		testFilePatterns: raw?.testFilePatterns ?? DEFAULT_TEST_FILE_PATTERNS
	};
}
