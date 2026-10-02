# `angular/ordered-class-members`

Orders the members of Angular classes (components, directives, services and pipes) by configurable groups, including Angular's signal APIs, and fixes the order automatically without changing how fields initialize. This page is the complete reference for the rule. Installation and the plugin's other rules are in the [package README](../packages/angular/README.md).

```ts
// Before
export class CounterComponent {
	increment(): void {
		this.count.update((value) => value + this.step());
	}
	protected readonly count = signal(0);
	readonly step = input(1);
	private readonly store = inject(CounterStore);
}

// After
export class CounterComponent {
	private readonly store = inject(CounterStore);

	readonly step = input(1);

	protected readonly count = signal(0);

	increment(): void {
		this.count.update((value) => value + this.step());
	}
}
```

(`inject`, `input` and `signal` are imported from `@angular/core`, which is how the rule recognizes them.)

The initialization analysis behind the rule is framework-independent and lives in [`@gabroberge/typescript-class-analyzer`](../packages/class-analyzer/README.md). That package documents the algorithm, its invariants and its general limitations; this page covers what the Angular rule adds on top of it.

## Enabling the rule

The rule is opt-in: `configs.all` enables it, `configs.recommended` does not.

```js
import angular from "@gabroberge/eslint-plugin-angular";

export default [angular.configs.recommended, { rules: { "angular/ordered-class-members": "error" } }];
```

With Oxlint, add `"angular/ordered-class-members": "error"` to the `rules` of the configuration that loads the plugin.

It replaces combining `perfectionist/sort-classes` with Angular-specific ordering rules, whose diagnostics and autofixes can conflict. Turn `perfectionist/sort-classes` off for files this rule covers.

## Default order

1. Index signatures
2. `inject()` fields, `protected` then `private` then `public`
3. `input()` and `model()` fields, sorted together
4. `output()` fields
5. `signal()` fields
6. `computed()` fields
7. `linkedSignal()` fields
8. Other instance properties
9. Constructor
10. Static properties
11. Static blocks
12. Angular lifecycle hooks, in source order
13. Methods, including getters and setters
14. Static methods

