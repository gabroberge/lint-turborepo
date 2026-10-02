---
"@gabroberge/eslint-plugin-angular": minor
---

Add `ordered-class-members` (opt-in: enabled by `configs.all`, not by `configs.recommended`): a configurable, auto-fixable class member order for Angular components, directives, services and pipes. It covers `inject()`, `input()` / `model()`, `output()`, `signal()`, `computed()` and `linkedSignal()` fields, the constructor, statics, lifecycle hooks and methods. Field initializers that depend on each other keep their source order, and a reorder that might change initialization behaviour is reported without an autofix. The initialization analysis comes from `@gabroberge/typescript-class-analyzer`; the rule supplies the Angular-specific assumptions about `@angular/core` calls.
