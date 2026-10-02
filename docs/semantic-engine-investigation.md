# Semantic engine investigation: from `ordered-class-members` to a reusable analyzer

This document records an investigation. It describes what the `angular/ordered-class-members` rule and its analyzer
(`packages/class-analyzer`, published as `@gabroberge/typescript-class-analyzer`) built, how sound the analysis is, what the
tests establish, and what the platform offers. It ends with the direction the implementation will take. It does not
describe an implemented engine.

All file references are repo-relative and describe the code **before the refactor, at commit `be8f708`** on branch
`angular-ordered-class-members`. Abbreviations: `CA/` = `packages/class-analyzer/src/`, `ES/` = `packages/estree/src/`,
`NG/` = `packages/angular/src/rules/ordered-class-members/`.

## 1. Context

`angular/ordered-class-members` sorted the members of Angular classes into a canonical order (categories, visibility,
alphabetical) and autofixed the result. Reordering class fields is not semantics-preserving: field initializers run in
source order, so moving `b = this.a + 1` above `a = 1` changes behaviour. The analyzer was built to decide which
initializers may be swapped safely.

The rule was abandoned for a reason unrelated to the analysis: a canonical ordering conflicts with intentional semantic
grouping. Authors group a signal with the `computed` values derived from it, an injected service with the fields that use
it, or an input with its transform. A global ordering policy fights that grouping, and the safety analysis can only
restrict the damage, not justify the policy.

The analysis, however, extracts facts that are useful independently of ordering: which code reads and writes which
members, which functions run now and which are stored for later, where analysis loses precision and why. The analysis may
be more valuable than its only consumer. The question is how to evolve it into a reusable TypeScript static-analysis
engine.

## 2. What was built

About 900 lines of non-test TypeScript: `walk/` (26 files), `effects/` (12), `conflict/` (4), `order/` (3), `member/`
(10), `assumptions/` (3). The public API (`CA/index.ts`) exports only `analyzeMembers`, `initializationConstraints`,
`constrainedOrder`, `blockedMoves`, `hasInertKey`, `NO_ASSUMPTIONS` and their types. `Effects`, summaries, `MemberKind`,
the walker and `collectEffects` are internal; the only public semantic output is a three-valued `Conflict` between two
members.

### 2.1 Pipeline

```
ClassBody
  analyzeMembers ──────────────────────────► AnalyzedMember[]                  syntax facts
  initializationConstraints(sourceCode, body, members, assumptions)
    initializationEffects
      per timeline {instance, static}:
        timelineTable ─────────────────────► Map<key, MemberKind>             resolved facts + assumption policy
        invocationSummaries ───────────────► Map<key, Effects>                per-key summaries
          collectEffects(root, scope, flow) ► { effects, deferred[] }         AST → Effects transfer (Walker)
      per initializer: collectEffects(value).effects, then resolveEffects(direct, summaries)
                                         ──► (Effects | null)[]               resolved per-member summary
    conflictTable ─────────────────────────► (earlier, later) => Conflict     policy
  constrainedOrder(items, compare, precedes) ► Item[]                         ordering policy (generic)
  blockedMoves(members, compare, conflictAt) ► BlockedMove[]                  reporting policy
  hasInertKey(node) ───────────────────────► boolean                          syntactic heuristic (fixer gate)
```

### 2.2 Intermediate representations

