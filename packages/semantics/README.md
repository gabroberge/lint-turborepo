# @gabroberge/typescript-semantics

A semantic model of one TypeScript module, built from an ESTree AST with scope analysis (what ESLint and oxlint hand to a rule). It records:

- **what is declared**: classes, functions, variables, imports, class members;
- **what code runs as a whole**: executable _units_ such as field initializers, constructors, methods, functions and module code;
- **what each unit's own code does**: _facts_ that each carry the AST node they come from.

Queries derive relations from the facts: call edges, transitively reached facts, recursive groups, declaration dependencies, order interference and decision points. The engine reports facts and uncertainty. Deciding what they mean (a lint error, a complexity score, a refactoring hazard) is up to the consumer.

It is not a lint framework and contains no rule.

## Install

```bash
npm install @gabroberge/typescript-semantics
```

The API is typed with the ESTree and `SourceCode` types of `@oxlint/plugins`. In an oxlint rule, pass `context.sourceCode`. In an ESLint rule, or standalone, parse with `typescript-eslint`, build a `SourceCode` with the scope manager and parent links, and cast it to that type. The engine only uses the scope manager, `getScope`, `getDeclaredVariables` and `getText`.

## Usage

```ts
import {
	analyzeModule,
	cyclicComponents,
	declarationDependencies,
	reachedFacts,
	unitInterference
} from "@gabroberge/typescript-semantics";

const model = analyzeModule(context.sourceCode);

// Mutually dependent declarations.
const dependencies = declarationDependencies(model);
const ids = [...model.declarations.keys()];
const cycles = cyclicComponents(ids, (id) =>
	dependencies.filter((dependency) => dependency.from === id).map((dependency) => dependency.to)
);

// Everything a method may do, including through the methods it calls.
for (const { fact, path } of reachedFacts(model, methodUnitId)) {
	// `fact.node` is the evidence; `path` is the chain of call edges leading there.
}

// Could running these two units in the other order change anything?
const { kind, evidence } = unitInterference(model, firstUnitId, secondUnitId);
```

`src/consumer-example.spec.ts` is a complete standalone example. It builds a small report for a NestJS-style module: dependency cycles, shared mutable state, uncertain calls and branch counts per method.

### Assumptions

Without assumptions, a call into code outside the module is unknown code. It may do anything, including running the callbacks it receives right away. A consumer that knows a framework can say more:

```ts
const model = analyzeModule(sourceCode, {
	assumptions: {
		// Resolve the callee through scope analysis to an import of a known module, not by name alone.
		assumeCall: (call) => (isAngularImport(call.callee, ["signal", "computed"]) ? "signal-factory" : null)
	}
});
```

- `factory`: the call observes and changes no state that other code could depend on, and stores the functions passed to it without running them.
- `signal-factory`: a `factory` whose result is a signal-like callable. Calling a field that holds one reads only that value's own state.

The engine trusts assumptions. A wrong one can hide real behaviour.

## Model

### Declarations (`model.declarations`)

| Kind         | What                                                                                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `class`      | A module-level class declaration, or a class expression bound by a module `const`                                                                                                                                                    |
| `function`   | A module-level `function` declaration (`reassigned` when the binding is assigned again)                                                                                                                                              |
| `variable`   | A module-level `const`, `let` or `var`. Includes `reassigned` and `value` (`none`, `function`, `assumed-callable`, `other`)                                                                                                          |
| `import`     | An imported binding, with `source`, `imported` (`default`, `*` or a name) and `typeOnly`                                                                                                                                             |
| member kinds | `field`, `accessor-field`, `method`, `getter`, `setter`, `constructor`, `static-block`, `parameter-property`, `index-signature`. Each has its `class`, `key` (`null` when computed), `static`, `visibility`, `signature` and `value` |

Ids (`d0`, `d1`, …) are stable for a given source text. `qualifiedName` (`Cart.#items`) is for display only.

### Units (`model.units`)

A unit is code that runs as a whole. Each unit has:

- `kind`: `module`, `class-definition`, `field-initializer`, `static-block`, `constructor`, `method`, `getter`, `setter` or `function`.
- `trigger` (when it runs):
    - `module-evaluation`;
    - `class-definition`: static fields, static blocks, decorators and computed keys;
    - `instance-construction`: instance fields and the constructor;
    - `invocation`.
- `receiver` (what `this` is):
    - `instance` or `class` of a module class;
    - `none`;
    - `unknown`: a non-arrow function, whose `this` depends on the call.
- `declaration`, `parent` and `code` (the root nodes of its own code).

Every function literal is its own unit. An arrow function keeps the receiver of the unit around it. Other function literals get an `unknown` receiver.

### Facts (`unit.facts`)

Facts are direct: a fact belongs to the unit whose own code contains it, never to an enclosing unit.

