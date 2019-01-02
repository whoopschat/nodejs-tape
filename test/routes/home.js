'use strict';
const Tape = require('../../index');

exports.routes = {
  '/': { get: 'index' },
  '/upload': { post: Tape.createUploader() },
}

exports.index = function (req, res, next) {
  res.send('Hello World <br> SERVER ROOT : ' + Tape.getConfig().root);
}