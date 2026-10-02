import type { Category } from "../options/categories";

/** `@angular/core` initializer functions that give a field its own category. */
export const CATEGORY_BY_API: ReadonlyMap<string, Category> = new Map<string, Category>([
	["computed", "computed"],
	["inject", "inject"],
	["input", "input"],
	["input.required", "input"],
	["linkedSignal", "linked-signal"],
	["model", "model"],
	["model.required", "model"],
	["output", "output"],
	["signal", "signal"]
]);

/** `@angular/core` factories returning a signal: calling one reads its state and runs only deferred functions it was given. */
export const SIGNAL_APIS: ReadonlySet<string> = new Set([
	"computed",
	"contentChild",
	"contentChild.required",
	"contentChildren",
	"input",
	"input.required",
	"linkedSignal",
	"model",
	"model.required",
	"signal",
	"viewChild",
	"viewChild.required",
	"viewChildren"
]);

/**
 * `@angular/core` factories whose call is assumed not to observe or change
 * state that another field initializer could depend on. Their eager
 * arguments are still analyzed. Functions passed to them are deferred.
 */
export const ORDER_INSENSITIVE_APIS: ReadonlySet<string> = new Set([
	...CATEGORY_BY_API.keys(),
	"contentChild",
	"contentChild.required",
	"contentChildren",
	"viewChild",
	"viewChild.required",
	"viewChildren"
]);
