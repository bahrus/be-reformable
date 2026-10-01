# Add Support For Programmatic Attachment

## Bruce's Ask

Can you please follow the example of [be-persistent](https://github.com/bahrus/be-persistent) and [the addendum](../types/ImportantEnhancementAddendum.md) to add demos and adjust be-reformable.js as needed and add def.js to support programmatic attachment of this enhancement?

Please add your implementation notes below.

## Claude's Implementation Notes

Done. be-reformable now supports programmatic attachment, following be-persistent and the addendum (steps 1 to 7). All 8 Playwright tests pass: the 2 existing attribute tests and 6 new programmatic ones. Nothing is committed yet.

### What changed

- **[def.js](../def.js)** exports `defBeReformable(ref)`, using the addendum's template. It's added to `package.json`'s `exports`, along with `emc.json` and `🍺.json`.
- **`init`** reads `ctx.emc || ctx.config` and sets `self.initialized = true` after `await roundabout(...)`.
- **`enhKey` is now `beReformable`, not `BeReformable`.** The legacy `enhPropKey` was `beReformable`, and the conversion guide says to keep it. It's now part of the public API (`form.enh.set.beReformable`), so it was worth fixing before anyone depends on it. Nothing in the repo used the PascalCase key. **This is a breaking change** for anyone reading `form.enh.BeReformable` from an attribute-attached form.
- **Compacts became actions gated on `initialized`.** This was the main obstacle. With `enh.get()`, the caller assigns `path`, `baseLink` and so on synchronously, before `roundabout` has made them reactive. Those assignments raise no change events, so the compacts `when_path_changes_call_parsePath`, `when_baseLink_changes_call_resolveBaseLink` and `when_updateOn_changes_call_hydrate` never fired, and the form never got its action. They're now actions with `initialized` in both `ifKeyIn` and `ifAllOf` (the three-peat / be-persistent pattern). `specifyDefaultBaseURL` waits for `initialized` too. `when_fetchOptions_changes_call_suggestFetch` stays a compact, because `fetchOptions` is only ever produced by `updateAction`.
- **`updateAction`** now also triggers on `headers` and `headerFields`, so reassigning either one programmatically refreshes the fetch options.
- **`headers` is no longer mutated.** `updateAction` used to `Object.assign` the header-field values into the `headers` object itself, which would now be the caller's object. It builds a copy instead.

### Elements wherever an id is accepted (step 7)

| Property | Id-based (unchanged) | New: element or `WeakRef` |
|----------|----------------------|---------------------------|
| `baseLink` | id of a `<link>` | the link element |
| `headerFields` | selectors (`#myHeader`, `%part`) | entries may be input elements / `WeakRef`s, mixed with selectors |

Elements are only ever held weakly:

- `resolveBaseLink` stores an element back as a `WeakRef`. Because roundabout's getter derefs it, a private `#baseLinkRef` remembers which element was already weakened, so it isn't weakened again on every pass.
- A new `weakenHeaderFields` action stores back a *copy* of the array with each element replaced by a `WeakRef`, without touching the caller's array. Nested `WeakRef`s aren't dereferenced by the getter, so there's nothing left to weaken on the next pass.
- A collected element is skipped: a collected header field contributes no header. It never throws.
- An element passed by reference may have no id, so a header field is named by `data-id`, then `id`, then the `name` attribute, then its position in the array.

`baseLink` by id now looks up the element in the form's own root node first (`getRootNode().getElementById`), so it works inside shadow DOM. It falls back to `globalThis[id]`, which is what it used before.

### Tests and demos

| Test | What it checks |
|------|----------------|
| `tests/Programmatic/DeclarativeInSequence` | `enh.set` after `defBeReformable`: the action is set, `fetch-ready` carries the headers, and typing refreshes the action |
| `tests/Programmatic/DeclarativeOutOfSequence` | The same, with `enh.set` *before* `defBeReformable` |
| `tests/Programmatic/Imperative` | The same via `Object.assign(form.enh.get(emc), {...})`, plus: the caller's `headers` object is not mutated |
| `tests/Programmatic/TargetElement` | `baseLink` as an id-less element, and `headerFields` as an element plus a `WeakRef`. The stored array holds `WeakRef`s, and the caller's array is untouched. |
| `tests/Programmatic/TargetElementGC` | A real garbage collection. A removed header input *and* the removed link are both collected. Afterwards, typing still updates the action, and the collected field contributes no header, with no errors. |

Negative controls: I ran the GC test against a broken version that skips the `headerFields` weakening, and again against one that skips the `baseLink` weakening. Each failed as it should.

[demo/Programmatic/](../demo/Programmatic/) has four pages based on the fixtures. Each shows the live action and the `fetch-ready` options as you edit the inputs. A smoke test confirmed all four run without errors.

The README has a new "Programmatic attachment (no attribute)" section, laid out as in addendum step 6. Its third point, about less overhead, holds: nothing `def.js` imports, directly or dynamically, pulls in mount-observer.

### Still open (not changed)

- `submitOptions` only takes effect in `hydrate`, which runs once `updateOn` and `initialized` are set. Setting `submitOptions` programmatically *after* that won't nudge the submit buttons. Its `onlyAfter` and `disableIfNotAllConditionsAreMet` options still throw `'NI'` (not implemented), as before, even though the README's "fetch-ready only after a button click" example uses both.
- `hydrate` still has the debugging `console.log({formEl})`.
- The `types/be-reformable/types.d.ts` changes are in the `types` submodule and need committing there.
