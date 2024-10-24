# be-reformable (🍺)

*be-reformable* is a custom enhancement that progressively enhances the built-in form element, making attributes/properties like action and target dynamic.  It does not do anything fetch related, leaving that for other components / enhancements.

It uses [be-enhanced](https://github.com/bahrus/be-enhanced) as the underpinning approach, as opposed to the controversial "is" extension.

[![Playwright Tests](https://github.com/bahrus/be-reformable/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-reformable/actions/workflows/CI.yml)
[![NPM version](https://badge.fury.io/js/be-reformable.png)](http://badge.fury.io/js/be-reformable)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-reformable?style=for-the-badge)](https://bundlephobia.com/result?p=be-reformable)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-reformable?compression=gzip">

## [Demo](https://codepen.io/bahrus/pen/eYEZOXm)


## Example 1:  Making the action property dynamic

Let's see how we can use be-reformable to work with the [newton advanced math micro service](https://newton.vercel.app/), declaratively.  By itself, this enhancement will not make the form fully functional for this service (as it doesn't) touch fetch or anything

```html
<link id=newton-microservice rel=preconnect href=https://newton.now.sh/ >

<form
    be-reformable='{
        "baseLink": "newton-microservice",
        "path": "api/v2/:@operation/:@expression",
    }'
>
    <label for=operation>
        Operation:
        <input name=operation value=integrate>
    </label>
    
    <label for=expression>
        Expression:
        <input name=expression value="x^2">
    </label>
    
    <noscript>
        <button type=submit>Submit</button>
    </noscript>
</form>
<noscript>
<iframe name="json-viewer[-object]"></iframe>
</noscript>
```

If target isn't found, or isn't specified, the form will apply the underlying submit mechanism.

The "path" value follows the [URL Pattern syntax](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API).

be-reformable examines the content-type header of the response, and parses to json when "json" is found in that string.

"base-link" is optional, but allows for easy management of common base API URL's across the application.  The link tag should probably go in the head tag of index.html (typically).

Another optional parameter not shown above is "init" which allows for binding to an object that specifies the second parameter (init / reqInit) of the fetch request.  To hardcode this parameter, use initVal.


## Support for headers and body [TODO]

```html
<form 
    action="a.html"
    target="[-innerHTML]"
    method="post" be-reformable='{
    "bodyName": "my-body",
    "headers": true
}'>
    <input type='hidden' data-header-name='Content-Type' value='application/json'>
    <label>
        JSON:
        <textarea hidden name='my-body'>{"hello": "world"}</textarea>
    </label>
    
    <button type='submit'>submit</button>
</form>

<div -innerHTML>

</div>
```


```html
<form be-reformable='{
    "headers": true,
}'>
    <input data-header-name=header1>
    <input data-header-name=header2>
</form>
```



## Editing JSON-in-HTML

A web-friendly [VSCode plug-in](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) is available to make editing json-in-html more pleasant.

## Import Maps


## Viewing Locally

To view this element locally:

1.  Install git, npm
2.  Clone or fork this git repo.
3.  Open a terminal from the folder created in step 2.
4.  Run npm install
5.  Run npm run serve
6.  Open http://localhost:3030/demo/dev


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