| IR                                       | Definition                                                            | Represents                                                                                                                                                               | Nature                                  |
| ---------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| `AnalyzedMember`                         | `CA/member/analyzed-member.ts`                                        | One class element: `index`, `key`, `node`, `overload`, `static`, `timeline`, `visibility`                                                                                | Syntax fact                             |
| member `key`                             | `CA/member/member-key.ts`                                             | Runtime key: identifier name, `#name`, or `String(literal)`; `null` for static blocks, index signatures, other computed keys                                             | Syntax fact (normalized)                |
| `Timeline`                               | `CA/member/timeline.ts`, `member-timeline.ts`                         | `instance`, `static` or `null`: which setup phase runs this member. Methods, abstract and `declare` members are `null`                                                   | Syntax fact with class-init meaning     |
| `MemberKind`                             | `CA/effects/member-kind.ts`, `member-kind-of.ts`, `field-kind.ts`     | `accessor`, `field`, `function-field`, `method`, `parameter`: what touching a key does                                                                                   | Syntax fact + assumption policy         |
| timeline table                           | `CA/effects/timeline-table.ts`                                        | Keys existing in one timeline, including constructor parameter properties. Body-less signatures excluded. Last write wins for duplicate keys                             | Resolution table (class-local symbols)  |
| `ClassAssumptions` / `CallAssumption`    | `CA/assumptions/*.ts`                                                 | Oracle `assumeCall(CallExpression) → "factory" \| "signal-factory" \| null`                                                                                              | External policy, trusted                |
| `AnalysisScope`                          | `CA/walk/analysis-scope.ts`                                           | Context: assumptions, `classId`, `kinds`, `owner` (a source range: bindings declared inside it are local), `sourceCode`, `timeline`                                      | Context                                 |
| `Walker` + `NODE_HANDLERS`               | `CA/walk/walker.ts`, `node-handlers.ts`                               | Mutable traversal state and per-node transfer functions. Unhandled non-`TS*` nodes fall back to a generic child walk; unhandled `TS*` nodes are skipped                  | Abstract interpretation encoded as code |
| `Effects`                                | `CA/effects/effects.ts`                                               | `calls`, `reads`, `writes` (sets of member keys) and booleans `external`, `opaque`, `sideEffects`, for one evaluation root                                               | May-summary, flow- and path-insensitive |
| `CollectedEffects`                       | `CA/walk/collect-effects.ts`                                          | `{ effects, deferred }`: `deferred` holds function literals that were stored rather than run                                                                             | Facts + escape list                     |
| invocation summaries                     | `CA/effects/invocation-summaries.ts`                                  | Per key: effects of running that key. Method/accessor: its body (getter and setter merged). Field: its initializer's `calls` plus deferred literals. Constructor skipped | Summary ("run once, to completion")     |
| resolved effects                         | `CA/effects/resolve-effects.ts`                                       | Direct effects joined with summaries of every key reachable through `calls` (worklist, cycles visited once)                                                              | Transitive may-closure                  |
| per-member effects `(Effects \| null)[]` | `CA/effects/initialization-effects.ts`                                | `null` = no timeline; opaque for static blocks and `null` keys; empty for fields without initializer                                                                     | Resolved summary + class-init policy    |
| `Conflict` and conflict table            | `CA/conflict/conflict.ts`, `conflict-between.ts`, `conflict-table.ts` | `definite`, `uncertain` or `none` for an ordered pair; memoized; different timelines never conflict                                                                      | Policy / decision                       |
| constrained order                        | `CA/order/constrained-order.ts`                                       | Greedy Kahn topological sort over pinned pairs, choosing the preferred ready item                                                                                        | Ordering policy (generic over `Item`)   |
| `BlockedMove`                            | `CA/order/blocked-moves.ts`                                           | Preferred swaps withheld by an `uncertain` conflict not already implied by a chain of `definite` ones                                                                    | Reporting policy                        |
| `hasInertKey`                            | `CA/member/has-inert-key.ts`                                          | Syntactic guess that a computed key runs no code                                                                                                                         | Heuristic policy                        |

Internal predicates with no persistent IR: `bindingKind` (`local` / `stable` / `mutable`), `isSelf`, `isNamedReference`,
`isDirectEval`, `accessKey`, `isSignature`, `parameterPropertyName`.

## 3. Semantic facts and how they are derived

### 3.1 Accesses to the analyzed object

- **Self detection** (`CA/walk/is-self.ts`): `this` always; in static code also an identifier whose _name_ equals the
  class name and is not a local binding. The reference is not checked to resolve to the class binding.
- **Key resolution** (`CA/walk/access-key.ts`): private name, non-computed name, numeric literal, or a static string
  (string literal or expression-free template). Anything else is `null`.
- **Reads and calls** (`CA/walk/use-member.ts`), by member kind:

| Kind                  | Effect of a read                                  | Additional effect when invoked |
| --------------------- | ------------------------------------------------- | ------------------------------ |
| unknown or `null` key | `opaque`                                          | `sideEffects`                  |
| `accessor`            | `calls += key` (no `reads`)                       | `sideEffects`                  |
| `field`               | `reads += key`, `calls += key` (value may be run) | `external`, `sideEffects`      |
| `function-field`      | `reads += key`, `calls += key`                    | `external`                     |
| `method`              | `calls += key` (read or invoked alike)            | none                           |
| `parameter`           | `reads += key`                                    | `sideEffects`                  |

