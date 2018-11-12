
var env = process.env.NODE_ENV || 'development';

const Tape = require('../index');

Tape.start({
    "name": "mobydick-test-server",
    "port": 3000,
    "logs": "./logs",
    "views": "./views",
    "static": [
        "./public",
        "./bower_components"
    ],
    "routes": [
        "./routes"
    ],
}, {
        root: __dirname,

        beforeRoute: [
            function (req, res, next) {
                return next();
            }
        ],

        afterRoute: [
            function (err, req, res, next) {

                res.status(err.status || 500);

                var customErr = (env != 'production') ? err : {
                    code: err.status,
                    msg: 'Server Error'
                }

                if (req.xhr) {
                    res.send(customErr);
                } else {
                    res.render('error', {
                        error: customErr
                    });
                }
            }
        ]
    })