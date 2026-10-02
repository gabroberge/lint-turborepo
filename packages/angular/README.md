# @gabroberge/eslint-plugin-angular

ESLint and Oxlint rules for Angular classes. The plugin registers as `angular`.

## Install

```bash
npm install -D @gabroberge/eslint-plugin-angular
```

## Usage

### ESLint flat config

```js
import angular from "@gabroberge/eslint-plugin-angular";

export default [angular.configs.recommended];
```

To enable a rule that is not in `recommended`, add it after the preset:

```js
export default [angular.configs.recommended, { rules: { "angular/ordered-class-members": "error" } }];
```

### Oxlint

```json
{
	"jsPlugins": ["@gabroberge/eslint-plugin-angular"],
	"rules": {
		"angular/prefer-immutable-resource": "error",
		"angular/prefer-protected-outputs": "error"
	}
}
```

## Configs

| Config                | What it enables                                           |
| --------------------- | --------------------------------------------------------- |
| `configs.recommended` | Rules marked recommended, at each rule's default severity |
| `configs.all`         | Every rule, at each rule's default severity               |

## Rules

| Rule                                                                                                                              | Recommended | Fix | Description                                |
| --------------------------------------------------------------------------------------------------------------------------------- | ----------- | --- | ------------------------------------------ |
| [`angular/ordered-class-members`](https://github.com/gabroberge/lint-turborepo/blob/master/docs/ordered-class-members.md)         | no          | yes | Order class members by configurable groups |
| [`angular/prefer-immutable-resource`](https://github.com/gabroberge/lint-turborepo/blob/master/docs/prefer-immutable-resource.md) | yes         | yes | Require `readonly` on resource fields      |
| [`angular/prefer-protected-outputs`](https://github.com/gabroberge/lint-turborepo/blob/master/docs/prefer-protected-outputs.md)   | yes         | yes | Require `protected` on output fields       |

All rules default to `error`.
