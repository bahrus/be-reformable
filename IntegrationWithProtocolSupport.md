# Integration With Protocol Support

---

## Human Ask

I've just updated one of the core package dependencies, assign-gingerly, with support for integrating global constants.  

I've copied in the source code for packages assign-gingerly, roundabout-lib, be-hive, and mount-observer, all of which have a role to play in how settings get parsed.  I've updated imports.html to point to the temporarily co-located library code, so that you can add console.log's and modify code as needed directly, and then when proven out, I can publish the updates.

Please see assign-gingerly/requirements/Done/AssignFrom/SupportForGlobalThisMerging.md.

So in particular, I would like the example demo/NewtonMicroservice/GlobalThis.html to make use of this.  Currently the code is using a deprecated package, trans-render for this.  The discussion in the reference in the previous paragraph has some typos.  I want the markup that should work to look like:

```html
<link id=newton-microservice rel=preconnect href=https://newton.now.sh/ >
<script>
    globalThis['rPpwNLcYsUOjFcg+N8lmOA'] = {
        myCustomHeader: 'goodbye'
    }
</script>
<form id=testForm be-reformable='{
    "baseURL": "globalThis://newton-microservice?.href",
    "path": "api/v2/:operation/:expression",
    "headerFields": ["#myHeader"],
    "headers": {
        "...": "rPpwNLcYsUOjFcg+N8lmOA"
    }
}'
>
<label>
    header:
    <input id=myHeader value=hello>
</label>
<label>
    Operation:
    <input :operation value=integrate>
</label>

<label>
    Expression:
    <input :expression value="x^2">
</label>
    <input name="hello" value=test>
</form>
<script>
    testForm.addEventListener('fetch-ready', e => {
        console.log({e});
    })
</script>
```

Please do a deep dive into the food chain that starts from assign-gingerly parsing the attribute, and then it being passed into roundabout, and propose one or more ways that food chain could be enhanced to support want me want above.  Please add these proposed approaches below.  

---

## Deep Dive: The Food Chain

### Current Flow (Step-by-Step)

1. **be-hive / EMCScript handler** loads `emc.json`, sees `withAttrs._base` has `instanceOf: "Object"` and `mapsTo: "."`. This tells `parseWithAttrs` to JSON.parse the `be-reformable` attribute value and spread it into `initVals`.

2. **`parseWithAttrs`** (assign-gingerly) reads the attribute string, calls `JSON.parse()`, and produces the raw `initVals` object:
   ```js
   {
     baseURL: "globalThis://newton-microservice?.href",
     path: "api/v2/:operation/:expression",
     headerFields: ["#myHeader"],
     headers: { "...": "rPpwNLcYsUOjFcg+N8lmOA" }
   }
   ```

3. **`enh.get()`** (object-extension.ts) spawns `BeReformable` with `(enhancedElement, ctx, initVals)`.

4. **`BeReformable.init()`** merges `initVals` into `RoundaboutOptions.initialPropVals`:
   ```js
   const raOptions = {
     ...customData,       // actions, compacts, weakRef, defaultPropVals
     vm: self,
     initialPropVals: {
       enhancedElement,
       ...customData?.defaultPropVals,
       ...initVals       // ← raw, unresolved protocol strings land here
     }
   };
   await roundabout(raOptions);
   ```

5. **`roundabout()`** calls `RoundaboutManager.initialize()` (sets up propagator, actions, compacts), then applies initVals:
   ```js
   const initVals = options.initialPropVals || options.defaultPropVals;
   if (initVals) {
     assignGingerly(returnObj[0], initVals, options.assignGingerlyOptions);
   }
   ```

6. **`assignGingerly`** does a plain merge — it sees `baseURL: "globalThis://newton-microservice?.href"` and assigns that literal string to `vm.baseURL`. It does not resolve protocol references. Similarly, `headers: { "...": "rPpwNLcYsUOjFcg+N8lmOA" }` is assigned as-is — the `"..."` spread key is not processed.

7. **Actions react**: `updateAction` fires when `baseURL` is set, but gets the raw string `"globalThis://newton-microservice?.href"` instead of the resolved URL.

### The Gap

