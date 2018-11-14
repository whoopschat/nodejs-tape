'use strict';

exports.routes = {
  '*': { all: 'index' }
}

exports.index = function (req, res, next) {
  res.send('Hello World');
}