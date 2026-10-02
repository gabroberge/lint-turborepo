# `angular/prefer-immutable-resource`

Requires `readonly` on Angular `resource` / `rxResource` fields and on fields annotated as `ResourceRef`. Included in `configs.recommended`.

A resource is a handle, not a value to reassign: replacing the field drops the existing request state. With `readonly`, reassignment becomes a type error.

```ts
// Reported
protected data = resource({ loader: () => load() });

// Fixed
protected readonly data = resource({ loader: () => load() });
```

The autofix inserts `readonly` before the property name.

## Limitations

- Only a direct `resource` / `rxResource` identifier is recognized. `core.resource` and a renamed import are ignored.
- Only a direct `ResourceRef` type identifier is recognized.