The problem is at step 5-6. `roundabout()` uses **`assignGingerly`** (which does not resolve protocols or `"..."` spreads) instead of **`assignFrom`** (which does both). The new capabilities in `assignFrom` — protocol resolution via `resolveProtocolValue` and `"..."` spread handling — are never invoked for `initialPropVals`.

### What Needs to Happen

For `baseURL: "globalThis://newton-microservice?.href"` to work:
- The string must be detected as a protocol reference (contains `://`)
- `resolveProtocolValue('globalThis://newton-microservice?.href', protocols)` must be called
- This extracts `globalThis` → protocol, `newton-microservice` → key, `?.href` → remaining path
- Handler: `globalThis['newton-microservice']` → the `<link>` element → then `resolveValue('?.href', linkElement)` → the href string

For `headers: { "...": "rPpwNLcYsUOjFcg+N8lmOA" }` to work:
- The `"..."` key must be detected
- Its value `"rPpwNLcYsUOjFcg+N8lmOA"` must be treated as a `globalThis://` reference (but it doesn't have the prefix!)
- OR the convention is that `"..."` values are always `globalThis` keys (spread from `globalThis[value]`)
- After resolution, the spread object `{ myCustomHeader: 'goodbye' }` replaces the `"..."` entry

**Important note**: In the desired markup, the `"..."` value in `headers` is just `"rPpwNLcYsUOjFcg+N8lmOA"` — no `globalThis://` prefix. This implies a convention that bare `"..."` values (without a protocol) default to `globalThis` lookups. This differs from `baseURL` which explicitly uses `globalThis://`.

---

## Proposed Approaches

### Approach A: Swap `assignGingerly` for `assignFrom` in `roundabout()`

**The minimal change.** Replace the `assignGingerly` call in `roundabout.ts` with `assignFrom`, and pass a `protocols` option through `RoundaboutOptions`.

#### Changes Required

**1. `roundabout/roundabout.ts` (and `.js`)**

```typescript
export async function roundabout<TProps = any, TActions = TProps, ETProps = TProps>(
    options: RoundaboutOptions<TProps, TActions, ETProps>,
    infractions?: Array<Function | string>
): Promise<[vm: TProps & TActions & RoundaboutReady, propagator: EventTarget]> {
    const { RoundaboutManager } = await import('./core/RoundaboutManager.js');
    const manager = new RoundaboutManager<TProps, TActions, ETProps>(options, infractions);
    const returnObj = await manager.initialize();
    const initVals = options.initialPropVals || options.defaultPropVals;
    if (initVals) {
        const { assignFrom } = await import('assign-gingerly/assignFrom.js');
        await assignFrom(returnObj[0], initVals, {
            from: returnObj[0],  // resolve ?.paths against the VM itself
            ...options.assignGingerlyOptions,
            protocols: options.protocols
        });
    }
    return returnObj;
}
```

**2. `roundabout/types/roundabout/types.d.ts`** — add `protocols` to `RoundaboutOptions`:

```typescript
export interface RoundaboutOptions<...> extends RAConfig<...> {
    // ...existing...
    protocols?: Record<string, (key: string) => any | Promise<any>>;
}
```

**3. `be-reformable.js`** — pass `protocols` in raOptions:

```javascript
async init(self, enhancedElement, ctx, initVals) {
    const { customData } = ctx.emc;
    const raOptions = {
        ...customData,
        vm: self,
        initialPropVals: {
            enhancedElement,
            ...customData?.defaultPropVals,
            ...initVals
        },
        protocols: {
            globalThis: (key) => globalThis[key]
        }
    };
    await (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
}
```

**4. Handle the `"..."` convention for bare keys in `headers`**

The `"..."` value `"rPpwNLcYsUOjFcg+N8lmOA"` has no protocol prefix. Two sub-options:

- **A1**: `assignFrom` already handles `"..."` — if the RHS is not a path (no `?.` prefix) and not a protocol reference (no `://`), treat it as a globalThis key by default. This requires adding a `defaultProtocol` option to `ResolveValuesOptions`.

- **A2**: The user adds the explicit prefix in the markup: `"...": "globalThis://rPpwNLcYsUOjFcg+N8lmOA"`. This keeps `assignFrom` simple.

#### Recursive `"..."` Resolution

Currently `assignFrom` only handles `"..."` at the top level of the pattern. For nested objects like `headers: { "...": "..." }`, `resolveValues` would need to walk nested objects too. Right now `resolveValues` only processes top-level entries. This needs a recursive walk enhancement.

#### Pros
- Minimal architectural change (one function swap in roundabout)
- `assignFrom` already has protocol + spread support
- The merges processor already uses this pattern (precedent in the codebase)
- `assignGingerlyOptions` is already threaded through the system

#### Cons
- Makes roundabout initialization async for ALL enhancements (not just those using protocols)
- `assignFrom` currently only resolves top-level properties and `"..."` at top level; nested `headers` object needs recursive handling
- Every be-* enhancement pays the `assignFrom` import cost even if no protocols are used

---

### Approach B: Resolve Protocols in `BeReformable.init()` Before Passing to Roundabout

**Be-reformable takes responsibility.** Before building `raOptions`, resolve protocol values and spread `"..."` keys in `initVals`.

#### Changes Required

**1. `be-reformable.js`:**

```javascript
async init(self, enhancedElement, ctx, initVals) {
    const { customData } = ctx.emc;
    
    // Resolve protocol references and "..." spread keys before roundabout
    if (initVals) {
        const { resolveValues } = await import('assign-gingerly/resolveValues.js');
        const protocols = {
            globalThis: (key) => globalThis[key]
        };
        
        // Resolve top-level protocol values
        initVals = await resolveValues(initVals, enhancedElement, { protocols });
        
        // Handle top-level "..." spread
        if ('...' in initVals) {
            const spreadVal = initVals['...'];
            if (spreadVal && typeof spreadVal === 'object') {
                Object.assign(initVals, spreadVal);
            }
            delete initVals['...'];
        }
        
        // Resolve nested objects (e.g., headers)
        for (const [key, val] of Object.entries(initVals)) {
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                const resolved = await resolveValues(val, enhancedElement, { protocols });
                if ('...' in resolved) {
                    const nested = resolved['...'];
                    if (nested && typeof nested === 'object') {
                        Object.assign(resolved, nested);
                    }
                    delete resolved['...'];
                }
                initVals[key] = resolved;
            }
        }
    }
    
    const raOptions = {
        ...customData,
        vm: self,
        initialPropVals: {
            enhancedElement,
            ...customData?.defaultPropVals,
            ...initVals
        }
    };
    await (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
}
```

#### Handling the bare `"..."` key (no protocol prefix)

The value `"rPpwNLcYsUOjFcg+N8lmOA"` doesn't start with `?.` and doesn't contain `://`, so `resolveValues` would pass it through unchanged. You'd need special handling: if a `"..."` key's value doesn't match any resolve pattern, default to `globalThis[value]`.

#### Pros
- No changes to roundabout-lib at all
- Only be-reformable (or enhancements that need protocols) pay the cost
- Keeps roundabout generic and synchronous-assignable for simple cases
- Easy to customize per-enhancement (each enhancement decides its protocols)

#### Cons
- Every enhancement that needs protocols must implement its own resolution logic
- Duplicates logic that `assignFrom` already provides
- The resolution and the assignment are disconnected — harder to reason about

---

### Approach C: Add a `resolveInitVals` Hook to RoundaboutOptions

**A middle ground.** Roundabout gains an optional async transform hook that runs before `assignGingerly`.

#### Changes Required

**1. `roundabout/types/roundabout/types.d.ts`:**

```typescript
export interface RoundaboutOptions<...> extends RAConfig<...> {
    // ...existing...
    
    /**
     * Optional async transform applied to initialPropVals before assignment.
     * Use for protocol resolution, "..." spread, or any pre-processing.
     */
    resolveInitVals?: (initVals: any) => Promise<any> | any;
}
```

**2. `roundabout/roundabout.ts`:**

```typescript
export async function roundabout<TProps = any, TActions = TProps, ETProps = TProps>(
    options: RoundaboutOptions<TProps, TActions, ETProps>,
    infractions?: Array<Function | string>
): Promise<[vm: TProps & TActions & RoundaboutReady, propagator: EventTarget]> {
    const { RoundaboutManager } = await import('./core/RoundaboutManager.js');
    const manager = new RoundaboutManager<TProps, TActions, ETProps>(options, infractions);
    const returnObj = await manager.initialize();
    let initVals = options.initialPropVals || options.defaultPropVals;
    if (initVals) {
        if (options.resolveInitVals) {
            initVals = await options.resolveInitVals(initVals);
        }
        (await import('assign-gingerly/assignGingerly.js')).assignGingerly(
            returnObj[0], initVals, options.assignGingerlyOptions
        );
    }
    return returnObj;
}
```

**3. `be-reformable.js`:**

```javascript
async init(self, enhancedElement, ctx, initVals) {
    const { customData } = ctx.emc;
    const raOptions = {
        ...customData,
        vm: self,
        initialPropVals: {
            enhancedElement,
            ...customData?.defaultPropVals,
            ...initVals
        },
        async resolveInitVals(vals) {
            const { assignFrom } = await import('assign-gingerly/assignFrom.js');
            const protocols = { globalThis: (key) => globalThis[key] };
            // Use a dummy target to get the resolved+spread object back
            return assignFrom({}, vals, { from: enhancedElement, protocols });
        }
    };
    await (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
}
```

#### Pros
- Roundabout stays generic; no protocol knowledge baked in
- Only enhancements that need resolution pay the cost
- Flexible — hook can do anything (not limited to protocols)
- Clean separation of concerns

#### Cons
- One more option to document/maintain
- The hook's shape (returns transformed initVals) may not compose well with `assignFrom`'s `target` semantics

---

### Approach D: Use `protocols` on `RoundaboutOptions` + Auto-wire in Roundabout (Recommended)

**Combines A's simplicity with C's opt-in nature.** If `protocols` is present on options, use `assignFrom`; otherwise fall back to plain `assignGingerly`. This makes the fast path unchanged and protocol support opt-in.

#### Changes Required

**1. `roundabout/roundabout.ts`:**

```typescript
export async function roundabout<TProps = any, TActions = TProps, ETProps = TProps>(
    options: RoundaboutOptions<TProps, TActions, ETProps>,
    infractions?: Array<Function | string>
): Promise<[vm: TProps & TActions & RoundaboutReady, propagator: EventTarget]> {
    const { RoundaboutManager } = await import('./core/RoundaboutManager.js');
    const manager = new RoundaboutManager<TProps, TActions, ETProps>(options, infractions);
    const returnObj = await manager.initialize();
    const initVals = options.initialPropVals || options.defaultPropVals;
    if (initVals) {
        if (options.protocols) {
            // Protocol-aware path: use assignFrom for resolution + spread + assignment
            const { assignFrom } = await import('assign-gingerly/assignFrom.js');
            await assignFrom(returnObj[0], initVals, {
                from: returnObj[0],
                ...options.assignGingerlyOptions,
                protocols: options.protocols
            });
        } else {
            // Fast path: plain assignment, no protocol overhead
            const { assignGingerly } = await import('assign-gingerly/assignGingerly.js');
            assignGingerly(returnObj[0], initVals, options.assignGingerlyOptions);
        }
    }
    return returnObj;
}
```

**2. `roundabout/types/roundabout/types.d.ts`** — add `protocols`:

```typescript
export interface RoundaboutOptions<...> extends RAConfig<...> {
    // ...existing...
    protocols?: Record<string, (key: string) => any | Promise<any>>;
}
```

**3. `be-reformable.js`:**

```javascript
async init(self, enhancedElement, ctx, initVals) {
    const { customData } = ctx.emc;
    const raOptions = {
        ...customData,
        vm: self,
        initialPropVals: {
            enhancedElement,
            ...customData?.defaultPropVals,
            ...initVals
        },
        protocols: {
            globalThis: (key) => globalThis[key]
        }
    };
    await (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
}
```

**4. Enhance `resolveValues` for recursive nested objects** — so `headers: { "...": "globalThis://rPpwNLcYsUOjFcg+N8lmOA" }` is resolved.

**5. Convention for bare `"..."` keys** — either:
- Require explicit `"...": "globalThis://rPpwNLcYsUOjFcg+N8lmOA"` in markup (clearest)
- Or add a `defaultSpreadProtocol` option: when a `"..."` value has no `://`, prepend this protocol

#### Pros
- Zero cost for enhancements that don't use protocols (fast path unchanged)
- `protocols` flows naturally alongside `assignGingerlyOptions`
- merges processor can also use `protocols` (it already stores `__roundaboutAssignGingerlyOptions`)
- Clean opt-in at the enhancement level

#### Cons
- `roundabout` gains a `protocols` option (minimal coupling)
- `resolveValues` needs recursive nested object support (but this is needed for any approach)

---

## Key Sub-Problem: Nested Object Resolution and Bare `"..."` Keys

Regardless of approach, two things need addressing in `assign-gingerly`:

### 1. Recursive `resolveValues` for Nested Objects

Currently `resolveValues` iterates top-level entries only. For `headers: { "...": "globalThis://rPpwNLcYsUOjFcg+N8lmOA" }`, it would see `headers` has an object value and pass it through unchanged.

**Fix**: When a value is a plain object (not an array), recursively resolve its entries too:

```typescript
// In resolveValues, after protocol/path checks:
} else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    // Recursively resolve nested objects
    result[key] = await resolveValues(value, source, options);
} else {
    result[key] = value;
}
```

Then `assignFrom`'s `"..."` handling also needs to recurse:

```typescript
// After resolving, walk all values and handle "..." in nested objects
function handleSpreads(obj: Record<string, any>): Record<string, any> {
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            obj[key] = handleSpreads(value);
        }
    }
    if ('...' in obj) {
        const spreadValue = obj['...'];
        if (spreadValue && typeof spreadValue === 'object') {
            delete obj['...'];
            Object.assign(obj, spreadValue);
        }
    }
    return obj;
}
```

### 2. The Bare `"..."` Value Convention

In the desired markup:
```json
"headers": {
    "...": "rPpwNLcYsUOjFcg+N8lmOA"
}
```

The value `"rPpwNLcYsUOjFcg+N8lmOA"` has no protocol prefix. It's a bare globalThis key. Options:

- **Option 1**: Require `"globalThis://rPpwNLcYsUOjFcg+N8lmOA"` in markup. Explicit, no ambiguity, consistent with `baseURL`.
- **Option 2**: Add a convention to `resolveValues` — when a `"..."` key's value doesn't start with `?.` and doesn't contain `://`, and `protocols.globalThis` exists, implicitly treat it as `globalThis://value`. This is ergonomic but adds a hidden convention.
- **Option 3**: Add a `defaultSpreadProtocol: 'globalThis'` option to `ResolveValuesOptions`. When set, bare `"..."` values get that protocol prepended.

**Recommendation**: Go with **Option 1** (explicit `globalThis://` in the markup) for the first cut. It's consistent, debuggable, and the markup in the ask can be adjusted to:

```html
"headers": {
    "...": "globalThis://rPpwNLcYsUOjFcg+N8lmOA"
}
```

---

## Recommendation

**Approach D** is the cleanest path. It:
- Keeps the fast path untouched for all existing enhancements
- Requires only 3 files changed: `roundabout.ts`, the types file, and `be-reformable.js`
- Aligns with how `merges` already use `assignFrom` (the pattern is proven)
- Allows future enhancements to opt into protocol support by simply passing `protocols`

The remaining work in `assign-gingerly` (recursive nested resolution in `resolveValues` + recursive `"..."` spread in `assignFrom`) is required regardless of which approach is chosen, and is a natural extension of the existing implementation.

---

## Human Response I

First, my bad on this observation:

> **Important note**: In the desired markup, the `"..."` value in `headers` is just `"rPpwNLcYsUOjFcg+N8lmOA"` — no `globalThis://` prefix. This implies a convention that bare `"..."` values (without a protocol) default to `globalThis` lookups. This differs from `baseURL` which explicitly uses `globalThis://`.

I totally agree.  The rhs should have started with globalThis://

All the special exceptions outlined based on the assumption that that was intentional should be null and void.

As far as I can tell, that major oversight on my part doesn't impact which of the approaches seems the most effective, but if it does, please take the opportunity to honestly change course and recommend another option.

Actually, can you please update your excellent discussion above with that in mind, so there's less to go through, first, before I complete my feedback?