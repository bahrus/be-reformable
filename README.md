# be-reformable (🍺)

*be-reformable* is a custom element enhancement that (progressively) enhances the built-in form element, making attributes/properties like action dynamic.  It does not do anything fetch related, leaving that for other components / enhancements.  It provides the mechanics of specifying what the fetch parameters should be, and quietly suggests the appropriate time to perform said fetch.

It uses [be-enhanced](https://github.com/bahrus/be-enhanced) as the underpinning approach, as opposed to the controversial "is" extension.

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

Hardcoded:

```html
<script type=module>
    (await import('trans-render/lib/weave.js'))
        .weave({
            Authorization: "sessionStorage://auth?.bearerToken",
            "Content-Type": "indexedDB://db/store?.key",
            "User-Agent": "globalThis://navigator?.userAgent",
            Accept: "application/json"
        })
        .into('rPpwNLcYsUOjFcg+N8lmOA')
        .andWeave({
            baseURL:  "globalThis://newton-microservice/href"
        })
        .into('qmywdO1vr0SwyuIe4fvzxQ');
</script>

<form 
    method="post" 
    be-reformable='{
        "...": "qmywdO1vr0SwyuIe4fvzxQ",
        "headerFields":["#warning", "%accept-language"],
        "headers": {
            "...": "rPpwNLcYsUOjFcg+N8lmOA",
        }
}'>
    <input id=warning value="199 Miscellaneous warning">
    <input part=accept-language value="de; q=1.0, en; q=0.5">
    <label>
        <textarea name=hello></textarea>
    </label>
    
    <button type='submit'>submit</button>
</form>

<div -innerHTML>

</div>
```


The baseURL and headers settings that are weaved in above make use of [Uniform Source Path](https://github.com/bahrus/trans-render/wiki/VIIII.--Uniform-Source-Path) syntax.

These are asynchronous and may not already be set when the rest of the form is ready for submitting.  *be-reformable*, by default, won't issue the "fetch-ready" event until all the values have been retrieved (and are truthy).

To indicate that a header is optional, add a question mark at the end of the key:

```JavaScript
"Content-Type?": "indexedDB://db/store?.key",
```


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


