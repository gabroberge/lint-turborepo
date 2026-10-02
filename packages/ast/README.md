# @gabroberge/typescript-ast

TypeScript compiler-API helpers for class declarations, modifiers, property names, and snippet parsing.

## Install

```bash
npm install @gabroberge/typescript-ast
```

## Usage

```ts
import { classFrom, isExported, isStatic, propertyName } from "@gabroberge/typescript-ast";

const node = classFrom("export class Example { static flag = true; }");
const flag = node.members[0];

isExported(node);
isStatic(flag);
propertyName(flag.name);
```

## Exports

| Export               | Role                                                    |
| -------------------- | ------------------------------------------------------- |
| `sourceFrom`         | Parse a TypeScript snippet into a source file           |
| `classDeclarationOf` | The first class declaration in a source file, or `null` |
| `classFrom`          | The class in a snippet, or throw                        |
| `hasModifier`        | Whether a node has a given modifier                     |
| `isExported`         | Whether a node is exported                              |
| `isStatic`           | Whether a member is `static`                            |
| `propertyName`       | A static property name, `"computed"`, or `null`         |
| `unwrapExpression`   | Strip grouping and other transparent wrappers           |