- **Writes** (`CA/walk/write-member.ts`, `visit-member-target.ts`): unknown key gives `opaque`; an accessor gives
  `calls += key` (the setter); every other kind, including `method`, gives `writes += key`. Compound assignment and
  update expressions record a use first.

### 3.2 Outside state

`bindingKind` (`CA/walk/binding-kind.ts`) resolves an identifier through `resolveVariable` (`ES/scope/resolve-variable.ts`:
`getScope`, then a linear search of `scope.references`). It then classifies by `defs[0]` only:

- unresolved or def-less: `stable` for `undefined`, `NaN`, `Infinity`, otherwise `mutable` (globals);
- `local` if the definition name's range lies inside the owner member's range;
- `stable` for imports, `TSEnumName`, `const`, and any binding never written after initialization;
- `mutable` for parameters and reassigned bindings.

A mutable read sets `external`; a write to a non-local binding sets `sideEffects`. The `Variable` itself is discarded.
Any property read on a non-self object sets `external`; invoking it also sets `sideEffects`. Spread and `for…in`/`for…of`
set `external`.

### 3.3 Unknown behaviour

- **`sideEffects`**: unknown calls, any `new`, invoking a foreign member or plain field, writes to foreign objects or
  non-local bindings, `delete`, tagged templates, `import()`, `await`/`yield`, `super(...)`, direct `eval`.
- **`opaque`**: `this` in value position (escape), the class object as a value in static code, `super`, nested
  classes/enums/namespaces, unknown member keys (inherited members, the other timeline, signatures, dynamic `this[k]`),
  direct `eval`, `new Self()` in static code, unsupported assignment targets, static blocks, computed-key fields.

These are single booleans: which call, which global, and which reason caused them is not recorded.

### 3.4 When code runs

`walker.visit(node, flow)` with a function literal defers it (pushes it to `deferred`) when `flow` is set, and analyzes it
in place otherwise (`CA/walk/collect-effects.ts`). `flow` is propagated only through value positions: conditional
branches, logical operands, array elements, object property values, the last sequence expression, transparent TS
wrappers, the root of a field initializer, and arguments of an assumed call. Everywhere else the function is treated as
executed: nested function declarations, arrows assigned to locals, returned functions, arguments to unknown calls,
IIFEs. This eager/deferred distinction is the most reusable idea in the analyzer.

### 3.5 Assumptions

An assumed `factory`/`signal-factory` call (`CA/walk/visit-call.ts`) is not itself an effect; its function arguments are
deferred; a callee that is not a plain dotted name is still walked. `signal-factory` also makes the receiving field a
`function-field`, so invoking it is an external read without side effect. The only real implementation,
`NG/angular/angular-assumptions.ts`, maps import-resolved `@angular/core` APIs (aliases, namespaces, `.required`) to
these two answers. `new` expressions never consult assumptions.

### 3.6 Direct vs transitive, and conflicts

`collectEffects` yields direct effects of one root; `resolveEffects` joins summaries of every key reachable through
`calls`. Afterwards the two are merged, so which effect came from which callee is lost, and `calls` mixes direct and
transitive keys. Summaries are computed once, not iterated to a fixpoint; this is sound only because they are plain set
unions.

`conflictBetween` (`CA/conflict/conflict-between.ts`):

- `definite` if one side reads or writes the other's key, or the write set of one overlaps the read or write set of the
  other;
- otherwise `uncertain` if either side is opaque, or `sideEffects` meets `sideEffects` or `external`;
- otherwise `none`.

All facts are _may_ facts. `definite` grades the precision of the evidence (a keyed overlap), not the certainty of an
interaction. `none` is the only output soundness depends on. Ordering constraints follow: both `definite` and
`uncertain` pin a pair to source order; `constrainedOrder` sorts within those pins; `blockedMoves` reports swaps withheld
only by `uncertain` evidence, without a fix.

## 4. Reusable vs class-initialization-specific vs ordering policy

