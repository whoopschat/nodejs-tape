'use strict';

exports.routes = {
  '*': { all: 'index' }
}

exports.index = function (req, res) {
  res.send('Hello World');
}