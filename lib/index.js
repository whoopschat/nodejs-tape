'use strict';

var _ = require('underscore');
var ect = require('ect');
var express = require('express');
var router = express.Router();
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var helmet = require('helmet');
var cors = require('cors');

var Route = require('./_route')();
var Logger = require('./_logger');

var __use = function (app, middleware) {
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


var __build = function (config) {

  if (typeof (config) == 'string') {
    var _config = require(config);
    _config.root = path.dirname(config);
    config = _config;
  }

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      _.extend(config, arguments[i]);

    }
  }

  config.viewEngine = config.viewEngine || 'html';

  var app = express();

  var env = config.env || process.env.NODE_ENV || 'development'

  var logger = Logger({
    root: path.join(config.root, config.logs)
  });
  var errLogger = logger.get('error');
  var accessLogger = logger.get('access');

  app.set('name', config.name);
  app.set('port', config.port);
  app.set('views', path.join(config.root, config.views));
  app.set('view engine', config.viewEngine);

  app.use(bodyParser.json({ limit: '10000kb' }));
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

  if (config.beforeRoute) {
    __use(app, config.beforeRoute);
  }

  // register routes
  if (config.routes instanceof Array) {
    for (var i in config.routes) {
      Route.inject(router, path.join(config.root, config.routes[i]));
    }
  } else if (typeof (config.routes == 'string')) {
    Route.inject(router, path.join(config.root, config.routes));
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

  return app;
}

var Tape = {

  start: function () {
    var app = __build.apply(null, arguments);
    app.listen(app.get('port'));
    console.log(app.get('name') + ' started on port ' + app.get('port'));
    return app;
  }

}

module.exports = Tape;
