# be-reformable (🍺)

*be-reformable* is a custom element enhancement that (progressively) enhances the built-in form element, making attributes/properties like action dynamic.  It does not do anything fetch related, leaving that for other components / enhancements.  It provides the mechanics of specifying what the fetch parameters should be, and quietly suggests the appropriate time to perform said fetch.

It uses [assign-gingerly](https://github.com/bahrus/assign-gingerly) as the underpinning approach, as opposed to the controversial "is" extension.

[![Playwright Tests](https://github.com/bahrus/be-reformable/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-reformable/actions/workflows/CI.yml)
[![NPM version](https://badge.fury.io/js/be-reformable.png)](http://badge.fury.io/js/be-reformable)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-reformable?style=for-the-badge)](https://bundlephobia.com/result?p=be-reformable)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-reformable?compression=gzip">

## [Demo](https://codepen.io/bahrus/pen/eYEZOXm)


## Example 1:  Making the action property dynamic

Let's see how we can use *be-reformable* to bind input elements to the action property.  These input elements should not have a name attribute, as we don't want them to affect the query string.  Instead we use a custom attribute starting with ":".  

In this example, we bind to the  [newton advanced math micro service](https://newton.vercel.app/), declaratively.  By itself, this enhancement will not make the form fully functional for this service (as it doesn't do a fetch or anything).

```html
<link id=newton-microservice rel=preconnect href=https://newton.now.sh/ >

<form
    be-reformable='{
        "baseLink": "newton-microservice",
        "path": "api/v2/:operation/:expression",
    }'
>
    <label>
        Operation:
        <input :operation value=integrate>
    </label>
    
    <label>
        Expression:
        <input :expression value="x^2">
    </label>
    
    <noscript>
        <button type=submit>Submit</button>
    </noscript>
</form>
```

The "path" value follows the [URL Pattern syntax](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API).

"base-link" is optional, but allows for easy management of common base API URL's across the application.  The link tag should probably go in the head tag of index.html (typically).

What *be-reformable* does is:

1. By default, adds "input" event to the adorned form element.
2. If the form's checkValidity() is false, ignores the event.
2. When the event occurs, and checkValidity() is true, it uses the baseLink + path to set the action value of the form element.
   1.  It pulls in all the form associated custom elements and/or built-in input elements referenced by the path property.
   2.  Forms the compound string and sets the action property/attribute.
3. Triggers event "fetch-ready" which provides the recommended url and options parameters.  Event is dispatched both from the form element as well as the enhancement.

## Editing JSON-in-HTML

> [!NOTE]
> A [VSCode plug-in](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) is available to make editing json-in-html more pleasant.  This extension works with the web interface of vscode.

*be-reformable* is a rather lengthy name, and if it appears frequently within an application, could get tiresome to have to type.  It is the canonical name, but developers can easily define alternative names.  This package provides one such alternative:

```html
<form
    🍺='{
        "baseLink": "newton-microservice",
        "path": "api/v2/:operation/:expression",
    }'
>...</form>
```

## More semantic markup

This is also supported:

```html
<form
    🍺-base-link=newton-microservice 🍺-path=api/v2/:operation/:expression
>...</form>
```


## Support for headers and body

be-reformable supports protocol-prefixed values for resolving configuration from external sources. This is powered by [assign-gingerly](https://github.com/bahrus/assign-gingerly#protocol-resolution-in-resolvevalues-and-assignfrom)'s protocol resolution and `"..."` spread key support.

### Protocol syntax

Values in the attribute JSON can use protocol prefixes to reference external data:

```
protocolName://key?.optionalPath
```

- `protocolName` — the registered protocol handler (e.g., `globalThis`, `localStorage`, `sessionStorage`)
- `key` — passed to the protocol handler to retrieve the source object
- `?.optionalPath` — optional path resolved against the retrieved object using `?.`-delimited navigation

### The `"..."` spread key

When a key is `"..."`, its resolved value is spread (merged) into the parent object. This works at any nesting level.

### Example: GlobalThis protocol

```html
<link id=newton-microservice rel=preconnect href=https://newton.now.sh/ >
<script>
    globalThis['rPpwNLcYsUOjFcg+N8lmOA'] = {
        myCustomHeader: 'goodbye'
    }
</script>
<form be-reformable='{
    "baseURL": "globalThis://newton-microservice?.href",
    "path": "api/v2/:operation/:expression",
    "headerFields": ["#myHeader"],
    "headers": {
        "...": "globalThis://rPpwNLcYsUOjFcg+N8lmOA"
    }
}'>
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
</form>
```

In this example:

- `"baseURL": "globalThis://newton-microservice?.href"` resolves by:
  1. Looking up `globalThis['newton-microservice']` — the `<link>` element (elements with an `id` are accessible on `globalThis`)
  2. Navigating `?.href` on the result — yielding `"https://newton.now.sh/"`
- `"headers": { "...": "globalThis://rPpwNLcYsUOjFcg+N8lmOA" }` resolves by:
  1. Looking up `globalThis['rPpwNLcYsUOjFcg+N8lmOA']` — the object `{ myCustomHeader: 'goodbye' }`
  2. Spreading that object into `headers`, so `headers` becomes `{ myCustomHeader: 'goodbye' }`

### Built-in protocol: globalThis

The `globalThis` protocol is registered by default in be-reformable. It resolves keys via `globalThis[key]`, which covers:

- Elements with an `id` attribute (accessible as `globalThis['elementId']`)
- Any value explicitly set on `globalThis` (e.g., `globalThis['myKey'] = { ... }`)

### headerFields

The `headerFields` property accepts CSS selectors for input elements whose values become headers:

- `"#myHeader"` — selects by id, uses the element's `value` as the header value, with the id as the header name


> [!NOTE]
> Other components / enhancements that leverage this enhancement, and actually perform the fetch should consider use of [be-hashing-out](https://github.com/bahrus/be-hashing-out) or some other security mechanism if there's any sense of danger that justifies adding that security check.


## Support for emitting "fetch-ready" event only after a button click:

```html
<link id=newton-microservice rel=preconnect href=https://newton.now.sh/ >

<form
    be-reformable='{
        "baseLink": "newton-microservice",
        "path": "api/v2/:operation/:expression",
        "submitOptions":{
            "onlyAfter": "@submit::click",
            "nudges": true,
            "disableIfNotAllConditionsAreMet": true
        }
        
    }'
>
    <label for=operation>
        Operation:
        <input :operation value=integrate>
    </label>
    
    <label for=expression>
        Expression:
        <input :expression value="x^2">
    </label>
    
    <noscript>
        <button type=submit>Submit</button>
    </noscript>
    <button disabled type=button name=submit>Submit</button>
</form>
```

## Programmatic attachment (no attribute)

The attribute syntax shown above shines for server-rendered HTML and progressive enhancement:  the markup alone says how the form's action is assembled.  But most web development today renders on the client, with a framework (Lit, React, Vue, Svelte, etc.) that already has a JavaScript reference to each element it creates.  In that setting, attaching be-reformable programmatically is the better fit:

1. **A less clunky API.**  Frameworks are awkward about setting arbitrary attributes, and a JSON object squeezed into one (`be-reformable='{"baseLink": "newton-microservice", "path": "api/v2/:operation/:expression"}'`) is awkward anywhere.  Programmatically, it's a plain object.  More importantly, properties can take things an attribute can't hold:  `headers` can be any object your code already has, with no need to park it on `globalThis` and reference it via the `globalThis://` protocol, as the "Support for headers and body" example does.  And `baseLink` and `headerFields` can take the elements themselves (or `WeakRef`s to them), id or no id.
2. **Less stringifying and parsing.**  The framework serializes the settings to JSON, and be-reformable parses them back and resolves any protocol references.  Programmatically, the values are simply assigned.
3. **Less overhead monitoring attributes.**  The attribute approach relies on be-hive / mount-observer watching the DOM for forms that carry (or gain) a be-reformable attribute.  `def.js` just registers the config, and the enhancement is attached exactly when, and to exactly the forms, your code says.

Either way, it is the **same enhancement**, with the same defaults (update on `input`, `fetch-ready` events), and the two can be mixed in one app:  attributes for server-rendered islands, programmatic attachment inside client-rendered components.

### Registration

```JS
import { defBeReformable } from 'be-reformable/def.js';
const emc = await defBeReformable(document.body); // or a shadow root's host, for a scoped registry
```

### Attribute → property mapping

Each key of the `be-reformable` JSON attribute is a property of the same name.  The separate attributes map as follows:

| Attribute                                              | Property        | Notes |
|--------------------------------------------------------|-----------------|-------|
| `be-reformable-base-link` / `"baseLink"`               | `baseLink`      | The id of a `<link>` whose `href` is the base URL.  Programmatically, may also be the link element itself, or a `WeakRef` to it. |
| `"baseURL"`                                            | `baseURL`       | Alternative to `baseLink`. |
| `be-reformable-path` / `"path"`                        | `path`          | e.g. `'api/v2/:operation/:expression'` |
| `be-reformable-headers` / `"headers"`                  | `headers`       | Any object -- no `globalThis://` indirection needed.  Never mutated. |
| `"headerFields"`                                       | `headerFields`  | Array of selectors (`'#myHeader'`).  Programmatically, entries may also be input elements, or `WeakRef`s to them, mixed with selectors. |
| `"updateOn"`                                           | `updateOn`      | `'input'` (default), `'change'` or `'submit'` |
| `be-reformable-submit-options` / `"submitOptions"`     | `submitOptions` | |

### Declarative -- via enh.set

```JS
// equivalent to the BaseLink example in "Example 1" above
form.enh.set.beReformable.baseLink = 'newton-microservice';
form.enh.beReformable.path = 'api/v2/:operation/:expression';
```

Only the first property needs to go through `.set`, which triggers attachment.  This works whether it runs before or after `defBeReformable` is called.

### Imperative -- via enh.get()

```JS
Object.assign(form.enh.get(emc), {
    baseLink: linkElement,              // the element itself -- no id needed
    path: 'api/v2/:operation/:expression',
    headers: {myCustomHeader: 'goodbye'},
    headerFields: [headerInput],        // an element, a WeakRef to one, or a selector
});
```

### Passing elements directly

Elements passed in `baseLink` or `headerFields` are only ever held **weakly**.  If one is removed from the DOM and garbage collected, it is skipped (a collected header field contributes no header) -- never an error.  A header field element is named by its `data-id`, then its `id`, then its `name` attribute, and failing all of those, by its position in the array.

### Gotchas that differ from the attribute path

The enhancement key is `beReformable` when attached programmatically (`form.enh.beReformable`), rather than `🍺` when attached via the emoji attributes.

See [demo/Programmatic](demo/Programmatic/) for runnable examples.

<!-- ## Support for in-place editing

To enable a dialog box to appear, that allows for editing form -->


## [Import Maps](https://github.com/bahrus/be-reformable/blob/baseline/imports.html)


## Viewing Locally

Any web server that serves static files with server-side includes will do but...

1. Install git
2. Fork/clone this repo
3. Install node.js
4. Open command window to folder where you cloned this repo
5. > git submodule add https://github.com/bahrus/types.git types
6. > git submodule update --init --recursive
7. > npm install
8. > npm run serve
9. Open http://localhost:8000/demo/ in a modern browser

## Importing in ES Modules:

```JavaScript
import 'be-reformable/be-reformable.js';

```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.run/be-reformable';
</script>
```


