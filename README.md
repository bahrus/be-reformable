# be-reformable

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



