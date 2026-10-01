# Failing Unit Tests

## Bruce's Ask

According to github actions, the last time unit tests worked was June 20, 2026.  I don't know if that was before or after the latest modernization.  At any rate, can you do what is necessary to fix them?

## Claude's Implementation Notes

Fixed. Both tests (`BaseLink`, `GlobalThis`) pass locally. Nothing is committed yet.

### Was it the modernization or the dependency upgrade?

The modernization. Your working tree has upgraded dependencies (for example, roundabout-lib 0.0.23 → 0.0.38). I ran the tests in a scratch copy against the committed `package-lock.json` (the June 20 versions), and they failed the same way. So the code was broken, not the upgrade. The last code changes (`be-reformable.js`, `emc.mjs`) are also dated June 20, so the last green run was probably from just before the final modernization commits.

### The cause

The enhancement spawned, and `urlBuilder`, `baseURL` and `updateCnt` were all set, but `updateAction` never ran, so the form never got its `action`. In `emc.mjs`, `updateAction` was gated by `ifKeyIn: ['updateCnt']`. `hydrate` bumps `updateCnt` straight away, before the async `parsePath` has produced `urlBuilder`. At that moment `ifAllOf` isn't satisfied yet. When `urlBuilder` arrives later, it isn't in `ifKeyIn`, so it can't trigger the action. This is the `ifKeyIn` pitfall described in the guide ("Blocking an Action Until All Attributes Are Read").

**Fix:** `ifKeyIn: ['updateCnt', 'urlBuilder', 'baseURL']` in [emc.mjs](../emc.mjs), then I rebuilt `emc.json` and `🍺.json`. I also checked that typing in an input still updates the form's `action`.

### Also fixed

The `nudges` submit option imported `mount-observer/nudge.js`, which no longer exists (be-committed had the same bug). It now imports `assign-gingerly/handlers/nudge.js`. No test covers this option.

### For CI

The workflow runs `npm ci`, so commit `package.json` and `package-lock.json` together. Otherwise CI installs whatever the lockfile says.

### Noticed, not changed

- In `updateAction`, `Object.assign(fetchOptions.headers, hdrs)` mutates the `headers` property itself. After the first run, `self.headers` also contains the header-field values (for example, `myHeader`). It's harmless in these tests, but it should probably copy the object: `fetchOptions.headers = {...headers, ...hdrs}`.
- `hydrate` still has a debugging `console.log({formEl})`.
- `init` reads `ctx.emc` only, so programmatic attachment isn't supported yet (see [AddSupportForProgrammaticAttachment.md](AddSupportForProgrammaticAttachment.md)).
