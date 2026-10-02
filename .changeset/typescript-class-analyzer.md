---
"@gabroberge/typescript-class-analyzer": minor
---

Add `@gabroberge/typescript-class-analyzer`: framework-independent initialization-order analysis for TypeScript classes. It describes class members and their initialization timelines, tracks eager and deferred execution, stored function references, member reads and writes, side effects and escaping `this`, and derives which members must keep their source order (`initializationConstraints`, `constrainedOrder`, `blockedMoves`). Framework knowledge is supplied through a single `ClassAssumptions.assumeCall` callback.
