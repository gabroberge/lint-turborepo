# @gabroberge/typescript-class-analyzer

Initialization-order analysis for TypeScript classes. Given a class body from an ESTree / oxlint AST, it tells which members run code while the class is set up, what each field initializer may read, write, call or affect, and which pairs of members must keep their source order. A lint rule that sorts class members (for example the Angular `ordered-class-members` rule) uses it to reorder only where the analysis finds no interaction. That is a conservative approximation under the assumptions listed in [Deliberate limitations](#deliberate-limitations), not a proof that a swap is unobservable. The analysis knows nothing about any framework: what it may assume about outside calls is supplied by the caller through `ClassAssumptions`.

## Install

```bash
npm install @gabroberge/typescript-class-analyzer
```

## Usage

```ts
import type { ClassAssumptions } from "@gabroberge/typescript-class-analyzer";
import {
	analyzeMembers,
	blockedMoves,
	constrainedOrder,
	initializationConstraints
} from "@gabroberge/typescript-class-analyzer";

// `cell()` and `derive()` from our store library create callable, signal-like values.
const assumptions: ClassAssumptions = {
	assumeCall: (call) =>
		call.callee.type === "Identifier" && ["cell", "derive"].includes(call.callee.name) ? "signal-factory" : null
};

// Inside an oxlint rule visitor, with `context.sourceCode` and a `ClassBody` node:
const members = analyzeMembers(body);
// `preferred(left, right)` is the caller's comparison: groups, visibility, names...
const conflictAt = initializationConstraints(context.sourceCode, body, members, assumptions);

const order = constrainedOrder(members, preferred, (earlier, later) => conflictAt(earlier, later) !== "none");
for (const { earlier, later } of blockedMoves(members, preferred, conflictAt)) {
	// Report: `later` would move above `earlier`, but their side effects may interact.
}
```

A real consumer should resolve the callee through scope analysis (an import of a known module, aliases and namespaces included) rather than by name alone, so a local function that happens to share a name stays unknown code.

The API is typed with the ESTree and `SourceCode` types of `@oxlint/plugins` (installed as a dependency). In an ESLint rule, parse with `typescript-eslint` and cast `context.sourceCode` and the `ClassBody` node to those types; the analysis only uses `getScope` and the scope manager's references, which both provide.

## API

| Export                      | Role                                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `analyzeMembers`            | Describe every element of a class body: key, timeline, visibility, `static`, overload                                                                                 |
| `initializationConstraints` | A memoized `(earlier, later) => Conflict` lookup: how two members, in source order, constrain each other                                                              |
| `constrainedOrder`          | A greedy topological order: the preferred free item goes next, constrained pairs keep their source order                                                              |
| `blockedMoves`              | Pairs the preferred order would swap but an `uncertain` conflict holds back                                                                                           |
| `hasInertKey`               | Whether a member's key is static or a computed literal, name or dotted name, assumed to run no code (see below)                                                       |
| `NO_ASSUMPTIONS`            | Assumptions that treat every call outside the class's own code as unknown: a side effect that runs its callbacks right away                                           |
| `ClassAssumptions`          | `{ assumeCall(call): CallAssumption \| null }`, what the caller knows about outside calls                                                                             |
| `CallAssumption`            | `"factory"` or `"signal-factory"`                                                                                                                                     |
| `AnalyzedMember`            | `index`, `key` (`#name` for a private name, `null` for a computed key that is not a string or number literal), `node`, `overload`, `static`, `timeline`, `visibility` |
| `Conflict`                  | `"definite"`, `"uncertain"` or `"none"`                                                                                                                               |
| `Timeline`                  | `"instance"` or `"static"`                                                                                                                                            |
| `Visibility`                | `"public"`, `"protected"` or `"private"`                                                                                                                              |
| `BlockedMove`               | `{ earlier, later }`                                                                                                                                                  |

`initializationConstraints` expects the members returned by `analyzeMembers(body)` for the same body, or records extending them. The source code object must provide scope analysis (`context.sourceCode` in an oxlint or ESLint rule).

## How the analysis works

### Timelines

Field initializers run in source order. Instance initializers run when an instance is constructed; static initializers and static blocks run once, when the class is defined. These are two separate timelines, and members of different timelines never constrain each other. Methods, accessors, the constructor, index signatures, `declare` fields and abstract members run nothing while the class is set up: their timeline is `null`, and they never constrain an initializer. Their position can still matter through a computed key (see `hasInertKey`) or a decorator.

### Eager and deferred code

An initializer's own code runs eagerly, and so does everything it reaches: a method it calls through `this.method()`, a getter or setter it touches, transitively, with each method body analyzed as this class declares it. Cycles are followed once. An immediately invoked function literal is analyzed in place.

A function literal that is only stored is deferred: an arrow function assigned to a field, a function placed in an object or array literal, or a function passed to a call assumed to be a `factory` or `signal-factory`. Deferred code does not constrain the order by itself.

A function passed to unknown code is assumed to run right away, so its reads and side effects count for the initializer that passed it.

### Stored function references

A field holding a function literal, or the result of a `signal-factory` call, is a function field: calling it runs only code the analysis can see. An initializer that calls such a field right away (`total = this.doubled()`) takes on the reads and effects of the functions stored there. So does one that reads the field and hands it on (`run(this.callback)`), because the receiver may call it.

Calling any other field (`this.service()`, where `service` holds the result of a plain `factory` or of unknown code) is a side effect, since its value may be a function from anywhere.

### Side effects, outside state and opaque code

Beyond the member keys it reads, writes and calls, each initializer carries three flags. These per-initializer records are internal to the analysis; the public result is the `Conflict` between two members.

- `sideEffects`: it may change state outside the instance. Calling unknown code, calling a field whose value is not a known function, `new`, `await`, `yield`, tagged templates, dynamic `import()`, `delete`, and assigning to anything but the instance or a local binding all count.
- `external`: it reads mutable outside state: a global, a property of another object, or a binding that is reassigned somewhere (`let`, `var`, a parameter, even a function declaration). Imports, enums, `const` bindings and never-reassigned declarations are stable (an import is trusted even though ES imports are live bindings; see the limitations).
- `opaque`: it may touch any member. `this` escapes (`register(this)`, `const self = this`, the class name used as a value in static code), `super` is used, a member is accessed dynamically (`this[key]`), a member this class does not declare is touched (an inherited one), or a nested class, enum or namespace is declared.

### Definite and uncertain conflicts

Two initializers of the same timeline have a `definite` conflict when one reads or writes a member the other defines, or when one writes a member the other reads or writes. Swapping them may change what one of them observes.

They have an `uncertain` conflict when either one is opaque, when both have side effects, or when one has side effects and the other reads outside state. The swap may or may not be observable.

Otherwise the conflict is `none`. A sorter normally keeps both `definite` and `uncertain` pairs in source order; `blockedMoves` lists the `uncertain` pairs that a preferred order would have swapped, which a lint rule can report without an autofix. A pair already chained by `definite` conflicts is not listed, since no order could swap it.

### Ordering

`constrainedOrder` turns a preferred order and a constraint relation into a final order. Every pair the relation pins (normally every `definite` or `uncertain` conflict) keeps its source order; everything else follows the preference. It is a greedy topological sort: among the members whose constraints are satisfied, the preferred one goes next. A member therefore leaves its preferred place only as far as a constraint forces it; for example, a field that reads an earlier field stays below it, but moves up to just below it if the preference ranks it higher.

Pinned pairs never change relative order, so with a symmetric relation (as conflicts are) the result is a fixed point: running the analysis and the sort again on the reordered class returns the same order. A lint rule built on it does not keep moving the same members on later runs.

### Static blocks and computed keys

A static block can do anything, so it is opaque: it has at least an `uncertain` conflict with every static field. A field whose computed key does not resolve to a string or number literal is opaque too. Computed keys are evaluated in source order when the class is defined. `hasInertKey` is true for a non-computed key or a computed literal, identifier, non-computed member chain (`[Keys.name]`) or expression-free template; anything else may run code, so moving it could reorder that code. An inert key is still assumed to trigger no getter or conversion, and it can read a binding that a non-inert key or a decorator changes: move inert keys freely only when no member of the class has a non-inert key.

### Assumptions

Without assumptions (`NO_ASSUMPTIONS`), every call is unknown code (a side effect whose function arguments run right away), except the code the analysis can see: the class's own methods, accessors and function fields called through `this`, and immediately invoked function literals. `ClassAssumptions.assumeCall` lets a caller declare what it knows about outside code, typically a framework's APIs:

- `"factory"`: the call neither observes nor changes state another initializer could depend on. Function literals passed to it are stored, not run. Its other arguments are still evaluated and analyzed, so `provide(this.config)` still reads `config`. Its callee is analyzed too unless it is a plain name (`provide`, `lib.provide`), so `this.lib.make()` still reads `lib`.
- `"signal-factory"`: everything a `factory` is, and fields holding its result are function fields. Calling one runs the functions given to the factory, whose effects count, and counts as reading outside state rather than as a side effect: it conflicts with side-effecting initializers but not with other reads.

### Deliberate limitations

The analysis is a conservative approximation. A `none` conflict means that no interaction was found under these assumptions, not that a swap is proven unobservable:

- Decorators are not analyzed. They are assumed to move with their member, and their evaluation order is assumed not to matter.
- Members are analyzed as this class declares them. Overrides in a subclass are not considered, and a `declare` or `abstract` property is treated as a plain field of this class, although a base class or a subclass may implement it as an accessor.
- Getters, implicit conversions (`toString`, `valueOf`, `Symbol.toPrimitive`) and the iteration protocol (spread, `for...of`) on other objects are assumed to have no side effects; they only count as reading outside state.
- Imported bindings are trusted to be stable. An ES import is a live binding, so an initializer that calls into a module which reassigns one of its exports can change what another initializer reads from that import.
- Exceptions are not considered. An initializer that may throw (a property of `undefined`, a mixed `bigint` operation) is not necessarily ordered against a side-effecting one, so a swap can decide whether that side effect runs before construction fails.
- Member keys are assumed unique, as TypeScript enforces (apart from overloads and getter / setter pairs). Reordering duplicates would change which definition wins.
- Field semantics are those of ECMAScript (`[[Define]]`, TypeScript's `useDefineForClassFields`). Under the legacy assignment semantics, an initializer may run an inherited setter.
- A function, once it may run, is analyzed as if it ran to completion; control flow inside it is not considered. `this` inside any function the analysis follows is taken to be the analyzed object.
- Calls covered by a `ClassAssumptions` answer are trusted entirely. A wrong assumption can hide a real dependency.
