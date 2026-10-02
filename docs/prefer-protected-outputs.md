# `angular/prefer-protected-outputs`

Requires `protected` on Angular `output()` fields and on fields annotated as `OutputEmitterRef`. Included in `configs.recommended`.

An output is for the template and subclasses, not for arbitrary callers on the class instance. Public or implicit-public exposure lets consumers emit from outside the component; `private` hides the output from subclasses.

```ts
// Reported
readonly changed = output<number>();

// Fixed
protected readonly changed = output<number>();
```

The autofix rewrites `public` / `private` to `protected`, or inserts `protected` when no accessibility keyword is present.

## Limitations

- Only a direct `output` identifier is recognized.
- Only a direct `OutputEmitterRef` type identifier is recognized.
- The `@Output()` decorator is not inspected.
