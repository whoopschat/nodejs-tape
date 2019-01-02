'use strict';

const fs = require('fs');
const ect = require('ect');
const path = require('path');
const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const favicon = require('serve-favicon');
const underscore = require('underscore');

const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);

const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const cors = require('cors');

const logger = require('./_logger');
const router = require('./_router');
const storage = require('./_storage');

let config = {};

function __config(conf) {
    if (typeof (conf) == 'string') {
        var _config = require(conf);
        _config.root = path.dirname(conf);
        Object.assign(config, _config)
    } else {
        Object.assign(config, conf)
    }
}

const __use = function (app, middleware) {
    if (!middleware) {
        return;
    }

    if (typeof (middleware) == 'function') {
        app.use(middleware);
    }

    if (middleware instanceof Array) {
        for (var i in middleware) {
            __use(app, middleware[i]);
        }
    }
}

function start(conf) {

    __config(conf);

    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            underscore.extend(config, arguments[i]);
        }
    }

    storage.config({ root: config.root });

    config.viewEngine = config.viewEngine || 'html';

    var app = express();

    var env = config.env || process.env.NODE_ENV || 'development'

    var log = logger({ root: path.join(config.root, config.logs) });

    var errLogger = log.get('error');

    var accessLogger = log.get('access');

    app.set('name', config.name);
    app.set('port', config.port);
    app.set('views', path.join(config.root, config.views));
    app.set('view engine', config.viewEngine);

    app.use(bodyParser.json({ limit: '10000kb' }));
    app.use(bodyParser.xml({
        limit: '10000kb',
        xmlParseOptions: {
            normalize: true,     // Trim whitespace inside text nodes
            explicitArray: false // Only put nodes in array if > 1
        }
    }));

    app.use(cors());

    var engine = config.engine || ect({
        watch: true,
        root: path.join(config.root, config.views)
    }).render;
    app.engine(config.viewEngine, engine);

    if (config.favicon) {
        app.use(favicon(path.join(config.root, config.favicon)));
    }

    /* default logger */
    app.use(morgan(env == 'development' ? 'dev' : 'common', {
        skip: function (req, res) {
            return res.statusCode < 400;
        }
    }));

    if (config.static) {
        for (var i in config.static) {
            app.use(express.static(path.join(config.root, config.static[i])));
        }
    }

    app.use(helmet());
    app.use(flash());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));

    __use(app, [
        function (req, res, next) {
            req.config = config;
            req.storage = storage;
            return next();
        }
    ]);

    if (config.beforeRoute) {
        __use(app, config.beforeRoute);
    }

    // register routes
    if (config.routes instanceof Array) {
        for (var i in config.routes) {
            router.inject(router, path.join(config.root, config.routes[i]));
        }
    } else if (typeof (config.routes == 'string')) {
        router.inject(router, path.join(config.root, config.routes));
    }

    app.use('/', router);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err404 = new Error('Not Found');
        err404.status = 404;
        next(err404);
    });

    // error logger
    app.use(function (err, req, res, next) {
        if (err.status == 404) {
            accessLogger && accessLogger.info(req._remoteAddress + ' 404 GET ' + req.originalUrl);
        } else {
            errLogger && errLogger.error(err.stack);
        }
        next(err);
    });

    if (config.afterRoute) {
        __use(app, config.afterRoute);
    }

    app.listen(app.get('port'));
    console.log(app.get('name') + ' started on port ' + app.get('port'));

    return app;
}

function __mkdirsSync(dirname, mode) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (__mkdirsSync(path.dirname(dirname), mode)) {
            fs.mkdirSync(dirname, mode);
            return true;
        }
    }
    return false;
}

function createUploader(dir = 'tmp', errMsg = { code: -1, msg: '无法找到文件' }) {
    let multerStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            let uploadDir = path.join(req.config.root, 'assets', dir);
            __mkdirsSync(uploadDir);
            return cb(null, uploadDir);
        },
        filename: function (_req, file, cb) {
            var newName = Date.now() + '-' + Math.random().toString(36).slice(2, 9) + path.extname(file.originalname)
            return cb(null, newName);
        }
    });
    let preUpload = multer({ storage: multerStorage }).single('upload');
    let afterUpload = function (req, res, next) {
        if (!req.file) {
            return res.json(errMsg);
        }
        let filepath = path.join('/', 'assets', dir, req.file.filename);
        res.json({
            url: filepath,
            ext: path.extname(req.file.originalname)
        });
    }
    return [preUpload, afterUpload];
}

module.exports = {
    start,
    createUploader,
}