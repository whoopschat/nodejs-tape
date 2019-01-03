'use strict';
const Tape = require('../../index');

exports.routes = {
  '/': { get: ['index'] },
  '/login': { get: ['login'] },
  '/user': { get: [Tape.createAuthRoute(), 'user'] },
  '/upload': { post: [Tape.createUploadRoute()] },
}

exports.login = function (req, res, next) {
  res.send('token : ' + Tape.createAuthToken('user9527'));
}

exports.user = function (req, res, next) {
  res.send('user : ' + req.authUserId);
}

exports.index = function (req, res, next) {
  res.send('hello world <br> server root : ' + Tape.getConfig().root);
}