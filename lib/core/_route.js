'use strict';

var fs = require('fs');
var path = require('path');

var _injectRegRoute = function (handler, reg) {
  if (!reg) {
    return handler;
  }
  return [function (req, res, next) {
    let regexp = RegExp(reg);
    if (regexp.test(req.path)) {
      handler(req, res, next);
    } else {
      next();
    }
  }]
};

var _injectHandlers = function (handler, reg) {
  if (typeof (handler) == 'function') {
    return _injectRegRoute(handler, reg)
  } else if (handler instanceof Array) {
    var handlers = [];
    for (var i in handler) {
      var h = _injectHandlers(handler[i], reg);
      if (h) {
        handlers = handlers.concat(h);
      }
    }
    if (handlers.length) {
      return handlers;
    }
  }
  return null;
}

var _createRouteHandlers = function (ctrl, handler) {
  if (typeof (handler) == 'function') {
    return handler
  } else if (typeof (handler) == 'string' && typeof (ctrl[handler]) == 'function') {
    return ctrl[handler]
  } else if (typeof (handler) == 'string' && ctrl[handler] instanceof Array) {
    return ctrl[handler]
  } else if (handler instanceof Array) {
    var handlers = [];
    for (var i in handler) {
      var h = _createRouteHandlers(ctrl, handler[i]);
      if (h) {
        handlers = handlers.concat(h);
      }
    }
    if (handlers.length) {
      return handlers;
    }
  }
  return null;
}

var _injectController = function (router, filepath) {
  try {
    var ctrl = require(filepath);
    if (ctrl.routes) {
      for (var route in ctrl.routes) {
        var methods = ctrl.routes[route];
        for (var method in methods) {
          if (method == 'reg') {
            continue;
          }
          var handlers = _createRouteHandlers(ctrl, methods[method]);
          handler && router[method](route, _injectHandlers(handlers, methods['reg']));
        }
      }
    }
  } catch (e) {
    console.log(filepath, e.stack);
  }
}

var route = {
  inject: function (router, dir, options) {
    var verbose = options ? options.verbose : null;
    var filter = (options && options.filter) ? options.filter : function (file) {
      return file.indexOf('.') !== 0;
    }
    if (fs.lstatSync(dir).isFile()) {
      verbose && console.log('\n   %s:', file);
      _injectController(router, dir);
    } else {
      fs.readdirSync(dir)
        .filter(filter)
        .sort()
        .forEach(function (file) {
          verbose && console.log('\n   %s:', file);
          _injectController(router, path.join(dir, file));
        });
    }
    return router;
  }
}

module.exports = route
