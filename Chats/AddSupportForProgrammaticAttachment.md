# Add Support For Programmatic Attachment

## Bruce's Ask

Can you please follow the example of [be-persistent](https://github.com/bahrus/be-persistent) and [the addendum](../types/ImportantEnhancementAddendum.md) to add demos and adjust be-bound.js as needed and add def.js to support programmatic attachment of this enhancement?

Please add your implementation notes below.

## Implementation Notes

I followed the addendum's checklist, with be-persistent as the model.

### Programmatic-friendly property: `bindings`

`hydrate` used to read `bindingRules` directly. `bindingRules` is the
`StatementsResult` that `parse-grouped-capture-statements` produces
(`{success, statements: [{value}]}`), which is awkward to build by hand.
be-persistent uses a `persistenceRules` → `store` compact for the same problem,
so I did the same here:

- There is a new property, `bindings: Array<Partial<BindingRule>>`, and it is
  now the only thing `hydrate` reads.
- A compact, `when_bindingRules_changes_call_onBindingRulesChange`, runs the
  new `onBindingRulesChange` method, which converts the attribute-parsed
  `bindingRules` into `bindings`. It still throws 400 when `success` is false,
  as before.
- Programmatic callers skip `bindingRules` and set `bindings` directly, e.g.
  `[{remoteId: 'search'}]`.
- An empty `bindings` array means a single fully inferred rule. This is the
  same as a bare `be-bound` attribute and replaces the old code that pushed
  `{value: {}}` into the parsed statements.
- `hydrate`'s action config is now
  `ifKeyIn: ['bindings', 'initialized'], ifAllOf: ['bindings', 'enhancedElement', 'initialized']`.

### Addendum steps

1. **`init()` awaits `roundabout(...)` and then sets `self.initialized = true`.**
   `hydrate` now gates on `initialized`.
2. **`ctx.emc || ctx.config`.** `init` now falls back to `ctx.config`.
3. **`def.js`** exports `defBeBound(ref)`. It is the same formula as
   `defBePersistent` and returns the registry item for `enh.get(emc)`.
   `package.json` `exports` now includes `./def.js`, `./emc.json` and
   `./🪢.json`. I also fixed `"."`, which pointed at a nonexistent
   `./index.js`, and removed `./emc.js`, which also doesn't exist.
4. **Reserved names.** None of be-bound's properties collide with `nudge`,
   `rock`, `awake` or `covertAssignment`, so `propagate` isn't needed.
   `bindings` is referenced by the `hydrate` action, so roundabout monitors it.
5. **Tests.** All three patterns are covered, using the "peer element with
   #search" scenario (`<span contenteditable 🪢="with #search">`):
   - `demo/Programmatic/DeclarativeInSequence.html`,
     `DeclarativeOutOfSequence.html`, `Imperative.html`
   - `tests/Programmatic/*.html` + `*.spec.mjs`: these type into the span and
     check that `#search` picks up the value.

   All 8 Playwright tests pass: the 5 existing attribute-based tests and the
   3 new ones.

### Other changes

- `types/be-bound/types.d.ts` (in the `types` git submodule): added
  `bindings` and `initialized` to the props, `remoteEvent` to `BindingRule`
  (the code already read it), and `onBindingRulesChange` to `Actions`.
  `reconcileValues` now takes `Partial<BindingRule>`. **These edits need to be
  committed and pushed in the `types` submodule separately.**
- `emc.json` / `🪢.json` were regenerated with `npm run build`.
- The README has a new "Programmatic attachment (no attribute)" section, with
  a table mapping attribute statements to `bindings` objects.