| Component                                            | Reusable                      | Class-init specific | Ordering policy | Notes                                                                             |
| ---------------------------------------------------- | ----------------------------- | ------------------- | --------------- | --------------------------------------------------------------------------------- |
| Walker skeleton, handler table, generic fallback     | Yes (pattern)                 |                     |                 | Handlers hard-code `isSelf` + `kinds`; must be parameterized on tracked locations |
| `flow` eager/deferred distinction                    | Yes                           |                     |                 | Generalizes to evaluation triggers                                                |
| `bindingKind`                                        | Yes, if it returns `Variable` |                     |                 | Range-based locality must become a scope boundary                                 |
| `resolveEffects` worklist closure                    | Yes                           |                     |                 | Generic over ids; loses paths                                                     |
| `Effects` lattice (`merge`, `empty`, `opaque`)       | Shape only                    |                     |                 | Payload lacks locations, targets, reasons                                         |
| `ClassAssumptions`                                   | As a seam                     |                     |                 | Too narrow: two answers, `CallExpression` only                                    |
| `memberKey`, visibility, static, overload            | Yes                           |                     |                 | Declaration facts                                                                 |
| `MemberKind`, `useMember`, `writeMember`, `isSelf`   | Partly                        | Yes                 |                 | Self-object key model                                                             |
| `Timeline`, `timelineTable`, `initializationEffects` |                               | Yes                 |                 | Field-initializer roots, static/instance split                                    |
| `conflictBetween`, `conflictTable`                   |                               | Yes                 | Yes             | Encodes [[Define]] order and flag heuristics                                      |
| `hasInertKey`                                        | As "computed key has effects" | Yes                 | Fixer gate      |                                                                                   |
| `constrainedOrder`, `blockedMoves`                   |                               |                     | Yes             | Generic, but only meaningful for ordering                                         |

## 5. External dependencies and unused platform capabilities

### 5.1 What the analyzer depends on

- **AST**: ESTree types from `@oxlint/plugins` (types only), TS-ESTree flavour (`declare`, `accessibility`,
  `TSParameterProperty`). Relies on `node.parent` and `range`. Helpers from `@gabroberge/oxlint-estree`
  (`unwrapExpression`, `staticString`, `isFunctionNode`, `resolveVariable`).
