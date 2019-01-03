# nodejs-tape
> express-based nodejs library

#### Version
```
1.0.0
```

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
    upload: "./assets/upload",
    storage: "./assets/storage",
    tokenSecretKey: "token-secret-key",
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
// routes/index.js
'use strict';
const Tape = require('nodejs-tape');

exports.routes = {
  '/': { get: 'index' },
  '/upload': { post: Tape.createUploadRoute() },
}

exports.index = function (req, res, next) {
  res.send('hello world <br> server root : ' + Tape.getConfig().root);
}
```