# body-bson
express/koa middleware to parse bson body. 

## Example
For koa:
```javascript
var Koa = require('koa');
var bodyBson = require('body-bson');
 
var app = new Koa();
app.use(bodyBson());
 
app.use(async ctx => {
  // the parsed body will store in ctx.request.body
  // if nothing was parsed, body will be undefined
  // body may contain value of bson types 
  var body = ctx.request.body;
});
```

For express
```javascript
var express = require('express')
var bodyBson = require('body-bson')
 
var app = express()
 
// parse application/bson
app.use(bodyBson.json())
 
app.use(function (req, res) {
  // the parsed body will store in req.body
  // if nothing was parsed, body will be undefined
  // body may contain value of bson types 
  var body=  req.body;
})
```

## API

### `bodyBson`
```javascript
var bodyBson = require('body-bson')
```
The bodyBson function is a factory to create middleware. 

```javascript
app.use(bodyBson(option))
```
The middleware will populate the `request.rawBody` 
property with the parsed body when the Content-Type request header matches the type option(default to 
`application/bson`), nothing would be modified if the Content-Type was not matched, or an error occurred.

### `bodyBson.bson`

The default bson instance used by bodyBson. It's exported for convenience.

### options

### `bson`
Controls the bson instance to deserialize the body. 
One method is required for the instance: `bson.deserialize(buffer)`. 
Defaults to instance created by `bson@1.1.0`.

### `limit`

Controls the maximum request body size. If this is a number, then the value specifies the number of bytes; if it is a
 string, the value is passed to the `bytes` library for parsing. Defaults to '10mb'.
 
 ### `type`
 
 Controls the matching Content-Type headers, can pass a string or an array of strings. Defaults to `'application/bson'`.

### `rawBody`
Controls whether to generate `request.rawBody` to represent raw buffer received. `request.rawBody` will only be generated if `request.rawBody` should be generated. Defaults to `false`.
