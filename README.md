# nodejs-tape
> a nodejs framework

#### Install
```
> npm install nodejs-tape --save-dev
```

#### Usage
start
```js
// app.js
const Tape = require('nodejs-tape');
Tape.start({
    root: __dirname,
    name: "nodejs-tape",
    port: 3000,
    logs: "./logs",
    views: "./views",
    static: [
        "./public",
        "./bower_components",
        "./assets"
    ],
    routes: [
        "./routes"
    ],
    beforeRoute: [
        function (req, res, next) {
            return next();
        }
    ],
    afterRoute: [
        function (err, req, res, next) {
            let _Error = {
                code: err.code || err.status || 500,
                msg: err.msg || err.toString(),
            }
            if (!_Error.code) {
                _Error.code = 500;
                _Error.msg = 'Server Error';
            }
            res.json(_Error);
        }
    ]
})
```
router
```js
'use strict';

exports.routes = {
  '/': { get: 'index' }
}

exports.index = function (req, res) {
  res.send('Hello World');
}
```