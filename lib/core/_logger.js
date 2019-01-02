'use strict';

var path = require('path');
var moment = require('moment');
var winston = require('winston');
var underscore = require('underscore');

var DailyRotateFile = require('winston-daily-rotate-file');

var LoggerManager = function (config) {

  this._loggers = {};

  this._config = {

    root: null,

    transportType: 'DailyRotateFile',

    transport: {
      name: null,
      filename: null,
      colorize: false,
      datePattern: 'YYYY-MM-DD',
      maxsize: 500000,
      level: 'info',
      json: false,
      timestamp: function () {
        return moment().format('YYYY-MM-DD HH:mm:ss');
      }
    }
  };

  underscore.extend(this._config, config);

  this._createTransport = function (options) {

    var config = underscore.clone(this._config.transport);
    config = underscore.extend(config, options);
    config.filename = path.join(this._config.root, options.name + '.log');

    var transport = new DailyRotateFile(config);
    return transport;
  }

  this.get = function (name, options) {

    if (this._loggers[name]) {
      return this._loggers[name];
    }

    options = options || {};

    var transports = options.transports || [{
      name: name
    }]

    var transList = [];
    for (var i in transports) {
      transList.push(this._createTransport(transports[i]));
    }

    this._loggers[name] = winston.createLogger({
      transports: transList
    });

    return this._loggers[name];
  }
}

module.exports = function (config) {
  return new LoggerManager(config);
};