- **`access`**: `read`, `write` or `call` of a target. Each target kind is precise about something different:
    - `member`: a key of a module class, reached through `this`, the class name, or another module class. `member` is `null` for an undeclared (inherited or dynamic) key. A `#private` name and a string key with the same spelling are distinct.
    - `binding`: a variable outside the unit. Its `scope` is `module`, `import`, `closure` or `global`. `mutable` is true when the binding can change after its declaration. Bindings local to the unit are not reported.
    - `property`: a property of another object (a service, a parameter, a global object), whose state belongs to someone else.

    A constructor starts with a `write` of each parameter property. A field initializer ends with a `write` of its own field.

- **`unknown`**: something the model cannot account for. The `reason` names it.
    - Code outside the model runs: `call`, `construct`, `tagged-template`, `dynamic-import`, `delete`, `suspension` (`await`, `yield`, `for await`).
    - The receiver or the reach of the code is unknown: `receiver-escape`, `unknown-receiver`, `super`, `dynamic-member`, `eval`, `unanalyzed-declaration` (a nested class, enum or namespace), `unsupported-target`.
- **`function`**: a function literal in the unit's code and what happens to it:
    - `stored`;
    - `invoked` (an IIFE);
    - `passed-to-unknown`;
    - `passed-to-assumed`;
    - `bound-locally` (a local binding the unit may call).

## Queries

| Export                                                             | Result                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `callEdgesFrom(model, unit)`, `callGraph(model)`                   | `CallEdge`s with the fact they come from. `calls` covers methods, functions, getters, setters, and fields holding a function. `invokes` is an IIFE. `may-run` is a callback handed on or a method read as a value. `defines` means the function is only stored |
| `reachedFacts(model, unit)`                                        | Every fact that may happen while the unit runs, each with a shortest path of call edges. `defines` edges are not followed                                                                                                                                      |
| `recursiveUnitGroups(model)`                                       | Units that may run each other in a cycle                                                                                                                                                                                                                       |
| `declarationDependencies(model)`, `ownerOf`                        | Direct `read`, `write` and `call` dependencies between declarations. Nested functions belong to the nearest enclosing declaration, and module code is `from: null`                                                                                             |
| `unitInterference(model, a, b)`                                    | `definite` (the two touch the same tracked location and one writes it, or one calls what the other assigns), `possible` (only uncertainty relates them) or `none`, with evidence                                                                               |
| `decisionPoints(model, unit)`, `decisionPointsIn`, `guardOf`       | Branching constructs (`if`, `?:`, `&&`, `\|\|`, `??`, logical assignment, defaults, `switch`, loops, `catch`, optional links), each with its outcomes. Includes the Istanbul coverage kind where one exists, and which outcome guards a node                   |
| `stronglyConnectedComponents`, `cyclicComponents`, `reachableFrom` | Generic, deterministic graph algorithms the queries use                                                                                                                                                                                                        |

## Guarantees and distinctions

- **Syntax vs resolution:** targets come from scope analysis. A name the scope manager cannot resolve is a `global` binding, never a guess.
- **Direct vs transitive:** facts are direct. Only `reachedFacts`, `unitInterference` and the graph algorithms follow relations.
- **Control flow vs calls:** units and call edges describe which code may run other code. Decision points describe branching inside one unit. The two are kept separate.
- **Proven vs possible:** an `access` or `function` fact means the code is written so that it may happen. It does not prove that it runs. `unknown` facts mark what the model cannot see. `unitInterference` separates `definite` evidence from `possible` evidence.
- **Static vs runtime:** a unit, edge or decision point is static structure. Being reachable in the model, or being unguarded, is not proof of execution. A decision point is a branch in the source, not a branch exercised by tests. Mapping coverage onto it is the consumer's job (`coverageKind` names the matching Istanbul branch type, which does not always match one to one).
- **Determinism:** ids, facts, edges and query results are ordered by source position and are stable for a given source text.

## Limitations

These are the gaps the engine knows about. A consumer that relies on a stronger guarantee must handle them.

- **One module at a time:** imports are opaque. A call to an imported function is an `access` plus an `unknown` `call`.
- **Nested declarations:** a class, enum or namespace nested inside a unit is reported as `unanalyzed-declaration`. Its decision points stay with the enclosing unit.
- **Aliasing and identity:** closure bindings, properties of other objects, and members of a module class reached through aliases (`const self = this`, a parameter, a module class handed to outside code) are not tracked as locations.
    - `unitInterference` relates them only through outside effects.
    - `this` escaping is reported as `receiver-escape`. The class value escaping from module code is not.
- **Inheritance:** an undeclared member key (`member: null`) may be inherited. `super` is `unknown`. Subclasses in other modules are not seen.
- **Fields without an initializer:** they define the field to `undefined` at construction but have no unit, so no `write` fact.
- **Imports are treated as immutable**, although ES imports are live bindings.
- **Call edges are may-relations:** a `may-run` edge (a callback handed to outside code) may never run, and a `calls` edge sits behind whatever decisions guard it.
- **Interference is a may-analysis under these limits:** `none` means nothing in the model relates the two units. It does not prove independence.
- **No types:** the engine uses no type information. A call through a value whose type is a function is still a call of a `property` or `binding`.
