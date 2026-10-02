# @gabroberge/oxlint-estree

ESTree helpers used by the lint plugins: names, ranges, function nodes, side-effect-free shapes, and tree walks.

## Install

```bash
npm install @gabroberge/oxlint-estree
```

## Usage

```ts
import { staticString, traverse, unwrapExpression } from "@gabroberge/oxlint-estree";

const name = staticString(node);
traverse(program, (child) => {
	const expression = unwrapExpression(child);
	return undefined;
});
```

## Exports

### Names

| Export              | Role                                         |
| ------------------- | -------------------------------------------- |
| `bindsName`         | Whether a binding introduces a name          |
| `exportedName`      | The exported name of a specifier             |
| `identifierName`    | The text of an identifier                    |
| `staticKey`         | A static property key                        |
| `staticString`      | A string literal or expression-free template |
| `staticTextMatches` | Whether static text equals a value           |
| `typeReferenceName` | The name of a type reference                 |

### Ranges and unwrap

| Export                    | Role                                          |
| ------------------------- | --------------------------------------------- |
| `startOf` / `endOf`       | Bounds of a ranged node                       |
| `Ranged`                  | Something with `range`                        |
| `unwrapExpression`        | Strip grouping and other transparent wrappers |
| `unwrapAwaitedExpression` | Also unwrap `await`                           |

### Shape

| Export                                          | Role                                                   |
| ----------------------------------------------- | ------------------------------------------------------ |
| `areIdenticalSafeExpressions`                   | Two expressions that are the same and side-effect-free |
| `isCopyableReference` / `isCopyableReferenceTo` | A reference that can be compared by identity           |
| `isSideEffectFree`                              | An expression that does not run code                   |
| `sameLiteral` / `sameSafeShape`                 | Literal or shape equality that is safe to compare      |

### Walk

| Export                            | Role                                            |
| --------------------------------- | ----------------------------------------------- |
| `isFunctionNode` / `FunctionNode` | Function declaration, expression, or arrow      |
| `isNode`                          | A value that looks like an ESTree node          |
| `containsNodeType`                | Whether a subtree contains a node type          |
| `traverse`                        | Walk a tree; return `"skip"` to ignore children |
