# @gabroberge/eslint-plugin-angular

Lint rules that keep Angular resources immutable and outputs protected. The plugin registers as `angular`.

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

| Rule                                | Recommended | Fix | Default | What it reports                                                                          |
| ----------------------------------- | ----------- | --- | ------- | ---------------------------------------------------------------------------------------- |
| `angular/prefer-immutable-resource` | yes         | yes | error   | A `resource` / `rxResource` field, or a `ResourceRef` annotation, that is not `readonly` |
| `angular/prefer-protected-outputs`  | yes         | yes | error   | An `output()` field, or an `OutputEmitterRef` annotation, that is not `protected`        |

`prefer-immutable-resource` only recognizes a direct `resource` / `rxResource` / `ResourceRef` identifier. Autofix inserts `readonly` before the property name.

`prefer-protected-outputs` only recognizes a direct `output` / `OutputEmitterRef` identifier. Autofix rewrites `public` / `private` to `protected`, or inserts `protected` when no accessibility keyword is present.
