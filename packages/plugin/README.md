# @gabroberge/oxlint-plugin

Helpers for defining an Oxlint/ESLint-compat plugin once, with `all` and `recommended` configs derived from the rules.

## Install

```bash
npm install @gabroberge/oxlint-plugin
```

## Usage

```ts
import type { PluginRule } from "@gabroberge/oxlint-plugin";
import { defineConfiguredPlugin } from "@gabroberge/oxlint-plugin";

const exampleRule: PluginRule = {
	create() {
		return {};
	},
	defaultSeverity: "error",
	meta: {
		docs: {
			description: "An example rule.",
			recommended: true
		}
	},
	name: "example"
};

export default defineConfiguredPlugin("example", [exampleRule]);
```

`defineConfiguredPlugin` registers every rule on the plugin, then exposes:

- `configs.all` — every rule at `defaultSeverity`
- `configs.recommended` — only rules with `meta.docs.recommended === true`

Each config is a flat-config fragment: `{ plugins, rules }`.

## Exports

| Name                     | Kind     | Role                                               |
| ------------------------ | -------- | -------------------------------------------------- |
| `defineConfiguredPlugin` | function | Build the plugin and its configs                   |
| `ConfiguredPlugin`       | type     | Plugin plus `configs.all` / `configs.recommended`  |
| `PluginRule`             | type     | An Oxlint `Rule` with `name` and `defaultSeverity` |
| `DefaultSeverity`        | type     | `"error"` or `"warn"`                              |
| `PluginConfigs`          | type     | The `all` and `recommended` presets                |
| `Preset`                 | type     | A `{ plugins, rules }` fragment                    |
