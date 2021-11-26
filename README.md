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

Another optional parameter not shown above is "reqInit" which allows for specifying details about the fetch request.

[TODO]  Support POST with body

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



