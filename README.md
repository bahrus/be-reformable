# be-reformable (🍺)

*be-reformable* is a custom enhancement that progressively enhances the built-in form element, making attributes/properties like action dynamic.  It does not do anything fetch related, leaving that for other components / enhancements.  It provides the mechanics of specifying what the fetch parameters should be, and quietly suggests the appropriate time to perform said fetch.

It uses [be-enhanced](https://github.com/bahrus/be-enhanced) as the underpinning approach, as opposed to the controversial "is" extension.

[![Playwright Tests](https://github.com/bahrus/be-reformable/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-reformable/actions/workflows/CI.yml)
[![NPM version](https://badge.fury.io/js/be-reformable.png)](http://badge.fury.io/js/be-reformable)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-reformable?style=for-the-badge)](https://bundlephobia.com/result?p=be-reformable)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-reformable?compression=gzip">

## [Demo](https://codepen.io/bahrus/pen/eYEZOXm)


## Example 1:  Making the action property dynamic

Let's see how we can use *be-reformable* to work with the input elements which don't user the name attribute, but rather a custom attribute starting with ":".  We bind to th e  [newton advanced math micro service](https://newton.vercel.app/), declaratively.  By itself, this enhancement will not make the form fully functional for this service (as it doesn't) touch fetch or anything

```html
<link id=newton-microservice rel=preconnect href=https://newton.now.sh/ >

<form
    be-reformable='{
        "baseLink": "newton-microservice",
        "path": "api/v2/:operation/:expression",
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
</form>
```

The "path" value follows the [URL Pattern syntax](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API).

"base-link" is optional, but allows for easy management of common base API URL's across the application.  The link tag should probably go in the head tag of index.html (typically).

What *be-reformable* does is:

1. Be default, adds "input" event to the adorned form element.
2. If the form's checkValidity() is false, ignores the event.
2. When the event occurs, and checkValidity() is true, it uses the baseLink + path to set the action value of the form element.
   1.  It pulls in all the form associated custom elements and/or built-in input elements referenced by the path property.
   2.  Forms the compound string and sets the action property/attribute.
3. Triggers event "be-fetching" which provides the recommended url and options parameters.

## Editing JSON-in-HTML

> [!NOTE]
> A [VSCode plug-in](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) is available to make editing json-in-html more pleasant.  This extension works with the web interface of vscode.

*be-reformable* is a rather lengthy name, and if it appears frequently within an application, could get tiresome to have to type.  It is the canonical name, but developers can easily define alternative names.  This package provides one suc alternative:

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


## Support for headers and body [TODO]

Hardcoded:

```html
<form 
    method="post" 
    be-reformable='{
        "headers": {
            "Accept": "application/json",
            "Authorization": "sessionStorage://auth?.bearerTokenKey",
            "Content-Type": "indexedDB://db/store?.key",
            "User-Agent": "globalThis://navigator?.userAgent",
            ":": ":warning,:accept-language"
        }
}'>
    <input :warning value="199 Miscellaneous warning">
    <input :accept-language value="de; q=1.0, en; q=0.5">
    <label>
        <textarea name=hello></textarea>
    </label>
    
    <button type='submit'>submit</button>
</form>

<div -innerHTML>

</div>
```

> [!NOTE]
> Other components / enhancements that leverage this enhancement, and actually perform the fetch should counsider use of [be-hashing-out](https://github.com/bahrus/be-hashing-out) or some other security mechanism if there's any sense of danger that justifies that additional security check.


```html
<form be-reformable='{
    "headers": true,
}'>
    <input data-header-name=header1>
    <input data-header-name=header2>
</form>
```

## [Import Maps](https://github.com/bahrus/be-reformable/blob/baseline/imports.html)


## Viewing Locally

To view this element locally:

1.  Install git, npm
2.  Clone or fork this git repo.
3.  Open a terminal from the folder created in step 2.
4.  Install Python v3 or later
5.  Run npm install
6.  Run npm run serve
7.  Open http://localhost:8000/demo/dev


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


