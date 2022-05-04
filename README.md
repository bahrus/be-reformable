# be-reformable

be-reformable is a web component that progressively enhances the built-in form element. It uses [be-decorated](https://github.com/bahrus/be-decorated) as the underpinning approach, as opposed to the controversial "is" approach.

## [Demo](https://codepen.io/bahrus/pen/eYEZOXm)

<a href="https://nodei.co/npm/be-reformable/"><img src="https://nodei.co/npm/be-reformable.png"></a>

## Syntax example - Using a Micro Service API

Let's see how we can use be-reformable, to work with the [newton advanced math micro service](https://newton.vercel.app/), declaratively.

```html
<link id=newton-microservice rel=preconnect href=https://newton.now.sh/ >
<form be-reformable='{
    "base-link": "newton-microservice",
    "path": ["api/v2/", "operation", "/", "expression"],
    "autoSubmit": true,
    "as": "json"
}'
    target="json-viewer[-object]"
>
    <label for=operation>Operation:</label>
    <input id=operation value=integrate>
    <label for=expression>Expression:</label>
    <input id=expression value="x^2">
</form>
<json-viewer -object></json-viewer>
<iframe name="json-viewer[-object]"><!-- backup if no JS --></iframe>
```

The "path" value is an "interpolation from a distance" expression -- it alternates between hardcoded strings, and names of input elements it expects to find in oForm.elements.

The "as" property defaults to json, so isn't actually needed to be specified.  The other option is "text", if the desire is to set the innerHTML of a target element.

"base-link" is optional, but allows for easy management of common base API URL's across the application.  The link tag should probably go in the head tag of index.html (typically).

Another optional parameter not shown above is "init" which allows for binding to an object that specifies the second parameter (init / reqInit) of the fetch request.  To hardcode this parameter, use initVal.

## Another example

The following markup scores 100% from Lighthouse:

```html
<form>
    <label for='url'>URL:</label>
    <input id='url' type='url' required>
</form>
<template be-switched='{
    "if": {
        "observe": "form",
        "on": "input",
        "vft": "querySelector|input.checkValidity|"
    }
}'>
    <form be-reformable='{
        "autoSubmit": true,
        "url": {
            "observe": "form",
            "on": "input",
            "vft": "querySelector|input.value"
        },
        "as": "json"
    }'
    target='xtal-editor[-input-obj]'></form>
    <xtal-editor -input-obj></xtal-editor>
    <script type='module' crossorigin='anonymous'>
        import 'https://esm.run/xtal-editor@0.0.162';
        import 'https://esm.run/be-reformable@0.0.39';
    </script>
</template>
<script type=module crossorigin='anonymous'>
    import 'https://esm.run/be-switched@0.0.68';
</script>
```

What this does:  

1.  Until a url is entered, the only JS loaded is for be-switched.  Be-switched enables the template to not load until the input is valid.
2.  Once the input is valid, the template is instantiated, and the be-reformable library is loaded.  The form auto submits the url entered by the user.
3.  The result of the fetch is parsed as JSON, and the JSON is passed to the xtal-editor component.

## Support for cancelling previous calls [TODO]

## Support for debouncing [TODO]

## Support POST with body [TODO]

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
            "be-decorated/": "../node_modules/be-decorated/"
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



