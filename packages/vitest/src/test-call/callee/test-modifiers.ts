/**
 * Recognized Vitest and Jest modifiers.
 * Renamed imports, `xit` / `fit` / `xtest`, and computed access (`it["skip"]`) are ignored on purpose.
 */
export const TEST_MODIFIERS: ReadonlySet<string> = new Set([
	"concurrent",
	"each",
	"failing",
	"fails",
	"for",
	"only",
	"runIf",
	"sequential",
	"skip",
	"skipIf",
	"todo"
]);
