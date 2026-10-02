const BUILTIN_MATCHERS = ["toBeInstanceOf", "toThrow", "toThrowError"] as const;

export const DEFAULT_MATCHERS: ReadonlySet<string> = new Set(BUILTIN_MATCHERS);
