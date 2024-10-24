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

The "path" value is an "interpolation from a distance" expression -- it alternates between hardcoded strings, and names of input elements it expects to find in oForm.elements.

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
        <textarea name='my-body'>{"hello": "world"}</textarea>
    </label>
    
    <button type='submit'>submit</button>
</form>

<div -innerHTML>

</div>
```

## Support for xslt transform of imported HTML [TODO]

First do xslt, then DTR transform.

## Trigger event on target [Untested]

[TODO] Example

## Filter out input elements whose value matches default value


```html
<form be-reformable='{
    "filterOutDefaultValues": true,
}'>
    <input data-optional=true name=prop1 value=defaultValue1>
    <input name=prop2 value=differentValue>
</form>
```

If prop1 isn't modified from the original value, the parameter is not sent.


## Support for headers


```html
<form be-reformable='{
    "headers": true,
}'>
    <input data-header-name=header1>
    <input data-header-name=header2>
</form>
```



## Support for cancelling previous calls [Untested]

## Support for debouncing [TODO]



## Staying Kosher

The attribute be-reformable can be replaced with data-be-reformable.

## Editing JSON-in-HTML

A web-friendly [VSCode plug-in](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) is available to make editing json-in-html more pleasant.

## Import Maps

The following import map is needed for non-bundling environments:

```html
<script type=importmap>
    {
        "imports": {
            "trans-render/": "../node_modules/trans-render/",
            "xtal-element/": "../node_modules/xtal-element/",
            "be-decorated/": "../node_modules/be-decorated/",
            "be-observant/": "../node_modules/be-observant/",
            "be-hive/": "../node_modules/be-hive/"
        }
    }
</script>
```

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


