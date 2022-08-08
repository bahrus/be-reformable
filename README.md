# be-reformable

be-reformable is a web component that progressively enhances the built-in form element. It uses [be-decorated](https://github.com/bahrus/be-decorated) as the underpinning approach, as opposed to the controversial "is" extension.

## [Demo](https://codepen.io/bahrus/pen/eYEZOXm)

<a href="https://nodei.co/npm/be-reformable/"><img src="https://nodei.co/npm/be-reformable.png"></a>

## Example 1:  Path binding "from a distance"

Let's see how we can use be-reformable, to work with the [newton advanced math micro service](https://newton.vercel.app/), declaratively.

```html
<link id=newton-microservice rel=preconnect href=https://newton.now.sh/ >
<form be-reformable='{
    "base-link": "newton-microservice",
    "path": ["api/v2/", "operation", "/", "expression"],
    "autoSubmit": true,
}'
    target="json-viewer[-object]"
>
    <label for=operation>Operation:</label>
    <input id=operation value=integrate>
    <label for=expression>Expression:</label>
    <input id=expression value="x^2">
</form>
<json-viewer -object></json-viewer>
<noscript>
<iframe name="json-viewer[-object]"></iframe>
</noscript>
```

If target isn't found, or isn't specified, the form will apply the underlying submit mechanism.

The "path" value is an "interpolation from a distance" expression -- it alternates between hardcoded strings, and names of input elements it expects to find in oForm.elements.

be-reformable examines the content-type header of the response, and parses to json when "json" is found in that string.

"base-link" is optional, but allows for easy management of common base API URL's across the application.  The link tag should probably go in the head tag of index.html (typically).

Another optional parameter not shown above is "init" which allows for binding to an object that specifies the second parameter (init / reqInit) of the fetch request.  To hardcode this parameter, use initVal.

## Example 2:  Path binding with explicit markup support

Sometimes it is useful to allow form elements to "add themselves" to the path, just as form elements can add themselves to the query string.  This allows for dynamic form elements to be added.

```html
<link id=newton-microservice rel=preconnect href=https://newton.now.sh/ >
<form be-reformable='{
    "base-link": "newton-microservice",
    "path": true,
    "autoSubmit": true,
}'
    target="json-viewer[-object]"
>
    <label for=operation>Operation:</label>
    <input data-path-idx=0 data-path-lhs="api/v2/" id=operation value=integrate>
    <label for=expression>Expression:</label>
    <input data-path-idx=1 data-path-lhs="/" id=expression value="x^2">
</form>
<json-viewer -object></json-viewer>
<noscript>
<iframe name="json-viewer[-object]"></iframe>
</noscript>
```

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

## Support for HTML output, with optional trans-render based transforms

```html
    <form
        class='main-form'
        action="https://o2h-cw.bahrus.workers.dev/"
        target="[-innerHTML]" 
        be-reformable='{
            "autoSubmit": false,
            "path": ["", "proxy-to"],
            "transform": {
                "input": [{},{},{"a": ["b"]}]
            }
        }'
        be-valued
    >
        <label>
            <span>Proxy to:</span> 
            <input autofocus be-focused required name='proxy-to' type='url'>
        </label>
        <label>
            <span>Output config:</span>
            <input name="x38d47cd9-8a95-4037-9e71-d63f6416a6d5" value="https://unpkg.com/o2h-cw/src/o2hConfig.json">
        </label>
        <label be-typed='{
            "beReformable": true
        }' be-clonable be-delible><span>[Set name of first parameter]</span></label>
        <button type='submit'>Submit</button>
    </form> 
    <div -innerHTML></div>
```

## Support POST with body 

```html
<form 
    action="a.html"
    target="[-innerHTML]"
    method="post" be-reformable='{
    "body": "my-body",
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



