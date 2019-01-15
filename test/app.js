const Tape = require('../index');

Tape.start({
    root: __dirname,
    name: "nodejs-tape",
    port: 3000,
    logs: "./logs",
    views: "./views",
    tokenExpireIn: 60 * 86400,
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
                msg: err.msg || err.message || err.toString(),
            }
            if (!_Error.code) {
                _Error.code = 500;
                _Error.msg = 'Server Error';
            }
            res.json(_Error);
        }
    ]
})