# lint-turborepo

Oxlint/ESLint plugins and the shared AST helpers they use. The repo is a Bun + Turborepo workspace. Each public package lives under `packages/` and is published to npm under `@gabroberge`.

## Packages

### Plugins

| Package                                                                 | Registers as     | Role                                      |
| ----------------------------------------------------------------------- | ---------------- | ----------------------------------------- |
| [`@gabroberge/eslint-plugin-nestjs`](packages/nestjs/README.md)         | `nestjs`         | NestJS controller route order             |
| [`@gabroberge/eslint-plugin-typescript`](packages/typescript/README.md) | `typescript`     | Array species and sorted `export … from`  |
| [`@gabroberge/eslint-plugin-vitest`](packages/vitest/README.md)         | `vitestExtended` | Nest/Vitest spec structure and assertions |

Each plugin exposes `configs.recommended` and `configs.all`.

### Helpers

| Package                                                  | Role                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| [`@gabroberge/oxlint-plugin`](packages/plugin/README.md) | `defineConfiguredPlugin` plus `all` / `recommended` configs |
| [`@gabroberge/oxlint-estree`](packages/estree/README.md) | ESTree names, ranges, shapes, and traversal                 |
| [`@gabroberge/typescript-ast`](packages/ast/README.md)   | TypeScript class, modifier, and source helpers              |

## Use a plugin

```js
import nestjs from "@gabroberge/eslint-plugin-nestjs";
import typescript from "@gabroberge/eslint-plugin-typescript";
import vitestExtended from "@gabroberge/eslint-plugin-vitest";

export default [nestjs.configs.recommended, typescript.configs.recommended, vitestExtended.configs.recommended];
```

Oxlint loads the same default export through `jsPlugins`. See each package README for rules, options, and an Oxlint snippet.

The Nest/Vitest test grammar those rules assume is in [docs/test-grammar.md](docs/test-grammar.md).

## Develop

Requires [Bun](https://bun.sh) 1.4 and Node 26+.

```bash
bun install
bun run build
bun run test
bun run lint
bun run typecheck
```

Releases are versioned with Changesets. A `patch` / `minor` / `major` file under `.changeset/` becomes a version PR on `master`, then `publish.yml` packs and publishes to npm.

## License

MIT
