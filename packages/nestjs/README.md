# @gabroberge/eslint-plugin-nestjs

Lint rules for NestJS controllers. The plugin registers as `nestjs`.

## Install

```bash
npm install -D @gabroberge/eslint-plugin-nestjs
```

## Usage

### ESLint flat config

```js
import nestjs from "@gabroberge/eslint-plugin-nestjs";

export default [nestjs.configs.recommended];
```

### Oxlint

```json
{
	"jsPlugins": ["@gabroberge/eslint-plugin-nestjs"],
	"rules": {
		"nestjs/ordered-routes": "error"
	}
}
```

## Configs

| Config                | What it enables                                           |
| --------------------- | --------------------------------------------------------- |
| `configs.recommended` | Rules marked recommended, at each rule's default severity |
| `configs.all`         | Every rule, at each rule's default severity               |

## Rules

| Rule                    | Recommended | Fix | Default | What it reports                                                                   |
| ----------------------- | ----------- | --- | ------- | --------------------------------------------------------------------------------- |
| `nestjs/ordered-routes` | yes         | yes | error   | Controller handlers that are not ordered by HTTP method, then by path specificity |

Default method order is `POST`, `GET`, `PATCH`, `PUT`, `DELETE`. Within a method, shorter paths come first, then static segments, then parameters, then wildcards, so a static route is not shadowed.

```js
{
	rules: {
		"nestjs/ordered-routes": ["error", { methodOrder: ["POST", "GET", "PATCH", "PUT", "DELETE"] }]
	}
}
```
