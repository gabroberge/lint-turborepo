# @gabroberge/eslint-plugin-typescript

TypeScript lint rules that are not covered by the stock TypeScript ESLint plugins. The plugin registers as `typescript`.

## Install

```bash
npm install -D @gabroberge/eslint-plugin-typescript
```

## Usage

### ESLint flat config

```js
import typescript from "@gabroberge/eslint-plugin-typescript";

export default [typescript.configs.recommended];
```

### Oxlint

```json
{
	"jsPlugins": ["@gabroberge/eslint-plugin-typescript"],
	"rules": {
		"typescript/require-array-species": "warn",
		"typescript/sort-exports": "error"
	}
}
```

## Configs

| Config                | What it enables                                           |
| --------------------- | --------------------------------------------------------- |
| `configs.recommended` | Rules marked recommended, at each rule's default severity |
| `configs.all`         | Every rule, at each rule's default severity               |

## Rules

| Rule                               | Recommended | Fix | Default | What it reports                                                                                          |
| ---------------------------------- | ----------- | --- | ------- | -------------------------------------------------------------------------------------------------------- |
| `typescript/require-array-species` | yes         |     | warn    | An `Array` subclass that does not declare `Symbol.species`                                               |
| `typescript/sort-exports`          | yes         | yes | error   | Consecutive `export … from` statements that are not sorted by module path, then by the names they export |

`require-array-species` only recognizes a direct `Array` identifier, including `Array<T>`. Returning `Array` or `this` from `[Symbol.species]` are both acceptable.

`sort-exports` sorts a run of re-exports until another statement breaks the group. `export const` and `export function` stay where they are. Autofix keeps the comments on the lines directly above each statement.