- **Scope manager**: only `getScope`, `Scope.references[].identifier/.resolved`, `Variable.defs[0]` and
  `Variable.references[].isWrite()/init`. Under both ESLint and oxlint this is the typescript-eslint scope manager:
  oxlint bundles it (`initTsScopeManager()` calls typescript-eslint's `analyze`), and a dump of scopes, references and
  flags matched ESLint line for line.
- **No type checker**: no `parserServices`, no `ts.Program`. Function-ness is syntactic or assumed.
- **No Angular** in the analyzer: framework knowledge enters only through `ClassAssumptions`.
- **Runtime**: only a `SourceCode` object; no rule context, no reporting, no visitors.

### 5.2 Capabilities not yet used

| Capability                                                           | Availability                                                                                                                                                                                               | Use for an engine                                                                      |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Scope tree (`upper`, `childScopes`, `variableScope`, `block`)        | Both runtimes. Every field initializer has its own `class-field-initializer` scope                                                                                                                         | Scope boundaries instead of source ranges                                              |
| `through` references                                                 | Both runtimes at runtime; not declared in `@oxlint/plugins` types                                                                                                                                          | Free variables / closure captures per function                                         |
| Reference flags `isRead/isWrite/init/writeExpr`, `from`              | Both, declared                                                                                                                                                                                             | Keyed binding reads and writes with locations                                          |
| `isTypeReference/isValueReference`, `isTypeVariable/isValueVariable` | Both at runtime; undeclared in oxlint types, need a guarded accessor                                                                                                                                       | Separating type-only from value dependencies                                           |
| `getDeclaredVariables`, `acquire`                                    | Both                                                                                                                                                                                                       | Declaration → variable/scope; a 10-line `getScope` matched ESLint on 60/60 identifiers |
| Code path events (`onCodePath*`, segments, loops, unreachable)       | ESLint and oxlint (undeclared in oxlint types), identical results in a probe; cost comparable to building scopes                                                                                           | Paths and reachability, consumed rather than re-implemented (ESLint's is ~2,500 LOC)   |
| Standalone parsing                                                   | `parseForESLint` + `linkParents` + `SourceCode`, as the tests already do; globals need `applyLanguageOptions` + `finalize`. `Linter.verify` with a collector rule gives code paths (~30 ms per small file) | A thin `analyzeSource` adapter, not the core                                           |
| Module syntax                                                        | Import/export declarations, `importKind` on declaration and specifier, re-exports, `import()`                                                                                                              | Per-file import/export facts without resolution                                        |
| Type information                                                     | ESLint with `parserServices.program` only; oxlint JS plugins receive `parserServices = {}`. Cold typed parse ~1.5 s on a 3-file NestJS project                                                             | Would split ESLint and oxlint feature sets; at most an optional oracle                 |

Typed parsing did resolve `this.users.load()` to its declaration across files. Without types, a constructor parameter
property's type annotation resolves through scope to an `ImportBinding`, which covers the dominant Angular/NestJS
injection idioms once a module resolver exists, but not inferred, generic or token-typed cases.

## 6. Soundness classification

Purpose for soundness: `none` must never be returned for a pair whose swap can change behaviour. **S** = sound
over-approximation. **C** = conservative approximation with known holes. **I** = explicitly incomplete (documented in the
README). **U** = finding not documented anywhere before this investigation.

### 6.1 Sound over-approximations

| Construct                                                          | Treatment                                                       |
| ------------------------------------------------------------------ | --------------------------------------------------------------- |
| Self member read/write by static key                               | Keyed reads/writes (assuming unique keys)                       |
| Body-less signatures, abstract methods, inherited members, `super` | Opaque when touched                                             |
| `this` escape (`f(this)`, `const s = this`, `#x in this`)          | Opaque                                                          |
| Unknown calls                                                      | Side effect; function arguments run now                         |
| Nested function declarations, stored or returned functions         | Treated as executed                                             |
| `await`/`yield`, static blocks, direct `eval`                      | Side effect / opaque                                            |
| Mutable outer bindings                                             | `external` on read, `sideEffects` on write                      |
| Different timelines                                                | Never conflict                                                  |
| Getter/setter pair                                                 | One merged summary per key (sound, but a precision loss, **U**) |

### 6.2 Conservative approximations with known holes

| Construct                    | Treatment and hole                                                                                                                                                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dynamic `this[expr]`         | Opaque, but **`expr` is never walked** (`CA/walk/visit-member.ts`, `visit-member-target.ts` return before visiting the property). Its reads and side effects vanish; a non-invoked access is opaque without `sideEffects`. Safe for conflicts only because opaque implies at least `uncertain`. **U** |
| Parameter properties         | Readable/writable state with no defining member; timing of the constructor assignment not modeled. **U**                                                                                                                                                                                              |
| Class name in static code    | Name comparison; if resolution fails a shadowing binding is treated as self. **U**                                                                                                                                                                                                                    |
| Never-reassigned `let`/`var` | Stable; TDZ and read-before-init ignored. **U**                                                                                                                                                                                                                                                       |
| Redeclarations               | Only `defs[0]` inspected. **U**                                                                                                                                                                                                                                                                       |
| `new X()`                    | Side effect; assumptions never consulted (asymmetry with calls). **U**                                                                                                                                                                                                                                |
| `(this.m<T>)()`              | `TSInstantiationExpression` not unwrapped; unknown call. **U**                                                                                                                                                                                                                                        |
| Computed keys                | `null` key, opaque; key evaluation left to `hasInertKey`                                                                                                                                                                                                                                              |

### 6.3 Explicitly incomplete or unsound

| Construct                                                                                                                                                                                                                               | Finding                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method overwrite**                                                                                                                                                                                                                    | `this.m = …` records `writes += m`, but calling a method records only `calls += m`, and `conflictBetween` never compares `writes` with `calls`. The declared body is used as the callee summary. `a = (this.m = () => 1, 0); b = this.m();` with a pure `m` yields `none`. **U, unsound** |
| **`#x` vs `"#x"`**                                                                                                                                                                                                                      | `memberKey` and `accessKey` both produce `#x` for a private name and for the string key `"#x"`, so `this["#x"]` resolves to the private member instead of being opaque. **U** (rare)                                                                                                      |
| **Closure state treated as local**                                                                                                                                                                                                      | Locality is source-range containment in the owner member. State declared inside the member but outside a stored function persists across calls, yet writes to it are not side effects (reachable e.g. via a signal factory given an IIFE that returns a closure). **U**                   |
| **`for await`**                                                                                                                                                                                                                         | `visitIteration` sets only `external`; the suspension is not a side effect, unlike `await`. **U** (low impact under run-to-completion)                                                                                                                                                    |
| **JSX**                                                                                                                                                                                                                                 | Walked generically with no `external` or `sideEffects`; element creation is an unflagged call. **U**, unsound for JSX runtimes                                                                                                                                                            |
| **`this` in nested non-arrow functions**                                                                                                                                                                                                | Taken as the analyzed instance everywhere (I, README), which can attribute foreign accesses to self and miss an `external` read                                                                                                                                                           |
| **Timeline comment**                                                                                                                                                                                                                    | `CA/conflict/conflict-table.ts` says instance initializers run "long after the static ones"; `static a = new this()` contradicts it. Still safe because that `new` is opaque against all statics. **U** (comment wrong)                                                                   |
| **`constrainedOrder` fixed point**                                                                                                                                                                                                      | The documented fixed-point property needs a symmetric `precedes` _and a total `compare`_: ties are resolved by position in the `ready` array, which depends on push order. The totality requirement is not stated. **U**                                                                  |
| Subclass overrides, `declare`/abstract fields, decorators, foreign getters/conversions, throwing initializers, imports as stable, duplicate keys, legacy `[[Set]]` semantics, generators/async run to completion, assumed calls trusted | I (README limitations)                                                                                                                                                                                                                                                                    |
| Constructor body                                                                                                                                                                                                                        | Never analyzed; out of scope for field order, a gap for generality. **U**                                                                                                                                                                                                                 |

The holes in 6.2 and 6.3 are masked by the specific `conflictBetween` rules. A new consumer reading `Effects` directly
would inherit wrong facts.

## 7. Test characterization

`packages/class-analyzer`: 11 spec files, 199 tests, all passing. The Angular rule: 12 spec files, 304 tests (157 in
`ordered-class-members.spec.ts`, most about layout, categories and fixer stability).

| Group                                                                                     | Tests       | What it pins                                                             | Category             |
| ----------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------ | -------------------- |
| `effects/initialization-effects.spec.ts`                                                  | 46          | 33 pairwise conflict cases, 13 direct `Effects` record asserts           | general + class-init |
| `conflict/conflict-between.spec.ts`, `conflict-table.spec.ts`                             | 18 + 4      | Conflict truth table, timeline separation, memoization                   | policy               |
| `conflict/initialization-constraints.spec.ts`                                             | 11          | Table vs direct path, with/without assumptions, assumption-hook contract | general + class-init |
| `member/analyze-members.spec.ts`, `has-inert-key.spec.ts`                                 | 50 + 16     | Keys, visibility, static, overloads, timelines; computed-key inertness   | declaration facts    |
| `order/*.spec.ts`, `consumer-sort.spec.ts`, `consumer-stability.spec.ts`, `index.spec.ts` | 54          | Ordering, property tests over 300 seeds, vm equivalence                  | ordering policy      |
| `NG/.../angular-initialization`, `angular-assumptions`, `angular-api-of`                  | 9 + 22 + 18 | Assumption plug-in semantics, import-resolved callee classification      | general primitives   |

**Direct vs indirect.** Of about 53 general behavioural facts the tests establish, only about 15 are asserted on a fact
record: the 13 direct effect asserts (recursion terminating, writes, invoked function fields, eager vs deferred callbacks,
signal-factory calls, `new this()`, computed-key fields), the assumption-hook contract, declaration facts, and import
resolution. The rest are asserted only as a `none`/`definite`/`uncertain` result between two fields, or as a sort order.
Such a case often pins two facts at once (e.g. "unknown call vs a global" proves both that `log()` has a side effect and
that `someGlobal` is external) without saying which side carries which.

**vm semantic tests.** `evaluate-class` transpiles to ES2022 with `useDefineForClassFields`, runs in `node:vm`,
constructs once and compares own properties and a `record()` log before and after sorting; consumer-stability runs 40
random classes; the Angular rule's `heldBack` (7) and `programs` (2) cases do the same after linting. They establish
end-to-end soundness on specific programs, including constructs with no unit test (`.call`, a method stored in a field,
`map` with a stored arrow). Their limits:

- they test soundness, never precision; an over-conservative analysis passes trivially;
- `heldBack` cases do not assert that a move was attempted, so they can be vacuous;
- no vm result is tied to a specific fact, and one conservative fact can mask a wrong one;
- one construction, one observation; no method calls afterwards, no async; JSON loses `undefined`, `NaN`, symbols;
- `random-class` has 6 templates: no methods, getters, statics, writes, escapes, imports or forward reads.

**Gaps (implemented, never exercised):** `await`/`yield`, iteration, spread, `delete`, `import()`, tagged templates,
nested class/enum/namespace; destructuring and compound assignment targets; setter targets; optional chaining;
auto-accessor and `#private` reads and writes; nested functions inside methods treated as run; closure locals; free
functions and module-level code; foreign getters; writes to foreign objects; parameters as mutable bindings;
`IMMUTABLE_GLOBALS`; constructor bodies; source locations and uncertainty reasons (no test can assert either, since
`Effects` holds neither); decorators; multiple classes per file.

## 8. Existing capabilities vs substantial new analysis

| Capability                                                                                | Status                                                                |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Per-root effect walker with eager/deferred function values                                | Exists (class members only)                                           |
| Binding classification over the shared scope manager                                      | Exists (three-valued; discards the `Variable`)                        |
| Per-unit summaries with transitive closure                                                | Exists (class-local, context-insensitive, no paths)                   |
| External knowledge seam                                                                   | Exists (one narrow callback)                                          |
| Declaration facts for class members                                                       | Exists                                                                |
| Import-resolved callee identification                                                     | Exists Angular-side (`angular-api-of.ts`), promotable                 |
| Keyed facts with locations, targets and reasons                                           | Requires redesign of the payload; every handler changes               |
| Declaration identities beyond class keys (functions, bindings, exports)                   | New                                                                   |
| Units beyond field initializers (functions, methods, constructors, module top level)      | New, moderate                                                         |
| Call resolution through bindings (local functions, aliases) and a materialized call graph | New                                                                   |
| Fixpoint over recursive SCCs, transitive facts with paths                                 | New, moderate                                                         |
| Decision points (branches)                                                                | New, small (a 32-line prototype extracted 40,000 decisions in 179 ms) |
| Intra-procedural control flow (order, read-before-write, TDZ, exceptions)                 | New; consume code path events rather than re-implement                |
| Aliasing / points-to beyond `this`                                                        | New, substantial                                                      |
| Context-sensitive or parameterized summaries                                              | New, substantial                                                      |
| Cross-module resolution, export tables, live bindings                                     | New, substantial; needs a project host and a resolver                 |
| Type-informed resolution                                                                  | New; unavailable under oxlint JS plugins                              |

## 9. Conclusion and proposed direction

These are findings from the investigation; the implementation will follow.

1. **The ordering consumer is the wrong client, not the analysis.** The analysis models evaluation, resolution and
   uncertainty in a way no other part of the repository does, but it exposes them only as a pairwise conflict tuned for
   one policy.
2. **A small semantic core is sufficient as a base.** It consists of:
    - _declarations_ with stable identities (class members, functions, bindings), with private names distinguished from
      string keys;
    - _executable units_ (initializers, methods, accessors, constructors, functions, static blocks) with their
      _evaluation triggers_ (runs now, deferred, invoked by access, unknown);
    - _evidence-bearing direct facts_: accesses with resolved targets and source locations, uncertainty with an explicit
      reason, and deferred units.
3. **Everything else is a derived query layered on the core**: call relations, transitive facts with the path that
   produced them, SCCs over the unit graph, interference between two units (today's conflict, re-expressed), and decision
   points. Each fixes the corresponding loss in the current `Effects` collapse.
4. **Framework knowledge enters only through assumptions supplied by consumers.** The Angular mapping stays in the
   Angular package; the engine itself contains no framework names.
5. **Input is parser-agnostic**: an ESTree AST with the scope manager that both oxlint and ESLint `SourceCode` provide,
   restricted to the intersection of what both runtimes expose, with guarded access to undeclared fields.
6. **No type checker in the core.** Type information is unavailable to oxlint JS plugins and costly elsewhere; facts
   should state when a target is unresolved rather than depend on types.
7. **Scope is a single module.** Cross-module resolution is out of scope and documented as such; imports are reported as
   import facts, not resolved.
8. **The ordering APIs are dropped** (`constrainedOrder`, `blockedMoves`, `hasInertKey` as a fixer gate, the conflict
   API in its current form), together with their tests and helpers. Fact-producing inputs from the ordering tests
   (INVOICE, HANDED_CALLBACK, CLIENT, the `super` and derived-class cases) are worth harvesting as direct fact tests.
9. **The Angular rule is removed from this branch.** Its full history is preserved in commits `4e04680` (the rule) and
   `be8f708` (its documentation).
10. **The soundness findings in section 6 become explicit test cases** for the new core, so that holes previously masked
    by `conflictBetween` are either fixed or recorded as uncertainty with a reason.