Members sort by group, then by visibility, then by name (see [Sorting](#sorting)). Groups are separated by one blank line (see [Spacing](#spacing)).

```ts
import { Component, computed, inject, input, model, output, signal } from "@angular/core";

@Component({ selector: "app-picker", template: "" })
export class PickerComponent {
	protected readonly store = inject(Store);
	private readonly http = inject(HttpClient);

	readonly label = input.required<string>();
	readonly value = model(0);

	protected readonly changed = output<number>();

	protected readonly open = signal(false);

	protected readonly doubled = computed(() => this.value() * 2);

	protected title = "Picker";

	constructor() {}

	ngOnInit(): void {}

	protected toggle(): void {}
}
```

## Options

```ts
interface Options {
	groups?: (Category | Category[] | GroupObject)[];
	newlinesBetween?: "always" | "ignore" | "never"; // default "always"
	newlinesWithin?: "always" | "ignore" | "never"; // default "never"
	visibility?: ("private" | "protected" | "public")[]; // default ["public", "protected", "private"]
}

interface GroupObject {
	categories: Category | Category[];
	newlinesWithin?: "always" | "ignore" | "never";
	order?: "alphabetical" | "source"; // default "alphabetical"
	visibility?: ("private" | "protected" | "public")[];
}

type Category =
	| "computed"
	| "constructor"
	| "index-signature"
	| "inject"
	| "input"
	| "lifecycle"
	| "linked-signal"
	| "method"
	| "model"
	| "output"
	| "property"
	| "signal"
	| "static-block"
	| "static-method"
	| "static-property";
```

- `groups` lists the sorting groups in order. A group can be one category, an array of categories sorted together, or an object that also overrides `visibility`, `order` or `newlinesWithin` for that group. Configuring `groups` replaces the whole default list. A category listed in more than one group belongs to the first; a category you leave out goes to one trailing group.
- `visibility` sets the accessibility order inside every group that does not override it. An accessibility missing from the list sorts last.
- `newlinesBetween` controls blank lines between groups, and `newlinesWithin` inside groups. `always` means exactly one blank line, `never` means none, and `ignore` keeps whatever blank line a member had, moving it with the member.
- With the default `groups`, a top-level `visibility` or `newlinesWithin` also replaces the default groups' own settings. For example, `{ newlinesWithin: "never" }` removes the blank lines between methods too.

Signals before inputs, private members first, and no blank lines anywhere:

```js
{
	rules: {
		"angular/ordered-class-members": [
			"error",
			{
				groups: [
					"inject",
					["signal", "computed", "linked-signal"],
					["input", "model"],
					"output",
					"property",
					"constructor",
					{ categories: "lifecycle", order: "source" },
					["method", "static-method"]
				],
				newlinesBetween: "never",
				visibility: ["private", "protected", "public"]
			}
		]
	}
}
```

To keep `public` inputs and models first in an otherwise private-first ordering, override one group: `{ categories: ["input", "model"], visibility: ["public", "protected", "private"] }`.

## Recognizing Angular APIs

A field gets an Angular category (`inject`, `input`, `model`, `output`, `signal`, `computed`, `linked-signal`) only when its initializer calls a function imported from `@angular/core`:

- Named, aliased (`signal as ngSignal`) and namespace (`ng.signal()`) imports all work.
- `input.required()` and `model.required()` count as `input` and `model`.
- Parenthesized, non-null-asserted, `as`-cast and optional calls (`(signal)(1)`, `signal!(1)`, `signal?.(1)`) are recognized.
- A local function that happens to be called `signal`, or a same-named import from another module, makes an ordinary `property`.
- Type-only imports are ignored.
- Decorators such as `@Input()` and `@Output()` are not inspected. A decorated field is categorized by its initializer.

Members that are not Angular fields fall into these categories:

| Category          | Members                                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index-signature` | `[key: string]: T`                                                                                                                                                                      |
| `property`        | Any other instance field (`accessor` fields are categorized by their initializer too), including fields initialized by other calls (`effect()`, `toSignal()`, `viewChild()`, `new X()`) |
| `constructor`     | The constructor and its overload signatures                                                                                                                                             |
| `static-property` | Static fields                                                                                                                                                                           |
| `static-block`    | `static { ... }` blocks                                                                                                                                                                 |
| `lifecycle`       | `ngOnChanges`, `ngOnInit`, `ngDoCheck`, `ngAfterContentInit`, `ngAfterContentChecked`, `ngAfterViewInit`, `ngAfterViewChecked`, `ngOnDestroy`                                           |
| `method`          | Other instance methods, getters and setters                                                                                                                                             |
| `static-method`   | Static methods, getters and setters                                                                                                                                                     |

## Sorting

Members are sorted by group (in the configured order), then by visibility, then by name:

- **Visibility:** no accessibility keyword counts as `public`, and a `#name` counts as `private`. The rule never rewrites an accessibility keyword.
- **Names:** comparison ignores case and the `#` of a private name. Exact ties fall back to code-point order, then to source order.
- **Source order:** a group with `order: "source"` (the default for lifecycle hooks) keeps its members in source order after visibility. The internal order of lifecycle hooks is left to `@angular-eslint/sort-lifecycle-methods`.
- **Getter and setter pairs** and **overload signatures** share a name, so they stay together in source order.

## Spacing

Blank lines follow `newlinesBetween` and `newlinesWithin` (see [Options](#options)). They are checked once the members are in order, so a class is first reported for its order and then for its spacing:

- With the default `groups`, the constructor, static-block, lifecycle, method and static-method groups use one blank line between members, and every other group uses none.
- Under `always`, a missing blank line is reported as `missingBlankLine`, and two or more as `extraBlankLine`. Under `never`, any blank line is reported as `extraBlankLine`.
- An overload signature always stays directly above the next signature or the implementation, whatever the policy.

## Initialization safety

Field initializers run in source order: instance ones when an instance is constructed, static ones and static blocks when the class is defined. The preferred order is therefore a priority, not the final order. The rule asks the analyzer which pairs of members may observe each other, keeps those pairs in source order, and otherwise follows the preferred order as closely as it can. See [Ordering](../packages/class-analyzer/README.md#ordering) and [How the analysis works](../packages/class-analyzer/README.md#how-the-analysis-works) for the details.

```ts
class Example {
	protected readonly defaultSelection = "first";
	private readonly selected = signal(this.defaultSelection); // stays below defaultSelection
}
```

### Angular assumptions

The analyzer knows nothing about Angular. The rule tells it what to assume about `@angular/core` calls ([`angular-assumptions.ts`](../packages/angular/src/rules/ordered-class-members/angular/angular-assumptions.ts)):

- **Signal factories:** `signal()`, `computed()`, `linkedSignal()`, `input()`, `input.required()`, `model()`, `model.required()`, and the signal queries (`viewChild()`, `viewChildren()`, `contentChild()`, `contentChild.required()`, `contentChildren()`). Creating one is assumed not to observe initialization order. Functions passed to it are deferred: the body of `computed()` or `linkedSignal()`, `signal()`'s `equal`, `input()`'s `transform`. Calling the resulting field (`this.count()`) runs only those functions and reads signal state.
- **Order-insensitive factories:** `inject()` and `output()`. These are assumed not to observe initialization order either. `inject()` is trusted even though it may construct a service.
- **Every other call is unknown code.** That includes `effect()`, `toSignal()`, `resource()` and `untracked()`: such a call is a side effect, and functions passed to it are assumed to run right away.

The arguments of every call are still analyzed: `signal(this.defaultSelection)` reads `defaultSelection`.

### What keeps two members in order

In practice, two initializers keep their source order when one of them:

- reads or writes a member the other defines, reads or writes. Reads made through `this.method()`, getters and setters count, transitively.
- calls a deferred function right away (`total = this.doubled()`), or hands it on to code that may call it (`untracked(this.doubled)`, `[0].map(this.callback)`). It then takes on that function's reads.
- has side effects (an unknown call, a call of a field holding an unknown function, `new`) while the other also has side effects or reads mutable outside state. Mutable outside state is a global, a property of another object, or a binding that is reassigned somewhere.
- lets `this` escape (`register(this)`, `const self = this`, a direct `eval`), uses `super`, accesses a member dynamically (`this[key]`), or touches a member this class does not declare.

Methods, accessors and the constructor run nothing while fields initialize, so they move freely. Instance and static initializers never constrain each other, and a static block keeps its order relative to every static field.

## When the autofix is withheld

The rule still reports these cases, but leaves the code unchanged:

- **`initializationOrder`:** the preferred order would move a member above an earlier one, but their initializers may interact through side effects or an escaping `this`. Reorder by hand when you know the swap is safe. A pair whose order is fixed by a direct dependency is not reported, since no order could swap it.
- **`unordered`, `missingBlankLine` or `extraBlankLine` for members that cannot be moved as whole lines.** This happens when:
    - two members share a line;
    - something other than whitespace or comments separates two members, such as a stray `;`;
    - a computed key could run code;
    - a field without a semicolon would merge with its new neighbour through automatic semicolon insertion, including a field named `get`, `set`, `static` and similar.

All fixable reports in one class share a single rewrite of its member list:

- `oxlint --fix` applies it once but still prints the other reports from that run and exits with status 1. A second run is clean.
- A class nested in a member initializer is rewritten in a second pass, since its fix overlaps the outer one.

## What moves with a member

A member moves together with:

- its decorators;
- its leading comments (line, block and JSDoc), up to the previous member;
- comments on the same line after it.

A comment on the line of the class's `{`, and comments after the last member, stay where they are.

## Limitations

The analysis is conservative, but it is not a proof that a reorder is unobservable. These limitations matter most for Angular code:

- **Decorators** move with their member, and their evaluation order is assumed not to matter.
- **Subclass overrides:** methods are analyzed as this class declares them, so an override in a subclass is not considered.
- **Foreign objects:** getters, implicit conversions and the iteration protocol on other objects are assumed to have no side effects.
- **`declare` and `abstract` properties** are treated as plain fields of the class, although another class may implement them as accessors.
- **Imports** are trusted to be stable, although an ES import is a live binding that the exporting module may reassign.
- **Exceptions** are not considered: a swap can decide whether a side effect runs before an initializer that throws.
- **Angular APIs** listed above are trusted as described, including `inject()`.

The analyzer's [deliberate limitations](../packages/class-analyzer/README.md#deliberate-limitations) give the complete list.
