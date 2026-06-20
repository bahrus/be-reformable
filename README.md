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

be-reformable supports protocol-prefixed values for resolving configuration from external sources. This is powered by [assign-gingerly](https://github.com/bahrus/assign-gingerly)'s protocol resolution and `"..."` spread key support.

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


