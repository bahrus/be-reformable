# be-reformable

```html
<link id=newton-microservice rel=preconnect href=https://newton.now.sh/ >
<form be-reformable='{
    "base-link": "newton-microservice",
    "path": ["api/v2/", "operation", "/", "expression"],
    "autoSubmit": true
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