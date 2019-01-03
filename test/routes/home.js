'use strict';
const Tape = require('../../index');

exports.routes = {
  '/': { get: ['index'] },
  '/login': { get: ['login'] },
  '/user': { get: [Tape.createAuthRoute(), 'user'] },
  '/upload': { post: [Tape.createUploadRoute()] },
}

exports.login = function (req, res, next) {
  res.send('token : ' + Tape.createToken({
    _id: '9527',
    type: 'user'
  }));
}

exports.user = function (req, res, next) {
  res.send('user : ' + JSON.stringify(req.authUser));
}

exports.index = function (req, res, next) {
  res.send('hello world <br> server root : ' + Tape.getConfig().root);
}